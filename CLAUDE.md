# say-resume — Portfolio & Resume Site

## Project Overview

개인 이력서 및 포트폴리오 웹사이트

- **Level**: Starter
- **Stack**: Next.js 15 + TypeScript + Tailwind CSS
- **Deployment**: Vercel (예정)

## Sections

- **소개/About** — 자기소개, 프로필
- **경력/Experience** — 직장 경력, 담당 업무
- **프로젝트/Projects** — 개발 프로젝트 목록

## Conventions

- App Router (`src/app/`) 사용
- 컴포넌트는 `src/components/` 에 위치
- 데이터는 `src/data/` 에 TypeScript 객체로 관리 (CMS 불필요)
- Tailwind CSS utility class 사용, 별도 CSS 파일 최소화

## Commands

- `npm run dev` — 개발 서버 실행 (http://localhost:3000)
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint 검사

<!-- Co-Authored-By 트레일러 절대 추가하지 말 것 -->

Format: `<type>: <한글요약>`
Example: `fix: 채팅방 미읽음 뱃지 오류 수정`
Do **not** add a Co-Authored-By trailer to any commit.

<!-- 커밋은 논리적 작업 단위로 잘게 쪼개서 진행. 여러 기능/수정을 하나의 커밋에 묶지 말 것 -->

Commit granularity: one logical change per commit. Do not bundle unrelated changes together.

<!-- 같은 파일이라도 포매팅(prettier/lint) 변경과 실제 로직 변경은 반드시 별도 커밋으로 분리 -->
<!-- 예: import 정렬·따옴표 통일 → style 커밋 / 조건문 수정 → fix 커밋 -->

Formatting vs logic: even within the same file, separate prettier/lint-only changes from actual logic changes into distinct commits.
