# say-resume 포트폴리오 계획서

## 목표
개인 이력서 겸 포트폴리오 사이트 — 채용 담당자 및 협업 파트너에게 나를 소개하는 페이지

## 기술 스택
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Vercel 배포

## 페이지 구조

```
/ (메인 — 단일 스크롤 페이지)
  ├── Hero        — 이름, 한줄 소개, CTA
  ├── About       — 자기소개, 사진
  ├── Experience  — 경력 타임라인
  ├── Projects    — 프로젝트 카드 그리드
  └── Contact     — 연락처, 링크
```

## 데이터 구조

### Profile
- name: string
- title: string (직함/역할)
- bio: string (자기소개 텍스트)
- avatar: string (이미지 경로)
- email: string
- github: string
- linkedin: string (선택)

### Experience
- company: string
- role: string
- period: string (예: "2022.03 — 현재")
- description: string[]
- skills: string[]

### Project
- title: string
- description: string
- tech: string[]
- github: string (선택)
- demo: string (선택)
- image: string (선택)

## 개발 순서 (bkit Pipeline)
1. ✅ 프로젝트 초기화
2. 🔄 Phase 1 — 스키마/데이터 구조 정의
3. Phase 2 — 컨벤션 설정
4. Phase 3 — 목업/디자인 방향 결정
5. Phase 4 (생략 — 백엔드 없음)
6. Phase 5 — 컴포넌트/구현
7. Phase 9 — Vercel 배포
