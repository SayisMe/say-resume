# Plan: Portfolio Technical Deep-dive Section

**Feature**: portfolio-section
**Date**: 2026-03-04
**Phase**: Plan

---

## 1. 목표 (Goal)

`docs/portfolio/` 폴더의 7개 기술 문서를 Next.js 포트폴리오 사이트에 통합하여,
BizbeeeTalk 프로젝트의 기술적 깊이를 방문자에게 보여주는 **기술 포트폴리오 섹션**을 구현한다.

---

## 2. 현황 분석 (Current State)

### 기존 사이트 구조
```
src/
  app/
    page.tsx          ← 단일 페이지 (Hero, About, Experience, Projects, Skills, Education 순서)
  components/
    Projects.tsx      ← BizbeeeTalk, MoodMemo 카드 표시 (단순 목록)
  data/
    profile.ts        ← 모든 정적 데이터 (experiences, projects, skills 등)
```

### portfolio 원본 문서 (docs/portfolio/)
| 번호 | 카테고리 | 핵심 기술 |
|------|---------|-----------|
| 01 | 오프라인 우선 아키텍처 | Flux, Action/Engine/Repository, SQLite 동기화 |
| 02 | 실시간 통신 STOMP | WebSocket, 자동 재구독, Echo 전송 확인 |
| 03 | JWT 인증 & 토큰 관리 | 이중 Axios, 자동 갱신, 무한 루프 방지 |
| 04 | 하이브리드 상태 관리 | Redux Toolkit + React Query + Zustand 역할 분리 |
| 05 | SQLite 로컬 데이터베이스 | 마이그레이션, FTS, JSON 쿼리, Chunk UPSERT |
| 06 | 고급 채팅 UI | 양방향 무한 스크롤, 3D 애니메이션, 멘션/이모티콘 |
| 07 | 동시성 & 비동기 패턴 | AsyncMutex, Outbox 패턴, Delta Sync |

---

## 3. 구현 방향 (Approach)

### 결정사항: 전용 페이지 방식 (App Router)

```
/                       ← 기존 메인 페이지 (변경 없음)
/portfolio              ← 기술 포트폴리오 목록 페이지 (신규)
/portfolio/[slug]       ← 개별 기술 아티클 페이지 (신규)
```

**이 방식을 선택한 이유:**
- 7개 문서 각각이 상세한 다이어그램·코드를 포함 → 별도 페이지가 적합
- Next.js Static Generation으로 빌드 타임에 렌더링 → 추가 서버 불필요
- 메인 페이지 `Projects` 카드에 "기술 상세 보기" 링크만 추가하면 자연스럽게 연결

### 데이터 관리 전략

원본 markdown 파일을 **직접 파싱하지 않고**, TypeScript 데이터 객체로 변환하여 관리한다.

```
src/data/portfolio.ts   ← 7개 기술 카테고리 데이터 (신규)
```

이유:
- CLAUDE.md 컨벤션: "데이터는 src/data/에 TypeScript 객체로 관리"
- markdown 파서 라이브러리 추가 없이 순수 Next.js 유지
- 코드 블록, 다이어그램, 테이블 등을 JSX로 직접 표현 가능

**단, 콘텐츠 분량이 많으므로** 각 카테고리의 핵심만 추출하여 구조화:
- `summary`: 1-2문장 요약
- `coreValue`: 핵심 가치 bullet points (3개)
- `sections`: 소제목별 설명 + 코드/다이어그램 블록
- `tags`: 관련 기술 태그

---

## 4. 페이지별 구현 계획

### 4-1. `/portfolio` — 목록 페이지

