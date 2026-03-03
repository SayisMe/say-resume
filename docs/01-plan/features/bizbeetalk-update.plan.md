# [Plan] bizbeetalk-update

## 목표
포트폴리오 사이트의 주식회사 비즈비 경력 및 프로젝트 내용을 최신 상태로 업데이트.
도토리톡(Dotoritalk) → 비즈비톡(BizbeeeTalk)으로 브랜드 변경 및 추가된 기능 반영.

## 변경 사항 (As-Is → To-Be)

### 프로젝트명
- AS-IS: Dotori Talk
- TO-BE: BizbeeeTalk

### 기술 스택 업데이트
- AS-IS: React Native, Next.js, TS, React Query, Redux, SCSS
- TO-BE: React Native 0.81.5 (Expo New Architecture), TypeScript, Redux Toolkit, TanStack Query v5, Zustand, TypeORM, SQLite (Nitro + SQLCipher), MMKV, STOMP/WebSocket, react-native-vision-camera, OpenCV, React Native Reanimated 4, Detox

### 추가된 주요 기능
1. **명함 관리 시스템** — Vision Camera + OpenCV 실시간 명함 자동 감지 (Canny 엣지 감지, Contour 인식)
2. **일정 관리** — 프로젝트 기반 일정, 인라인 캘린더, 참여자 관리
3. **5탭 구조** — Chat / Schedule / MyBizCard / Friends / More
4. **오프라인 아키텍처 개선** — TypeORM + SQLite Nitro + Outbox 패턴으로 오프라인 메시지 큐 완성
5. **E2E 테스트 자동화** — Detox 기반
6. **Reanimated Worklets** — 카메라 프레임 처리를 메인 쓰레드 외에서 실행

---

## 참고 소스
- 프로젝트 경로: `/Users/say/Documents/GitHub/dotoritalk-app`
- 최신 커밋: 읽음 동기화, 오프라인 Outbox, 바텀탭 확장 등 활발히 개발 중

---

## 구현 계획
1. `src/data/profile.ts` 의 experiences[0] 업데이트 (비즈비 항목)
2. `src/data/profile.ts` 의 projects[0] 업데이트 (BizbeeeTalk 상세)
3. Skills 섹션 기술 스택 보강 (OpenCV, TypeORM, MMKV, Detox 등)
4. 빌드 확인 및 커밋

---

## 완료 기준
- [ ] 프로젝트명 도토리톡 → 비즈비톡 변경
- [ ] 기술 스택 최신화
- [ ] 명함 관리, 일정 관리 기능 항목 추가
- [ ] 오프라인 아키텍처 설명 보강
- [ ] Detox E2E 테스트 항목 추가
