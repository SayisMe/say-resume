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
