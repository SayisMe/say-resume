# 05. SQLite 로컬 데이터베이스

> expo-sqlite 기반 마이그레이션 시스템, Full-Text Search, JSON 쿼리, Chunk 기반 대량 UPSERT

## 핵심 가치

- 앱 업데이트 시 기존 데이터를 유지하는 마이그레이션 시스템
- JSON 컬럼에서 파일/링크 추출하는 고급 SQLite 쿼리
- 메모리 효율적인 Chunk 기반 대량 데이터 처리

---

## 데이터베이스 구조

```
bizbeetalk_offline.db
│
├─ chat_messages        # 채팅 메시지
│   ├─ active_id        # 서버 순번 (정렬 기준)
│   ├─ message_id       # 서버 메시지 ID (고유)
│   ├─ local_id         # 로컬 임시 ID (발송 전)
│   ├─ room_id          # 채팅방 ID
│   ├─ sender           # 발신자 JSON
│   ├─ write_date_time  # 작성 시간
│   ├─ type             # 메시지 타입 (CHAT/REPLY/FILE/EMOTICON/...)
│   ├─ remove           # 소프트 삭제 플래그 (0/1)
│   └─ data             # 전체 메시지 JSON (파일, 리액션, 링크 포함)
│
├─ rooms                # 채팅방 목록
│
├─ members              # 채팅방 멤버
│
├─ ... (10+ 테이블)
```

---

## 마이그레이션 시스템

```typescript
// src/libs/offline/db/database.ts

const MIGRATIONS = [
  { version: 1, migration: migration_001_init },
  { version: 2, migration: migration_002_chat },
  // 향후 마이그레이션 추가
];

async function runMigrations(db: SQLiteDatabase) {
  // PRAGMA user_version으로 현재 버전 확인
  const [{ user_version }] = await db.getAllAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );

  for (const { version, migration } of MIGRATIONS) {
    if (version > user_version) {
      await migration(db);
      await db.runAsync(`PRAGMA user_version = ${version}`);
    }
  }
}
```

```typescript
// src/libs/offline/db/migrations/001_init.ts
export async function migration_001_init(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS chat_messages (
      active_id      INTEGER,
      message_id     TEXT PRIMARY KEY,
      local_id       TEXT,
      room_id        TEXT NOT NULL,
      sender         TEXT,
      write_date_time TEXT,
      type           TEXT,
      remove         INTEGER DEFAULT 0,
      data           TEXT    -- JSON 전체 저장
    );

    CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id
      ON chat_messages(room_id, active_id DESC);
  `);
}
```

---

## 고급 쿼리 패턴

### 1. 앵커 기준 범위 조회 (메시지 검색 점프)

```typescript
// 검색 결과 클릭 → 해당 메시지 주변으로 스크롤 이동
async takeRangeById(params: {
  anchorId: string;   // 기준 메시지
  beforeCount: number; // 위쪽 N개
  afterCount: number;  // 아래쪽 N개
  roomId: string;
}) {
  const anchor = await db.getFirstAsync<ChatMessageRow>(
    `SELECT active_id FROM chat_messages WHERE message_id = ?`,
    [params.anchorId]
  );

  const [before, after] = await Promise.all([
    db.getAllAsync(
      `SELECT * FROM chat_messages
       WHERE room_id = ? AND active_id < ? AND remove = 0
       ORDER BY active_id DESC LIMIT ?`,
      [params.roomId, anchor.active_id, params.beforeCount]
    ),
    db.getAllAsync(
      `SELECT * FROM chat_messages
       WHERE room_id = ? AND active_id >= ? AND remove = 0
       ORDER BY active_id ASC LIMIT ?`,
      [params.roomId, anchor.active_id, params.afterCount + 1]
    ),
  ]);

  return [...before.reverse(), ...after];
}
```

### 2. JSON 데이터에서 파일 추출

```typescript
// data 컬럼(JSON)에서 파일 목록 추출
// json_each() SQLite JSON 함수 활용
async searchFiles(params: {
  roomId: string;
  fileName?: string;
  startDate?: string;
  endDate?: string;
}) {
  const query = `
    SELECT
      m.message_id,
      m.write_date_time,
      json_extract(f.value, '$.fileName') AS file_name,
      json_extract(f.value, '$.fileSize') AS file_size,
      json_extract(f.value, '$.fileUrl')  AS file_url
    FROM chat_messages m,
         json_each(json_extract(m.data, '$.content.file')) f
    WHERE m.room_id = ?
      AND m.remove = 0
      ${params.fileName ? "AND json_extract(f.value, '$.fileName') LIKE ?" : ''}
      ${params.startDate ? 'AND m.write_date_time >= ?' : ''}
    ORDER BY m.active_id DESC
  `;
  // ...
}
```

### 3. Chunk 기반 대량 UPSERT

```typescript
// 서버에서 50개씩 받아서 한 번의 쿼리로 저장
const CHUNK_SIZE = 50;

