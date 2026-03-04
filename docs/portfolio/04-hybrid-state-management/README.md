# 04. 하이브리드 상태 관리

> Redux Toolkit + React Query + Zustand 세 가지 상태 관리 라이브러리를 목적에 맞게 역할 분리

## 핵심 가치

- 각 라이브러리의 강점을 최대한 활용
- 역할 혼용 없이 명확한 계층 분리
- 앱 재시작 후에도 필요한 상태 자동 복구 (redux-persist)

---

## 세 가지 상태 관리의 역할 분리

```
┌─────────────────────────────────────────────────────────────────┐
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
│ - 정렬 설정      │                  │                           │
│                  │                  │                           │
│ AsyncStorage에   │ 메모리에만 존재   │ 메모리에만 존재           │
│ 영속 저장        │ (앱 재시작 시 초기화)│ (빠른 접근 최적화)     │
└──────────────────┴──────────────────┴──────────────────────────┘

❌ 규칙: Redux에 서버 데이터 저장 금지 / React Query에 UI 상태 저장 금지
```

---

## 1. Redux Toolkit + redux-persist

### Persisted Slices (앱 재시작 후에도 유지)

```typescript
// src/stores/redux/store.ts

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [
    'auth',         // accessToken, refreshToken
    'user',         // 사용자 기본 정보
    'profile',      // 현재 프로필 ID
    'permission',   // 알림/카메라/갤러리 권한
    'inAppMessage', // 인앱 알림 설정
    'bookmark',     // 북마크 목록
    'autoAddFriend',// 자동 친구 추가 설정
    'roomPopup',    // 채팅방 팝업 설정
    'sort',         // 정렬 기준
    'theme',        // 라이트/다크 모드
  ],
};
```

### Not Persisted (임시 상태)

```typescript
// redux-persist whitelist 외 슬라이스들
'modal',           // 현재 열린 모달 (임시)
'selectedFriends', // 선택된 친구들 (임시)
'fileUpload',      // 파일 업로드 진행도 (임시)
```

### 슬라이스 예시

```typescript
// auth-slice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: null as string | null,
    refreshToken: null as string | null,
    userId: null as string | null,
  },
  reducers: {
    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.userId = null;
    },
  },
});
```

---

## 2. React Query (TanStack Query v5)

### Query Key 중앙 관리

```typescript
// src/constants/keys.ts

export const GET_CHAT_LIST = 'GET_CHAT_LIST';
export const GET_ROOM_LIST = 'GET_ROOM_LIST';
export const GET_MEMBER_LIST = 'GET_MEMBER_LIST';
export const GET_FRIEND_LIST = 'GET_FRIEND_LIST';
export const GET_PROFILE = 'GET_PROFILE';
// 100+ Query 키 정의
```

### Hook 예시

```typescript
// src/hooks/api/useChatQuery.ts

export function useChatList(roomId: string) {
  return useQuery({
    queryKey: [GET_CHAT_LIST, roomId],
    queryFn: () => chatRepository.takeLatest({ roomId, limit: 30 }),
    staleTime: 0, // 항상 최신 데이터 (로컬 DB가 single source of truth)
  });
}
```

### Engine에서 캐시 무효화

```typescript
// chat-engine.ts — 동기화 완료 후 자동 UI 갱신
queryClient.invalidateQueries({
  queryKey: [GET_CHAT_LIST, roomId],
});

// 멤버 변경 시
queryClient.invalidateQueries({
  queryKey: [GET_MEMBER_LIST, roomId],
});
```

---

## 3. Zustand — Listenbook

```typescript
// src/libs/stomp/listenbook-store.ts

interface ListenbookState {
  roomIds: Set<string>;
  addRoom: (roomId: string) => void;
  removeRoom: (roomId: string) => void;
  isListening: (roomId: string) => boolean;
}

const useListenbookStore = create<ListenbookState>((set, get) => ({
  roomIds: new Set<string>(),

  addRoom: (roomId) =>
    set((state) => ({ roomIds: new Set([...state.roomIds, roomId]) })),

  removeRoom: (roomId) =>
    set((state) => {
      const next = new Set(state.roomIds);
      next.delete(roomId);
      return { roomIds: next };
    }),

  isListening: (roomId) => get().roomIds.has(roomId),
}));
```

---

## 역할 분리 판단 기준

```
새 상태를 어디에 넣을까?

Q1. 서버에서 가져오는 데이터인가?
  → YES: React Query (queryFn으로 fetching, 캐시 자동 관리)
  → NO: 계속

Q2. 앱 재시작 후에도 유지해야 하는가?
  → YES: Redux + redux-persist (AsyncStorage 저장)
  → NO: 계속

Q3. 여러 컴포넌트가 동시에 접근하는가?
  → YES: Zustand (전역 접근, 간단한 설정)
  → NO: 컴포넌트 로컬 state (useState)
```

---

## 이력서 포인트

> **"Redux Toolkit + React Query + Zustand 세 가지 상태 관리 라이브러리를 목적에 따라 명확히 역할 분리.
> Redux: 영속적 UI 상태 (토큰, 설정), React Query: 서버 데이터 캐시,
> Zustand: 간단한 런타임 상태(Listenbook).
> 역할 혼용 방지 규칙으로 상태 관리 복잡도 최소화."**

---

## 관련 파일

| 파일 | 설명 |
|------|------|
| `src/stores/redux/store.ts` | Redux store + persist 설정 |
| `src/stores/redux/slices/` | 20+ Redux 슬라이스 |
| `src/stores/react-query/` | React Query 클라이언트 설정 |
| `src/hooks/api/` | 도메인별 React Query 훅 |
| `src/constants/keys.ts` | 100+ Query 키 중앙 관리 |
| `src/libs/stomp/listenbook-store.ts` | Zustand Listenbook |

---

## 스크린샷 / 다이어그램

<!-- ![State Management](./images/state-management.png) -->

> 📌 `images/` 폴더에 상태 흐름 다이어그램을 추가하세요.
