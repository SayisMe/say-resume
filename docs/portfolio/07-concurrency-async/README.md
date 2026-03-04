# 07. 동시성 & 비동기 패턴

> AsyncMutex, Double-Checked Locking, Outbox 패턴 등 복잡한 동시성 문제를 체계적으로 해결

## 핵심 가치

- STOMP 메시지 수신과 Active Sync 사이의 Race Condition 방지
- 오프라인 메시지를 안전하게 관리하는 Outbox 패턴
- 동일 동기화 작업의 중복 실행 방지

---

## 해결한 동시성 문제

```
Race Condition 시나리오:
──────────────────────────────────────────────────────────
시간 →   T1          T2          T3          T4

Thread A: [STOMP 메시지 수신] → [DB insert 시도]
Thread B:                [Active Sync 시작] → [DB insert 시도]
                                         ↑
                              ⚠️ 동일 메시지 중복 삽입 또는
                              ⚠️ Sync 중 STOMP 메시지 누락
──────────────────────────────────────────────────────────
```

---

## 1. AsyncMutex (자체 구현)

```typescript
// src/libs/offline/engines/AsyncMutex.ts

class AsyncMutex {
  private locked = false;
  private queue: Array<() => void> = [];

  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }

    // 락이 걸려있으면 큐에서 대기
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      // 다음 대기자에게 락 전달
      const next = this.queue.shift()!;
      next();
    } else {
      this.locked = false;
    }
  }

  async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}
```

### 사용 예시

```typescript
// chat-engine.ts — Session별 독립 Mutex
interface ChatSession {
  roomId: string;
  mutex: AsyncMutex;           // 동시성 보호
  activeSyncDone: boolean;     // Double-checked locking용
  deltaInterval: NodeJS.Timer | null;
}

// STOMP 메시지 수신 핸들러
async handleChatMessage(msg: StompMessage) {
  const session = getOrCreateSession(msg.roomId);

  await session.mutex.runExclusive(async () => {
    // 임계 영역: DB 삽입 + 동기화 작업
    await chatRepository.upsertMessage(msg);
    queryClient.invalidateQueries([GET_CHAT_LIST, msg.roomId]);
  });
}

// Active Sync
async activeSync(roomId: string) {
  const session = getOrCreateSession(roomId);

  await session.mutex.runExclusive(async () => {
    if (session.activeSyncDone) return; // ← Double-Checked Locking
    await syncByCount(roomId);
    await deltaSync(roomId);
    session.activeSyncDone = true;
  });
}
```

---

## 2. Double-Checked Locking

```typescript
// 패턴: 락 획득 전 빠른 체크 → 락 획득 후 재확인

// ❌ 없을 경우 문제:
// Thread A, B가 동시에 activeSyncDone = false 확인
// → 둘 다 mutex 진입 → 중복 activeSync 실행

// ✅ Double-Checked Locking 적용:
async activeSync(roomId: string) {
  // 1차 체크 (락 없이) — 대부분의 경우 여기서 차단
  if (session.activeSyncDone) return;

  await session.mutex.runExclusive(async () => {
    // 2차 체크 (락 안에서) — 진짜 중복 방지
    if (session.activeSyncDone) return;

    await doActiveSync(roomId);
    session.activeSyncDone = true;
  });
}
```

---

## 3. Outbox 패턴 (오프라인 메시지 관리)

```
메시지 전송 흐름:

사용자 입력
    │
    ▼
[1] 로컬 DB에 임시 저장
    - local_id 부여 (UUID)
    - status: 'pending'
    - UI에 즉시 표시 (낙관적 업데이트)
    │
    ▼
[2] STOMP로 발송
    - SendChatBase() 호출
    - Echo 대기 (5초 타임아웃)
    │
    ├─ Echo 수신 성공 ──────────────────────────────┐
    │                                               ▼
    │                                   [3] 로컬 DB 업데이트
    │                                       - server message_id 반영
    │                                       - active_id 반영
    │                                       - status: 'sent'
    │
    └─ 타임아웃 (5초) ──────────────────────────────┐
                                                    ▼
                                        [4] 실패 상태 표시
                                            - status: 'failed'
                                            - 재전송 버튼 표시
```