async upsertMessages(messages: ChatMessageType[]) {
  // 50개씩 나눠서 처리 (메모리 효율)
  const chunks = chunk(messages, CHUNK_SIZE);

  for (const chunk of chunks) {
    // VALUES (?,?,...), (?,?,...), ... 동적 생성
    const placeholders = chunk
      .map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .join(', ');

    const values = chunk.flatMap((msg) => [
      msg.activeId,
      msg.messageId,
      msg.localId ?? null,
      msg.roomId,
      JSON.stringify(msg.sender),
      msg.writeDatetime,
      msg.type,
      msg.remove ? 1 : 0,
      JSON.stringify(msg), // 전체 JSON 저장
    ]);

    await db.runAsync(
      `INSERT OR REPLACE INTO chat_messages
       (active_id, message_id, local_id, room_id, sender,
        write_date_time, type, remove, data)
       VALUES ${placeholders}`,
      values
    );
  }
}
```

---

## 메시지 타입별 data 컬럼 구조

```json
// type: "CHAT"
{
  "id": "msg-abc123",
  "type": "CHAT",
  "content": {
    "text": "안녕하세요",
    "mention": [{ "userId": "u1", "name": "홍길동" }]
  },
  "reactions": [{ "emoji": "👍", "count": 3, "myReaction": true }],
  "readCount": 5
}

// type: "FILE"
{
  "content": {
    "file": [
      {
        "fileName": "report.pdf",
        "fileSize": 204800,
        "fileUrl": "https://cdn.example.com/files/report.pdf",
        "fileType": "application/pdf"
      }
    ]
  }
}

// type: "EMOTICON"
{
  "content": {
    "chatEmoticon": {
      "emoticonId": "emo-001",
      "imageUrl": "https://cdn.example.com/emoticons/001.gif"
    }
  }
}
```

---

## 성능 최적화

| 기법 | 설명 |
|------|------|
| Chunk UPSERT | 50개씩 배치 처리로 DB 왕복 최소화 |
| Compound Index | `(room_id, active_id DESC)` 복합 인덱스 |
| Soft Delete | `remove = 1` 플래그 (물리 삭제 없음) |
| JSON 컬럼 | 타입별 다양한 구조를 단일 테이블로 처리 |
| PRAGMA foreign_keys | 무결성 보장 |

---

## 이력서 포인트

> **"expo-sqlite 기반 버전별 마이그레이션 시스템 구현.
> SQLite JSON 함수(json_each, json_extract)로 JSON 컬럼에서 파일/링크 추출.
> 50개 단위 Chunk UPSERT로 대량 메시지 처리 최적화.
> 앵커 기준 양방향 범위 조회로 메시지 검색 후 컨텍스트 로딩 구현."**

---

## 관련 파일

| 파일 | 설명 |
|------|------|
| `src/libs/offline/db/database.ts` | 마이그레이션 실행 관리 |
| `src/libs/offline/db/schemas/` | 테이블 스키마 정의 |
| `src/libs/offline/db/migrations/` | 마이그레이션 파일 |
| `src/libs/offline/repositories/chat-repository.ts` | 채팅 쿼리 (~808줄) |

---

## 스크린샷 / 다이어그램

<!-- ![DB Schema](./images/db-schema.png) -->
<!-- ![Message Structure](./images/message-json-structure.png) -->

> 📌 `images/` 폴더에 DB 스키마 다이어그램이나 메시지 타입별 구조 이미지를 추가하세요.