```
┌─────────────────────────────────────────────────────┐
│  기술 포트폴리오                                     │
│  BizbeeeTalk 앱 개발에서 풀어낸 7가지 기술 문제     │
├────────────┬────────────────────────────────────────┤
│ [01]       │ 오프라인 우선 아키텍처                  │
│ Offline    │ Flux 패턴 기반 3계층 설계               │
│ First      │ #SQLite #Sync #Architecture            │
├────────────┼────────────────────────────────────────┤
│ [02]       │ 실시간 통신 STOMP/WebSocket             │
│ Realtime   │ 자동 재연결 + Echo 기반 전송 확인       │
│ STOMP      │ #WebSocket #STOMP #Reconnect           │
├────────────┴────────────────────────────────────────┤
│  ... (7개 카드)                                     │
└─────────────────────────────────────────────────────┘
```

### 4-2. `/portfolio/[slug]` — 상세 페이지

```
┌─────────────────────────────────────────────────────┐
│  ← 기술 포트폴리오                                   │
│                                                     │
│  01. 오프라인 우선 아키텍처                          │
│                                                     │
│  핵심 가치                                          │
│  • 네트워크 불안정 환경에서도 앱 기능 유지           │
│  • UI와 서버 통신 레이어를 완전히 분리              │
│  • 일관된 데이터 흐름으로 버그 추적 용이            │
│                                                     │
│  아키텍처 다이어그램                                │
│  ┌──────────────────────────────┐                  │
│  │  [ASCII diagram here]        │                  │
│  └──────────────────────────────┘                  │
│                                                     │
│  1. Flux 패턴 적용 이유                             │
│  ...                                               │
│                                                     │
│  ← 이전  |  다음 →                                 │
└─────────────────────────────────────────────────────┘
```

### 4-3. 메인 페이지 연결

`Projects.tsx`의 BizbeeeTalk 카드에 링크 추가:
```
[BizbeeeTalk 카드]
  설명 ...
  사용 기술 태그들
  [GitHub] [데모] [기술 포트폴리오 →]  ← 신규
```

Navigation에 "Portfolio" 항목 추가 (선택, 논의 필요).

---

## 5. 파일 변경 목록

### 신규 파일
| 파일 | 역할 |
|------|------|
| `src/data/portfolio.ts` | 7개 포트폴리오 카테고리 데이터 |
| `src/app/portfolio/page.tsx` | 포트폴리오 목록 페이지 |
| `src/app/portfolio/[slug]/page.tsx` | 개별 아티클 페이지 (generateStaticParams) |
| `src/components/PortfolioCard.tsx` | 목록 카드 컴포넌트 |
| `src/components/PortfolioArticle.tsx` | 아티클 본문 컴포넌트 |

### 수정 파일
| 파일 | 변경 내용 |
|------|----------|
| `src/components/Projects.tsx` | BizbeeeTalk 카드에 포트폴리오 링크 추가 |
| `src/components/Navigation.tsx` | Portfolio 링크 추가 |

### 변경 없음
| 파일 | 이유 |
|------|------|
| `src/data/profile.ts` | 기존 데이터 유지 |
| `src/app/page.tsx` | 메인 페이지 구조 유지 |
| `src/app/layout.tsx` | 레이아웃 변경 없음 |

---

## 6. 기술 제약 & 주의사항

- **라이브러리 추가 없음**: markdown 파서(marked, remark 등) 사용 안 함
- **Static 유지**: `generateStaticParams`로 빌드 타임 정적 생성
- **ASCII 다이어그램**: `<pre>` 태그 + monospace 폰트로 표현
- **코드 블록**: Tailwind typography 또는 `<pre><code>` 직접 스타일링

---

## 7. 완료 기준 (Done Criteria)

- [ ] `/portfolio` 접속 시 7개 카드 목록 표시
- [ ] 각 카드 클릭 시 `/portfolio/[slug]` 페이지로 이동
- [ ] 각 아티클에 다이어그램, 코드, 설명 포함
- [ ] 메인 페이지 BizbeeeTalk 카드에서 포트폴리오 링크 동작
- [ ] `npm run build` 정상 완료 (Static Export)
- [ ] 모바일 반응형 유지

---

## 8. 다음 단계

`/pdca design portfolio-section` — 컴포넌트 구조 및 데이터 타입 상세 설계