```typescript
// chat-engine.ts

async sendMessage(payload: SendMessagePayload) {
  const localId = generateLocalId(); // 'local-{uuid}'

  // 1. 낙관적 삽입 (즉시 UI에 표시)
  await chatRepository.insertLocalMessage({
    ...payload,
    localId,
    status: 'pending',
  });
  queryClient.invalidateQueries([GET_CHAT_LIST, payload.roomId]);

  try {
    // 2. STOMP 발송 + Echo 대기
    const { data: serverMsg } = await SendChatBase({
      destination: `/pub/chat/${payload.roomId}`,
      roomId: payload.roomId,
      body: { ...payload, localId },
    });

    // 3. 서버 데이터로 업데이트
    await chatRepository.confirmLocalMessage(localId, serverMsg);

  } catch (error) {
    // 4. 실패 시 상태 업데이트
    await chatRepository.markAsFailed(localId);
  }

  queryClient.invalidateQueries([GET_CHAT_LIST, payload.roomId]);
}
```

---

## 4. 30초 주기 Delta Sync (백그라운드 동기화)

```typescript
// 채팅방 활성 상태에서 주기적으로 변경사항 동기화

function startDeltaInterval(roomId: string) {
  const session = getOrCreateSession(roomId);

  session.deltaInterval = setInterval(async () => {
    // Mutex 안에서 실행 (STOMP 수신과 충돌 방지)
    await session.mutex.runExclusive(async () => {
      const lastSyncId = session.lastDeltaSyncId;

      const changes = await fetchDeltaChanges({
        roomId,
        afterActiveId: lastSyncId,
      });

      if (changes.length > 0) {
        await chatRepository.upsertMessages(changes);
        session.lastDeltaSyncId = changes[changes.length - 1].activeId;
        queryClient.invalidateQueries([GET_CHAT_LIST, roomId]);
      }
    });
  }, 30_000); // 30초
}

function stopDeltaInterval(roomId: string) {
  const session = sessions.get(roomId);
  if (session?.deltaInterval) {
    clearInterval(session.deltaInterval);
    session.deltaInterval = null;
  }
}
```

---

## 5. Echo 대기 패턴 (Promise + EventEmitter)

```typescript
// 비동기 이벤트 기반 응답 대기 패턴

function waitForEcho(localId: string, timeout = 5000): Promise<ChatMessage> {
  return new Promise((resolve, reject) => {
    // 구독
    const unsubscribe = StompEvent.on('chat-message', (msg: ChatMessage) => {
      if (msg.localId === localId) {
        cleanup();
        resolve(msg);
      }
    });

    // 타임아웃 설정
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Echo timeout for localId: ${localId}`));
    }, timeout);

    function cleanup() {
      unsubscribe();
      clearTimeout(timer);
    }
  });
}
```

---

## 동시성 문제 해결 전/후 비교

| 문제 | 해결책 | 효과 |
|------|--------|------|
| STOMP + ActiveSync 충돌 | AsyncMutex | Race Condition 제거 |
| ActiveSync 중복 실행 | Double-Checked Locking | 불필요한 API 호출 제거 |
| 오프라인 발송 실패 | Outbox 패턴 | 메시지 유실 없음 |
| 대량 DB 삽입 성능 | Chunk UPSERT (50개) | 메모리 효율 향상 |
| Echo 대기 무한 블로킹 | 5초 타임아웃 + cleanup | 메모리 리크 방지 |

---

## 이력서 포인트

> **"AsyncMutex 자체 구현으로 STOMP 수신과 Active Sync 간의 Race Condition 해결.
> Double-Checked Locking 패턴으로 동기화 작업 중복 실행 방지.
> Outbox 패턴으로 메시지 발송 실패 시 UI 즉시 피드백 + 재전송 기능 구현.
> Promise + EventEmitter 조합으로 비동기 Echo 대기 및 타임아웃 처리."**

---

## 관련 파일

| 파일 | 설명 |
|------|------|
| `src/libs/offline/engines/chat-engine.ts` | AsyncMutex, Outbox, Delta Sync (~1,061줄) |
| `src/libs/stomp/SendChatBase.ts` | Echo 대기 패턴 |
| `src/libs/offline/repositories/chat-repository.ts` | Chunk UPSERT |

---

## 스크린샷 / 다이어그램

<!-- ![Concurrency Diagram](./images/concurrency-diagram.png) -->
<!-- ![Outbox Pattern](./images/outbox-pattern.png) -->

> 📌 `images/` 폴더에 동시성 흐름 다이어그램을 추가하세요.
