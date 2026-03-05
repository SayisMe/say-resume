# 📱 Bizbeetalk — 이력서 포트폴리오

> React Native (Expo) 기반 실시간 기업 메신저 앱의 기술적 핵심 정리

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 플랫폼 | React Native 0.81.5 + Expo 54 (Bare Workflow) |
| 언어 | TypeScript (strict mode, Decorators) |
| 규모 | 870+ 파일, 50+ API 엔드포인트, 100+ React Query 키 |
| 특징 | 오프라인 우선, 실시간 동기화, 하이브리드 상태 관리 |

---

## 📂 기술 카테고리

| # | 카테고리 | 핵심 기술 |
|---|---------|----------|
| 01 | [오프라인 우선 아키텍처](./01-offline-first-architecture/README.md) | Flux 패턴, Action/Engine/Repository, SQLite 동기화 |
| 02 | [실시간 통신 (STOMP/WebSocket)](./02-realtime-stomp/README.md) | STOMP, 자동 재구독, Echo 기반 전송 확인 |
| 03 | [JWT 인증 & 토큰 관리](./03-jwt-auth/README.md) | 이중 Axios, 자동 갱신, 인터셉터 패턴 |
| 04 | [하이브리드 상태 관리](./04-hybrid-state-management/README.md) | Redux + React Query + Zustand 역할 분리 |
| 05 | [SQLite 로컬 데이터베이스](./05-sqlite-database/README.md) | 마이그레이션, FTS, JSON 쿼리, 대량 UPSERT |
| 06 | [고급 채팅 UI](./06-advanced-chat-ui/README.md) | 양방향 무한 스크롤, 3D 애니메이션, 멘션/이모티콘 |
| 07 | [동시성 & 비동기 패턴](./07-concurrency-async/README.md) | AsyncMutex, Outbox 패턴, Delta Sync, Chunk 처리 |

---

## 🏆 이력서 요약 문구 (참고용)

```
- Flux 패턴 기반 Offline-First 3계층 아키텍처 설계 및 구현 (Action/Engine/Repository)
- STOMP(WebSocket) 기반 실시간 메시징 구현, 자동 재연결 및 Echo 기반 전송 확인
- AsyncMutex 구현으로 동시 동기화 Race Condition 해결
- Redux Toolkit + React Query + Zustand 역할 분리 하이브리드 상태 관리
- JWT 이중 Axios 구조로 토큰 자동 갱신 및 무한 루프 방지
- SQLite FTS/JSON 쿼리, Delta Sync, Chunk UPSERT 최적화
- React Native Reanimated 3D 플립 애니메이션, 양방향 무한 스크롤 구현
```
