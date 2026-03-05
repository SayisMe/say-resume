# 03. JWT 인증 & 토큰 자동 갱신

> 이중 Axios 구조와 Response Interceptor를 활용한 Access/Refresh 토큰 자동 갱신, 에러 코드별 처리

## 핵심 가치

- 토큰 만료 시 UI 개입 없이 자동 갱신 후 요청 재시도
- 토큰 갱신 전용 인스턴스로 무한 갱신 루프 방지
- 네트워크 상태에 따른 요청 차단 및 사용자 피드백

---

## 이중 Axios 구조

```
┌─────────────────────────────────────────────────────────┐
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
                          │
              토큰 갱신 필요 시 (1005)
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  axiosClient.ts                          │
│  (토큰 갱신 전용 Axios — 인터셉터 없음)                 │
│                                                          │
│  POST /auth/refresh                                      │
│  { refreshToken: "..." }                                 │
│  → 새 accessToken, refreshToken 발급                   │
└──────────────────────────────────────────────────────────┘
```

### 왜 두 개의 Axios 인스턴스?

```
❌ 단일 Axios 사용 시:
   갱신 요청 → 401 → 갱신 시도 → 401 → ... (무한 루프)

✅ 이중 Axios 사용 시:
   갱신 요청(axiosClient) → 인터셉터 없음 → 갱신 실패 시 그냥 실패
   메인 요청(client) → 1005 → axiosClient로 갱신 → 성공 → 재시도
```

---

## 핵심 코드

### Request Interceptor

```typescript
// src/api/client.ts

client.interceptors.request.use(async (config) => {
  // 1. 네트워크 연결 확인
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected && config.method !== 'get') {
    toast.show('네트워크에 연결되어 있지 않습니다.');
  }

  // 2. Redux Store에서 토큰 읽기
  const { accessToken } = store.getState().auth;

  // 3. 헤더 설정
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
```

### Response Interceptor — 토큰 갱신 로직

```typescript
client.interceptors.response.use(
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
        config._retry = true; // 재시도 플래그 설정

        try {
          // 토큰 전용 Axios로 갱신 (인터셉터 없음)
          const { data } = await axiosClient.post('/auth/refresh', {
            refreshToken: store.getState().auth.refreshToken,
          });

          // Redux 업데이트
          store.dispatch(setTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          }));

          // 원래 요청 재시도
          config.headers.Authorization = `Bearer ${data.accessToken}`;
          return client(config);

        } catch (refreshError) {
          store.dispatch(logout());
          return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
  }
);
```

---

## 에러 코드 처리 플로우

```
API 요청 실패 (4xx)
         │
         ▼
    errorCode 확인
         │
    ┌────┴──────────────────┐
    │                       │
    ▼                       ▼
 1005 (만료)           1002/1003/1004
    │                  (복구 불가)
    ▼                       │
_retry 플래그 체크           ▼
    │               logout() 디스패치
    ├─ true → logout()      │
    │                       ▼
    ▼               로그인 화면으로 이동
axiosClient로 갱신
    │
    ├─ 성공 → 원요청 재시도
    │
    └─ 실패 → logout()
```

---

## 네트워크 상태 처리

```typescript
// GET 요청은 캐시된 데이터로 응답 가능하므로 차단하지 않음
// POST/PUT/DELETE는 오프라인 시 토스트 경고만 표시 (요청은 진행)

const isOffline = !netInfo.isConnected;
const isWriteRequest = config.method !== 'get';

if (isOffline && isWriteRequest) {
  // UX: 사용자에게 알림 (요청 자체는 계속 진행)
  showToast('네트워크 연결을 확인해주세요');
}
```

---

## Redux Auth Slice 구조

```typescript
// src/stores/redux/slices/auth-slice.ts

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
}

// Persisted — 앱 재시작 후에도 토큰 유지
// redux-persist가 AsyncStorage에 자동 저장
```

---

## 이력서 포인트

> **"이중 Axios 인스턴스 구조로 JWT 토큰 자동 갱신 구현.
> Response Interceptor에서 토큰 만료(1005) 감지 → 토큰 전용 인스턴스로 갱신 → 원요청 재시도.
> _retry 플래그로 무한 갱신 루프 방지.
> 에러 코드(1002/1003/1004/1005)별 처리 로직 분기."**

---

## 관련 파일

| 파일 | 설명 |
|------|------|
| `src/api/client.ts` | 메인 Axios 인스턴스, 인터셉터 (~149줄) |
| `src/api/axiosClient.ts` | 토큰 갱신 전용 Axios 인스턴스 |
| `src/stores/redux/slices/auth-slice.ts` | 토큰 상태 관리 |

---

## 스크린샷 / 다이어그램

<!-- ![JWT Flow](./images/jwt-flow.png) -->
<!-- ![Token Refresh Sequence](./images/token-refresh-sequence.png) -->

> 📌 `images/` 폴더에 토큰 갱신 시퀀스 다이어그램을 추가하세요.
