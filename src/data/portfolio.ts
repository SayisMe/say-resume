export type TextBlock = {
  type: "text";
  content: string;
};

export type DiagramBlock = {
  type: "diagram";
  content: string;
};

export type CodeBlock = {
  type: "code";
  lang: string;
  content: string;
};

export type ListBlock = {
  type: "list";
  items: string[];
};

export type Block = TextBlock | DiagramBlock | CodeBlock | ListBlock;

export type PortfolioSection = {
  title: string;
  blocks: Block[];
};

export type PortfolioItem = {
  slug: string;
  num: string;
  title: string;
  titleEn: string;
  summary: string;
  coreValues: string[];
  tags: string[];
  sections: PortfolioSection[];
};

export const portfolioItems: PortfolioItem[] = [
  {
    slug: "offline-first-architecture",
    num: "01",
    title: "오프라인 우선 아키텍처",
    titleEn: "Offline-First Architecture",
    summary: "네트워크 상태와 무관하게 앱이 동작하고, 연결 복구 시 자동으로 서버와 동기화되는 3계층 아키텍처",
    coreValues: [
      "네트워크 불안정 환경에서도 앱 기능 유지",
      "UI와 서버 통신 레이어를 완전히 분리",
      "일관된 데이터 흐름으로 버그 추적 용이",
    ],
    tags: ["SQLite", "Flux", "Sync", "Architecture", "TypeORM"],
    sections: [
      {
        title: "아키텍처 다이어그램",
        blocks: [
          {
            type: "diagram",
            content: `┌─────────────────────────────────────────────────────────┐
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
└─────────┘  └──────────┘`,
          },
        ],
      },
      {
        title: "계층별 책임",
        blocks: [
          {
            type: "text",
            content: "UI는 Engine을 직접 호출하지 않습니다. 반드시 Action을 통해 쓰기 요청을 전달하고, Repository를 통해 데이터를 읽습니다.",
          },
          {
            type: "code",
            lang: "typescript",
            content: `// Action — UI의 쓰기 요청 진입점
export const chatAction = {
  sendMessage: (payload: SendMessagePayload) =>
    chatEngine.sendMessage(payload),
  read: (params: { roomId: string }) =>
    chatEngine.read(params),
  deleteMessage: (params: { messageId: string; roomId: string }) =>
    chatEngine.deleteMessage(params),
};`,
          },
          {
            type: "code",
            lang: "typescript",
            content: `// Engine — 핵심 비즈니스 로직 (chat-engine.ts, ~1,061줄)
class ChatEngine {
  async sendMessage(payload: SendMessagePayload) {
    // 1. 로컬 DB에 임시 저장 (local_id 부여)
    const localMsg = await chatRepository.insertLocalMessage(payload);

    // 2. STOMP로 발송 (Echo 대기)
    const result = await SendChatBase({
      destination: \`/pub/chat/\${payload.roomId}\`,
      body: payload,
      roomId: payload.roomId,
    });

    // 3. 서버 Echo 수신 후 로컬 DB 갱신
    await chatRepository.confirmLocalMessage(localMsg.local_id, result.data);

    // 4. React Query 캐시 무효화 → UI 자동 갱신
    queryClient.invalidateQueries({ queryKey: [GET_CHAT_LIST, payload.roomId] });
  }
}`,
          },
        ],
      },
      {
        title: "2단계 Active Sync 전략",
        blocks: [
          {
            type: "diagram",
            content: `채팅방 진입 시
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
→ UI 자동 리렌더링`,
          },
        ],
      },
    ],
  },
  {
    slug: "realtime-stomp",
    num: "02",
    title: "실시간 통신 STOMP/WebSocket",
    titleEn: "Realtime STOMP / WebSocket",
    summary: "WebSocket 위에 STOMP 프로토콜을 사용하여 실시간 메시지 송수신, 자동 재연결, Echo 기반 전송 확인 구현",
    coreValues: [
      "연결 끊김 시 자동 재연결 + 모든 구독 자동 복구",
      "메시지 발송 후 서버 Echo를 통해 전송 성공 확인",
      "공개 채널(알림)과 채팅 채널 분리 구독",
    ],
    tags: ["WebSocket", "STOMP", "Reconnect", "EventEmitter"],
    sections: [
      {
        title: "전체 STOMP 아키텍처",
        blocks: [
          {
            type: "diagram",
            content: `┌──────────────────────────────────────────────────────────┐
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
  (알림, 공개 이벤트)           (채팅 메시지)`,
          },
        ],
      },
      {
        title: "자동 재구독 구현",
        blocks: [
          {
            type: "code",
            lang: "typescript",
            content: `// StompClient.ts — Map 기반 구독 추적 + 재연결 시 자동 복구
class StompClient {
  private _subscriptions = new Map<string, StompClientSubscription>();

  subscribe(destination: string, listener: MessageCallback): string {
    const id = generateId();
    const stompSub = this._client.subscribe(destination, listener);
    this._subscriptions.set(id, { destination, listener, stompSubscription: stompSub });
    return id;
  }

  private _resubscribe() {
    // 재연결 후 모든 구독을 자동으로 복구
    this._subscriptions.forEach((entry) => {
      entry.stompSubscription = this._client.subscribe(
        entry.destination,
        entry.listener
      );
    });
  }
}`,
          },
        ],
      },
      {
        title: "Echo 기반 메시지 전송 확인",
        blocks: [
          {
            type: "code",
            lang: "typescript",
            content: `// SendChatBase.ts — Promise + EventEmitter 패턴
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
}`,
          },
        ],
      },
    ],
  },
  {
    slug: "jwt-auth",
    num: "03",
    title: "JWT 인증 & 토큰 자동 갱신",
    titleEn: "JWT Auth & Token Refresh",
    summary: "이중 Axios 구조와 Response Interceptor를 활용한 Access/Refresh 토큰 자동 갱신, 에러 코드별 처리",
    coreValues: [
      "토큰 만료 시 UI 개입 없이 자동 갱신 후 요청 재시도",
      "토큰 갱신 전용 인스턴스로 무한 갱신 루프 방지",
      "네트워크 상태에 따른 요청 차단 및 사용자 피드백",
    ],
    tags: ["JWT", "Axios", "Interceptor", "Redux"],
    sections: [
      {
        title: "이중 Axios 구조",
        blocks: [
          {
            type: "diagram",
            content: `┌─────────────────────────────────────────────────────────┐
│                    client.ts                             │
│  (메인 Axios — 모든 API 요청)                           │
│                                                          │
│  Request Interceptor:                                    │
│  1. NetInfo → 오프라인이면 (GET 제외) toast 표시        │
│  2. Redux에서 accessToken 읽기                          │
│  3. Authorization: Bearer {token} 헤더 설정             │
│                                                          │
│  Response Interceptor:                                   │
│  ├─ 1002: 토큰 오류 → logout()                         │
│  ├─ 1003: 권한 없음 → logout()                         │
│  ├─ 1004: 리프레시 만료 → logout()                     │
│  └─ 1005: 액세스 만료 → 토큰 갱신 후 원요청 재시도     │
└──────────────────────────────────────────────────────────┘
                          │ 1005 발생 시
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  axiosClient.ts                          │
│  (토큰 갱신 전용 — 인터셉터 없음, 무한 루프 방지)       │
│                                                          │
│  POST /auth/refresh → 새 accessToken, refreshToken      │
└──────────────────────────────────────────────────────────┘`,
          },
          {
            type: "list",
            items: [
              "단일 Axios: 갱신 요청 → 401 → 갱신 시도 → 401 → 무한 루프",
              "이중 Axios: 갱신 전용 인스턴스에는 인터셉터 없음 → 갱신 실패 시 그냥 실패",
            ],
          },
        ],
      },
      {
        title: "Response Interceptor — 토큰 갱신 로직",
        blocks: [
          {
            type: "code",
            lang: "typescript",
            content: `client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { response, config } = error;
    const errorCode = response?.data?.code;

    // 이미 재시도한 요청이면 포기 (무한 루프 방지)
    if (config?._retry) {
      store.dispatch(logout());
      return Promise.reject(error);
    }

    switch (errorCode) {
      case 1002: // 토큰 형식 오류
      case 1003: // 권한 없음
      case 1004: // 리프레시 토큰 만료
        store.dispatch(logout());
        break;

      case 1005: // 액세스 토큰 만료
        config._retry = true;
        try {
          const { data } = await axiosClient.post('/auth/refresh', {
            refreshToken: store.getState().auth.refreshToken,
          });
          store.dispatch(setTokens(data));
          config.headers.Authorization = \`Bearer \${data.accessToken}\`;
          return client(config); // 원래 요청 재시도
        } catch {
          store.dispatch(logout());
        }
    }
    return Promise.reject(error);
  }
);`,
          },
        ],
      },
    ],
  },
  {
    slug: "hybrid-state-management",
    num: "04",
    title: "하이브리드 상태 관리",
    titleEn: "Hybrid State Management",
    summary: "Redux Toolkit + React Query + Zustand 세 가지 상태 관리 라이브러리를 목적에 맞게 역할 분리",
    coreValues: [
      "각 라이브러리의 강점을 최대한 활용",
      "역할 혼용 없이 명확한 계층 분리",
      "앱 재시작 후에도 필요한 상태 자동 복구 (redux-persist)",
    ],
    tags: ["Redux Toolkit", "React Query", "Zustand", "redux-persist"],
    sections: [
      {
        title: "세 가지 상태 관리의 역할 분리",
        blocks: [
          {
            type: "diagram",
            content: `┌─────────────────────────────────────────────────────────────────┐
│                       상태 관리 계층                             │
├──────────────────┬──────────────────┬──────────────────────────┤
│   Redux Toolkit  │   React Query    │        Zustand            │
│   + redux-persist│   (TanStack v5)  │                           │
├──────────────────┼──────────────────┼──────────────────────────┤
│ 영속적 UI 상태   │ 서버 데이터 캐시  │ 간단한 런타임 상태        │
│                  │                  │                           │
│ - Auth 토큰      │ - 메시지 목록     │ - Listenbook              │
│ - 사용자 정보    │ - 채팅방 목록     │   (구독 중인 roomId Set)  │
│ - 테마/설정      │ - 친구 목록       │ - 임시 프로필 캐시        │
│ - 북마크         │ - 검색 결과       │                           │
│                  │                  │                           │
│ AsyncStorage에   │ 메모리에만 존재   │ 메모리에만 존재           │
│ 영속 저장        │ (앱 재시작 시 초기화) │ (빠른 접근 최적화)   │
└──────────────────┴──────────────────┴──────────────────────────┘

규칙: Redux에 서버 데이터 저장 금지 / React Query에 UI 상태 저장 금지`,
          },
        ],
      },
      {
        title: "역할 분리 판단 기준",
        blocks: [
          {
            type: "diagram",
            content: `새 상태를 어디에 넣을까?

Q1. 서버에서 가져오는 데이터인가?
  → YES: React Query (queryFn으로 fetching, 캐시 자동 관리)
  → NO: 계속

Q2. 앱 재시작 후에도 유지해야 하는가?
  → YES: Redux + redux-persist (AsyncStorage 저장)
  → NO: 계속

Q3. 여러 컴포넌트가 동시에 접근하는가?
  → YES: Zustand (전역 접근, 간단한 설정)
  → NO: 컴포넌트 로컬 state (useState)`,
          },
        ],
      },
      {
        title: "Redux Persist 설정",
        blocks: [
          {
            type: "code",
            lang: "typescript",
            content: `// store.ts — whitelist로 영속화할 슬라이스 선택
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [
    'auth',         // accessToken, refreshToken
    'user',         // 사용자 기본 정보
    'bookmark',     // 북마크 목록
    'sort',         // 정렬 기준
    'theme',        // 라이트/다크 모드
  ],
  // 'modal', 'selectedFriends' 등 임시 상태는 제외
};`,
          },
        ],
      },
    ],
  },
  {
    slug: "sqlite-database",
    num: "05",
    title: "SQLite 로컬 데이터베이스",
    titleEn: "SQLite Local Database",
    summary: "expo-sqlite 기반 마이그레이션 시스템, Full-Text Search, JSON 쿼리, Chunk 기반 대량 UPSERT",
    coreValues: [
      "앱 업데이트 시 기존 데이터를 유지하는 마이그레이션 시스템",
      "JSON 컬럼에서 파일/링크 추출하는 고급 SQLite 쿼리",
      "메모리 효율적인 Chunk 기반 대량 데이터 처리",
    ],
    tags: ["SQLite", "Migration", "FTS", "JSON Query", "UPSERT"],
    sections: [
      {
        title: "데이터베이스 구조",
        blocks: [
          {
            type: "diagram",
            content: `bizbeetalk_offline.db
│
├─ chat_messages        # 채팅 메시지
│   ├─ active_id        # 서버 순번 (정렬 기준)
│   ├─ message_id       # 서버 메시지 ID (고유)
│   ├─ local_id         # 로컬 임시 ID (발송 전)
│   ├─ room_id          # 채팅방 ID
│   ├─ sender           # 발신자 JSON
│   ├─ write_date_time  # 작성 시간
│   ├─ type             # CHAT/REPLY/FILE/EMOTICON/...
│   ├─ remove           # 소프트 삭제 플래그 (0/1)
│   └─ data             # 전체 메시지 JSON
│
├─ rooms                # 채팅방 목록
├─ members              # 채팅방 멤버
└─ ... (10+ 테이블)`,
          },
        ],
      },
      {
        title: "마이그레이션 시스템",
        blocks: [
          {
            type: "code",
            lang: "typescript",
            content: `// PRAGMA user_version으로 버전 추적
const MIGRATIONS = [
  { version: 1, migration: migration_001_init },
  { version: 2, migration: migration_002_chat },
];

async function runMigrations(db: SQLiteDatabase) {
  const [{ user_version }] = await db.getAllAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  for (const { version, migration } of MIGRATIONS) {
    if (version > user_version) {
      await migration(db);
      await db.runAsync(\`PRAGMA user_version = \${version}\`);
    }
  }
}`,
          },
        ],
      },
      {
        title: "JSON 데이터에서 파일 추출 (고급 쿼리)",
        blocks: [
          {
            type: "code",
            lang: "sql",
            content: `-- json_each(), json_extract() SQLite JSON 함수 활용
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
ORDER BY m.active_id DESC`,
          },
        ],
      },
      {
        title: "Chunk 기반 대량 UPSERT",
        blocks: [
          {
            type: "code",
            lang: "typescript",
            content: `// 50개씩 나눠서 처리 — 메모리 효율 + DB 왕복 최소화
const CHUNK_SIZE = 50;

async upsertMessages(messages: ChatMessageType[]) {
  const chunks = chunk(messages, CHUNK_SIZE);

  for (const chunk of chunks) {
    const placeholders = chunk.map(() => '(?,?,?,?,?,?,?,?,?)').join(',');
    const values = chunk.flatMap((msg) => [
      msg.activeId, msg.messageId, msg.localId ?? null,
      msg.roomId, JSON.stringify(msg.sender), msg.writeDatetime,
      msg.type, msg.remove ? 1 : 0, JSON.stringify(msg),
    ]);

    await db.runAsync(
      \`INSERT OR REPLACE INTO chat_messages
       (active_id,message_id,local_id,room_id,sender,
        write_date_time,type,remove,data)
       VALUES \${placeholders}\`,
      values
    );
  }
}`,
          },
        ],
      },
    ],
  },
  {
    slug: "advanced-chat-ui",
    num: "06",
    title: "고급 채팅 UI",
    titleEn: "Advanced Chat UI",
    summary: "양방향 무한 스크롤, 3D 명함 플립 애니메이션, @멘션 자동완성, 이모티콘 키보드 등 고도화된 UI 구현",
    coreValues: [
      "다양한 메시지 타입을 단일 컴포넌트로 렌더링",
      "메시지 검색 후 해당 위치로 애니메이션 스크롤",
      "키보드 높이 변화에 따른 동적 레이아웃 조정",
    ],
    tags: ["React Native", "Reanimated", "FlatList", "Infinite Scroll"],
    sections: [
      {
        title: "채팅 화면 구조",
        blocks: [
          {
            type: "diagram",
            content: `ChatScreen
├─ ChatHeader (SelectHeader / SearchHeader)
│   ├─ 채팅방 이름, 멤버 수
│   └─ 검색 모드 전환
│
├─ ChatMessageView            ← 핵심 컴포넌트
│   ├─ FlatList (양방향 무한 스크롤)
│   ├─ 메시지 타입별 렌더러
│   │   ├─ TextMessage       (텍스트 + 멘션)
│   │   ├─ FileMessage       (파일 다운로드)
│   │   ├─ ImageMessage      (썸네일 + 뷰어)
│   │   ├─ EmoticonMessage   (GIF 이모티콘)
│   │   ├─ BizCardMessage    (명함 미리보기)
│   │   ├─ ReplyMessage      (인용 답장)
│   │   └─ LinkMessage       (링크 미리보기)
│   └─ DateSeparator         (날짜 구분선)
│
└─ ChatFooter
    ├─ TextKeyboard           (텍스트 입력 + 멘션)
    ├─ EmoticonKeyboard       (카테고리별 이모티콘)
    └─ AttachmentMenu         (파일/사진 첨부)`,
          },
        ],
      },
      {
        title: "양방향 무한 스크롤",
        blocks: [
          {
            type: "code",
            lang: "typescript",
            content: `function ChatMessageView({ roomId }: Props) {
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 위로 스크롤 시 이전 메시지 로드
  const onStartReached = useCallback(async () => {
    if (!hasPrev || isLoadingMore) return;
    const oldest = messages[0];
    const prevMessages = await chatRepository.takeBefore({
      roomId, beforeId: oldest.activeId, limit: 30,
    });
    setMessages((prev) => [...prevMessages, ...prev]);
  }, [hasPrev, messages]);

  // 검색 결과 클릭 시 해당 메시지로 점프
  const jumpToMessage = useCallback(async (messageId: string) => {
    const range = await chatRepository.takeRangeById({
      anchorId: messageId, beforeCount: 15, afterCount: 15, roomId,
    });
    setMessages(range);
    const anchorIndex = range.findIndex((m) => m.messageId === messageId);
    flatListRef.current?.scrollToIndex({ index: anchorIndex, animated: true });
  }, [roomId]);

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      inverted={!hasNext}
      onStartReached={onStartReached}
      onEndReached={onEndReached}
      renderItem={({ item }) => <MessageItem message={item} />}
    />
  );
}`,
          },
        ],
      },
      {
        title: "3D 명함 플립 애니메이션",
        blocks: [
          {
            type: "code",
            lang: "typescript",
            content: `// React Native Reanimated — 3D rotateY 보간
import { useSharedValue, useAnimatedStyle, interpolate, withTiming } from 'react-native-reanimated';

function BizCardPreview() {
  const spin = useSharedValue(0); // 0 = 앞면, 1 = 뒷면

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: \`\${interpolate(spin.value, [0, 1], [0, 180])}deg\` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: \`\${interpolate(spin.value, [0, 1], [180, 360])}deg\` }],
    backfaceVisibility: 'hidden',
    position: 'absolute',
  }));

  const flip = () => {
    spin.value = withTiming(spin.value === 0 ? 1 : 0, { duration: 500 });
  };

  return (
    <Pressable onPress={flip}>
      <Animated.View style={[styles.card, frontStyle]}><BizCardFront /></Animated.View>
      <Animated.View style={[styles.card, backStyle]}><BizCardBack /></Animated.View>
    </Pressable>
  );
}`,
          },
        ],
      },
    ],
  },
  {
    slug: "concurrency-async",
    num: "07",
    title: "동시성 & 비동기 패턴",
    titleEn: "Concurrency & Async Patterns",
    summary: "AsyncMutex, Double-Checked Locking, Outbox 패턴 등 복잡한 동시성 문제를 체계적으로 해결",
    coreValues: [
      "STOMP 메시지 수신과 Active Sync 사이의 Race Condition 방지",
      "오프라인 메시지를 안전하게 관리하는 Outbox 패턴",
      "동일 동기화 작업의 중복 실행 방지",
    ],
    tags: ["AsyncMutex", "Race Condition", "Outbox", "Concurrency"],
    sections: [
      {
        title: "해결한 동시성 문제",
        blocks: [
          {
            type: "diagram",
            content: `Race Condition 시나리오:
──────────────────────────────────────────────────────────
시간 →   T1          T2          T3          T4

Thread A: [STOMP 메시지 수신] → [DB insert 시도]
Thread B:                [Active Sync 시작] → [DB insert 시도]
                                         ↑
                              ⚠️ 동일 메시지 중복 삽입 또는
                              ⚠️ Sync 중 STOMP 메시지 누락
──────────────────────────────────────────────────────────`,
          },
        ],
      },
      {
        title: "AsyncMutex (자체 구현)",
        blocks: [
          {
            type: "code",
            lang: "typescript",
            content: `class AsyncMutex {
  private locked = false;
  private queue: Array<() => void> = [];

  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
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
}`,
          },
        ],
      },
      {
        title: "Outbox 패턴 (메시지 발송 흐름)",
        blocks: [
          {
            type: "diagram",
            content: `사용자 입력
    │
    ▼
[1] 로컬 DB에 임시 저장 (local_id, status: 'pending')
    → UI에 즉시 표시 (낙관적 업데이트)
    │
    ▼
[2] STOMP로 발송 + Echo 대기 (5초 타임아웃)
    │
    ├─ Echo 수신 성공
    │       └─ [3] 서버 message_id, active_id 반영 (status: 'sent')
    │
    └─ 타임아웃 (5초)
            └─ [4] status: 'failed' + 재전송 버튼 표시`,
          },
          {
            type: "list",
            items: [
              "AsyncMutex: STOMP 수신 + Active Sync 간 Race Condition 제거",
              "Double-Checked Locking: 동기화 작업 중복 실행 방지",
              "Outbox 패턴: 오프라인 발송 실패 시 메시지 유실 없음",
              "5초 타임아웃 + cleanup: Echo 대기 메모리 리크 방지",
            ],
          },
        ],
      },
    ],
  },
];
