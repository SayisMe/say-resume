# 02. 실시간 통신 — STOMP / WebSocket

> WebSocket 위에 STOMP 프로토콜을 사용하여 실시간 메시지 송수신, 자동 재연결, Echo 기반 전송 확인 구현

## 핵심 가치

- 연결 끊김 시 자동 재연결 + 모든 구독 자동 복구
- 메시지 발송 후 서버 Echo를 통해 전송 성공 확인
- 공개 채널(알림)과 채팅 채널 분리 구독

---

## 전체 STOMP 아키텍처

```
┌──────────────────────────────────────────────────────────┐
│                    StompProvider                          │
│  (Context Provider — 앱 전체에 연결 상태 제공)            │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              StompClient (Wrapper)               │    │
│  │  - @stomp/stompjs Client 래핑                   │    │
│  │  - Map<destination, Subscription> 관리           │    │
│  │  - 재연결 시 자동 _resubscribe()                │    │
│  └──────────────────────┬──────────────────────────┘    │
└─────────────────────────│────────────────────────────────┘
                          │
               WebSocket Connection
                          │
              ┌───────────▼───────────┐
              │    STOMP Broker       │
              │  (Server-side)        │
              └───────────┬───────────┘
                          │
           ┌──────────────┴──────────────┐
           ▼                             ▼
  /sub/public/{profileId}      /sub/chat/{roomId}
  (알림, 공개 이벤트)           (채팅 메시지)
           │                             │
           ▼                             ▼
  handlePublicMessage()        handleChatMessage()
  - 멤버 변경 알림              - 메시지 저장 (Mutex)
  - 읽음 처리 이벤트            - Delta Sync 트리거
  - 강퇴/초대 이벤트            - 로컬 DB 업데이트
```

---

## 핵심 구현

### 1. StompClient 래퍼 — 자동 재구독

```typescript
// src/libs/stomp/StompClient.ts

class StompClient {
  private _client: Client;
  private _subscriptions = new Map<string, StompClientSubscription>();

  subscribe(destination: string, listener: MessageCallback): string {
    const id = generateId();
    const stompSub = this._client.subscribe(destination, listener);

    // Map에 저장 (재연결 시 재사용)
    this._subscriptions.set(id, {
      destination,
      listener,
      stompSubscription: stompSub,
    });
    return id;
  }

  private _resubscribe() {
    // 재연결 후 모든 구독을 자동으로 복구
    this._subscriptions.forEach((entry, id) => {
      entry.stompSubscription = this._client.subscribe(
        entry.destination,
        entry.listener
      );
    });
  }
}
```

### 2. Echo 기반 메시지 전송 확인

```typescript
// src/libs/stomp/SendChatBase.ts

export function SendChatBase<T>(params: {
  destination: string;
  roomId: string;
  body: T;
}): Promise<{ success: boolean; data: ChatMessageType }> {
  return new Promise((resolve, reject) => {
    const localId = generateLocalId();

    // 1. 서버에서 Echo가 오면 resolve
    const unsubscribe = StompEvent.on('chat-message', (msg) => {
      if (msg.localId === localId) {
        unsubscribe();
        clearTimeout(timeout);
        resolve({ success: true, data: msg });
      }
    });

    // 2. STOMP로 메시지 발송
    stompClient.publish({
      destination: params.destination,
      body: JSON.stringify({ ...params.body, localId }),
    });

    // 3. 5초 타임아웃 — Echo 없으면 실패로 처리
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new Error('Message send timeout'));
    }, 5000);
  });
}
```

### 3. Listenbook — 구독 중인 방 관리

```typescript
// src/libs/stomp/listenbook-store.ts (Zustand)

interface ListenbookState {
  roomIds: Set<string>;
  subscribe: (roomId: string) => void;
  unsubscribe: (roomId: string) => void;
}

const useListenbookStore = create<ListenbookState>((set) => ({
  roomIds: new Set(),

  subscribe: (roomId) => {
    set((state) => ({ roomIds: new Set([...state.roomIds, roomId]) }));
    // 실제 STOMP 구독도 함께 등록
    stompClient.subscribe(`/sub/chat/${roomId}`, handleChatMessage);
  },

  unsubscribe: (roomId) => {
    set((state) => {
      const next = new Set(state.roomIds);
      next.delete(roomId);
      return { roomIds: next };
    });
    stompClient.unsubscribe(`/sub/chat/${roomId}`);
  },
}));
```

---

## 메시지 수신 흐름

```
STOMP Broker에서 메시지 수신
         │
         ▼
  StompClient.onMessage()
         │
         ▼
  StompEvent 이벤트 발행 (EventEmitter 패턴)
         │
    ┌────┴────┐
    ▼         ▼
채팅 메시지  공개 메시지
    │         │
    ▼         │
AsyncMutex   │
획득 시도    │
    │         ▼
    ▼     handlePublicMessage()
handleChatMessage()  ├─ MEMBER_JOINED: 멤버 목록 갱신
    │            ├─ MESSAGE_READ: 읽음 처리
    ▼            └─ KICKED: 채팅방 퇴장 처리
로컬 DB 저장
    │
    ▼
React Query 캐시 무효화
    │
    ▼
UI 자동 갱신
```

---

## 재연결 시나리오

```
네트워크 끊김 감지 (NetInfo)
    │
    ▼
STOMP 연결 해제 이벤트 수신
    │
    ▼
재연결 시도 (지수 백오프)
    │
    ▼
연결 성공
    │
    ▼
_resubscribe() 호출
    │ Map에 저장된 모든 구독 복구
    ▼
chatEngine.activeSync(roomId) 호출
    │ 끊겨 있던 동안의 메시지 동기화
    ▼
정상 동작 재개
```

---

## 이력서 포인트

> **"STOMP(WebSocket) 기반 실시간 메시징 구현.
> Map 기반 subscription 추적으로 재연결 시 모든 구독 자동 복구.
> Echo 기반 전송 확인 패턴으로 메시지 발송 성공/실패를 명확히 처리.
> 공개 채널과 채팅 채널 분리로 관심사 명확히 구분."**

---

## 관련 파일

| 파일 | 설명 |
|------|------|
| `src/context/StompProvider.tsx` | STOMP 연결 관리, 구독 처리 (~854줄) |
| `src/libs/stomp/StompClient.ts` | @stomp/stompjs 래퍼, 자동 재구독 |
| `src/libs/stomp/listenbook-store.ts` | 구독 중인 roomId 목록 (Zustand) |
| `src/libs/stomp/SendChatBase.ts` | Echo 기반 메시지 전송 |

---

## 스크린샷 / 다이어그램

<!-- ![STOMP Flow](./images/stomp-flow.png) -->
<!-- ![Reconnect Demo](./images/reconnect-demo.gif) -->

> 📌 `images/` 폴더에 실시간 메시지 수신 GIF 또는 시퀀스 다이어그램을 추가하세요.
