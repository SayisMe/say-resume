# 01. 오프라인 우선 아키텍처 (Offline-First Architecture)

> 네트워크 상태와 무관하게 앱이 동작하고, 연결 복구 시 자동으로 서버와 동기화되는 아키텍처

## 핵심 가치

- 네트워크 불안정 환경에서도 앱 기능 유지
- UI와 서버 통신 레이어를 완전히 분리
- 일관된 데이터 흐름으로 버그 추적 용이

---

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                        UI Layer                         │
│   (React Native Screens / Components)                   │
└────────────────┬────────────────┬───────────────────────┘
                 │ Write          │ Read
                 ▼                ▼
┌───────────────────┐    ┌──────────────────────┐
│     Action        │    │     Repository        │
│   (진입점)        │    │   (읽기 전용 접근)    │
│                   │    │                       │
│ - 파라미터 정규화 │    │ - 로컬DB 또는 서버   │
│ - 권한 체크       │    │   에서 데이터 제공    │
│ - Engine 라우팅   │    │ - 쿼리 결과 조합      │
└────────┬──────────┘    └──────────────────────┘
         │                         ▲
         ▼                         │
┌───────────────────────────────────────────────┐
│                   Engine                       │
│           (서버 ↔ 로컬 DB 동기화)              │
│                                               │
│  ① 서버 API 호출                              │
│  ② 응답을 로컬 DB에 저장 (upsert)            │
│  ③ React Query 캐시 무효화                   │
│  ④ Session 상태 관리                         │
└──────────┬────────────────────────────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌─────────┐  ┌──────────┐
│ SQLite  │  │  Server  │
│ Local DB│  │   API    │
└─────────┘  └──────────┘
```

---

## 계층별 책임

### 1. Action Layer (`src/libs/offline/actions/`)

UI의 **쓰기** 요청 진입점. 파라미터 정규화 후 Engine으로 라우팅.

```typescript
// chat-action.ts
export const chatAction = {
  sendMessage: (payload: SendMessagePayload) =>
    chatEngine.sendMessage(payload),

  read: (params: { roomId: string }) =>
    chatEngine.read(params),

  deleteMessage: (params: { messageId: string; roomId: string }) =>
    chatEngine.deleteMessage(params),
};
```

**규칙**: UI는 Engine을 직접 호출하지 않는다. 반드시 Action을 통한다.

---

### 2. Engine Layer (`src/libs/offline/engines/`)

핵심 비즈니스 로직. 서버와 로컬 DB 간의 동기화를 담당.

```typescript
// chat-engine.ts (1,061줄 — 가장 복잡한 파일)

class ChatEngine {
  private sessions = new Map<string, ChatSession>();

  async sendMessage(payload: SendMessagePayload) {
    // 1. 로컬 DB에 임시 저장 (local_id 부여)
    const localMsg = await chatRepository.insertLocalMessage(payload);

    // 2. STOMP로 발송 (Echo 대기)
    const result = await SendChatBase({
      destination: `/pub/chat/${payload.roomId}`,
      body: payload,
      roomId: payload.roomId,
    });

    // 3. 서버 Echo 수신 후 로컬 DB 갱신
    await chatRepository.confirmLocalMessage(localMsg.local_id, result.data);

    // 4. React Query 캐시 무효화 → UI 자동 갱신
    queryClient.invalidateQueries({ queryKey: [GET_CHAT_LIST, payload.roomId] });
  }

  async activeSync(roomId: string) {
    const session = this.getOrCreateSession(roomId);

    // Mutex로 중복 실행 방지
    await session.mutex.runExclusive(async () => {
      if (session.activeSyncDone) return; // Double-checked locking

      // 1단계: 개수 기반 동기화
      await this.syncByCount(roomId, session);

      // 2단계: Delta Sync (수정/반응/읽음 처리)
      await this.deltaSync(roomId, session);

      session.activeSyncDone = true;
    });
  }
}
```

---

### 3. Repository Layer (`src/libs/offline/repositories/`)

UI의 **읽기** 요청 처리. 로컬 DB 쿼리 추상화.

```typescript
// chat-repository.ts (808줄)

export const chatRepository = {
  // 최신 N개 메시지 (양방향 스크롤용)
  async takeLatest(params: { roomId: string; limit: number }) {
    const rows = await db.getAllAsync<ChatMessageRow>(
      `SELECT * FROM chat_messages
       WHERE room_id = ? AND remove = 0
       ORDER BY active_id DESC LIMIT ?`,
      [params.roomId, params.limit]
    );
    return { messages: rows.reverse(), hasPrev: rows.length === params.limit };
  },

  // 앵커 메시지 기준 범위 조회 (메시지 검색 후 이동 시)
  async takeRangeById(params: {
    anchorId: string;
    beforeCount: number;
    afterCount: number;
    roomId: string;
  }) { ... },

  // Full-Text Search
  async searchMessages(params: { text: string; roomId?: string }) { ... },

  // JSON 데이터에서 파일 추출
  async searchFiles(params: { fileName?: string; startDate?: string }) { ... },
};
```

---

## 동기화 전략

### 2단계 Active Sync

```
채팅방 진입 시
    │
    ▼
1단계: Count Sync
    ├─ 서버 최신 메시지 개수 확인
    ├─ 로컬 DB 개수와 비교
    └─ 부족한 만큼 페이지 단위로 가져오기 (LIMIT 50)
    │
    ▼
2단계: Delta Sync
    ├─ 마지막 동기화 이후 변경된 메시지만 가져오기
    ├─ 수정된 메시지 업데이트
    ├─ 리액션 업데이트
    └─ 읽음 처리 동기화
    │
    ▼
로컬 DB 업데이트 완료
→ React Query 캐시 무효화
→ UI 자동 리렌더링
```

### 30초 주기 Delta Sync

```typescript
// 채팅방 활성 중 백그라운드 동기화
useEffect(() => {
  const interval = setInterval(() => {
    chatEngine.deltaSync(roomId);
  }, 30_000);
  return () => clearInterval(interval);
}, [roomId]);
```

---

## 이력서 포인트

> **"Flux 패턴 기반 Offline-First 3계층 아키텍처(Action/Engine/Repository) 설계 및 구현.
> 서버 동기화 로직을 UI 레이어에서 완전히 분리하여 유지보수성과 테스트 가능성을 확보.
> 2단계 Active Sync(Count + Delta) 전략으로 네트워크 효율을 최적화."**

---

## 관련 파일

| 파일 | 줄 수 | 설명 |
|------|------|------|
| `src/libs/offline/engines/chat-engine.ts` | ~1,061 | 채팅 동기화 핵심 엔진 |
| `src/libs/offline/engines/room-engine.ts` | ~500 | 채팅방 목록 동기화 |
| `src/libs/offline/repositories/chat-repository.ts` | ~808 | 채팅 데이터 접근 |
| `src/libs/offline/actions/chat-action.ts` | ~200 | UI 진입점 |
| `src/libs/offline/README.md` | - | 아키텍처 공식 문서 |

---

## 스크린샷 / 다이어그램

<!-- 아키텍처 다이어그램 이미지 첨부 영역 -->
<!-- ![Offline Architecture](./images/offline-architecture.png) -->

> 📌 `images/` 폴더에 실제 아키텍처 다이어그램이나 앱 동작 GIF를 추가하세요.
