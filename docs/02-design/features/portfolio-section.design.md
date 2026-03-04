# Design: Portfolio Technical Deep-dive Section

**Feature**: portfolio-section
**Date**: 2026-03-04
**Phase**: Design
**Ref**: [Plan 문서](../../01-plan/features/portfolio-section.plan.md)

---

## 1. 전체 구조 (Architecture Overview)

```
src/
├── app/
│   ├── page.tsx                        (수정) BizbeeeTalk 카드에 링크 추가
│   └── portfolio/
│       ├── page.tsx                    (신규) 목록 페이지
│       └── [slug]/
│           └── page.tsx                (신규) 상세 아티클 페이지
├── components/
│   ├── Navigation.tsx                  (수정) Portfolio 링크 추가
│   ├── Projects.tsx                    (수정) 포트폴리오 링크 추가
│   ├── PortfolioCard.tsx               (신규) 목록 카드
│   └── PortfolioArticle.tsx            (신규) 아티클 본문 렌더러
└── data/
    └── portfolio.ts                    (신규) 7개 아이템 데이터
```

---

## 2. 데이터 타입 설계 (`src/data/portfolio.ts`)

### 2-1. Block 타입 (콘텐츠 블록)

각 섹션은 여러 Block으로 구성된다. 렌더러가 type에 따라 다른 JSX를 출력한다.

```typescript
export type TextBlock = {
  type: "text";
  content: string;           // 일반 문단 (개행은 \n으로 표현)
};

export type DiagramBlock = {
  type: "diagram";
  content: string;           // ASCII 다이어그램 (pre 태그로 렌더링)
};

export type CodeBlock = {
  type: "code";
  lang: string;              // "typescript" | "sql" | "bash" 등
  content: string;           // 코드 문자열
};

export type ListBlock = {
  type: "list";
  items: string[];           // 불릿 리스트 항목
};

export type Block = TextBlock | DiagramBlock | CodeBlock | ListBlock;
```

### 2-2. Section 타입

```typescript
export type PortfolioSection = {
  title: string;             // 소제목 (h3)
  blocks: Block[];
};
```

### 2-3. PortfolioItem 타입 (핵심)

```typescript
export type PortfolioItem = {
  slug: string;              // URL 식별자 (e.g. "offline-first-architecture")
  num: string;               // 번호 표시 (e.g. "01")
  title: string;             // 카테고리 이름 (e.g. "오프라인 우선 아키텍처")
  titleEn: string;           // 영문 부제 (e.g. "Offline-First Architecture")
  summary: string;           // 한 줄 설명 (카드에 표시)
  coreValues: string[];      // 핵심 가치 bullet 3개 (상세 페이지 상단)
  tags: string[];            // 기술 태그 (카드 하단)
  sections: PortfolioSection[];
};

export const portfolioItems: PortfolioItem[] = [ /* 7개 */ ];
```

### 2-4. slug 규칙

```
num → slug 매핑
01  → offline-first-architecture
02  → realtime-stomp
03  → jwt-auth
04  → hybrid-state-management
05  → sqlite-database
06  → advanced-chat-ui
07  → concurrency-async
```

---

## 3. 페이지 설계

### 3-1. `/portfolio` — 목록 페이지

**파일**: `src/app/portfolio/page.tsx`

```typescript
import { portfolioItems } from "@/data/portfolio";
import PortfolioCard from "@/components/PortfolioCard";
import Link from "next/link";

export const metadata = {
  title: "기술 포트폴리오 — SEHUI JEONG",
  description: "BizbeeeTalk 개발에서 풀어낸 7가지 기술 문제",
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen pt-24 pb-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <Link href="/#projects" className="...">← 프로젝트로</Link>
        <h1>기술 포트폴리오</h1>
        <p>BizbeeeTalk 앱 개발에서 풀어낸 7가지 기술 문제</p>

        {/* 카드 목록 */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {portfolioItems.map((item) => (
            <PortfolioCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </main>
  );
}
```

**레이아웃 (카드 그리드)**:
```
┌──────────────────────┬──────────────────────┐
│ [01]                 │ [02]                 │
│ 오프라인 우선 아키텍처 │ 실시간 통신 STOMP    │
│ 한 줄 설명           │ 한 줄 설명           │
│ #SQLite #Sync        │ #WebSocket #STOMP    │
├──────────────────────┼──────────────────────┤
│ [03]                 │ [04]                 │
│ JWT 인증             │ 하이브리드 상태 관리   │
│ ...                  │ ...                  │
├──────────────────────┴──────────────────────┤
│ [05]  [06]  [07]  (홀수 개면 왼쪽 정렬)      │
└─────────────────────────────────────────────┘
```

---

### 3-2. `/portfolio/[slug]` — 상세 페이지

**파일**: `src/app/portfolio/[slug]/page.tsx`

```typescript
import { portfolioItems } from "@/data/portfolio";
import PortfolioArticle from "@/components/PortfolioArticle";
import { notFound } from "next/navigation";

// 빌드 타임 정적 생성
export function generateStaticParams() {
  return portfolioItems.map((item) => ({ slug: item.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const item = portfolioItems.find((i) => i.slug === params.slug);
  if (!item) return {};
  return {
    title: `${item.num}. ${item.title} — SEHUI JEONG`,
    description: item.summary,
  };
}

export default function PortfolioDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const item = portfolioItems.find((i) => i.slug === params.slug);
  if (!item) notFound();

  const idx = portfolioItems.indexOf(item);
  const prev = portfolioItems[idx - 1] ?? null;
  const next = portfolioItems[idx + 1] ?? null;

  return <PortfolioArticle item={item} prev={prev} next={next} />;
}
```

**레이아웃**:
```
┌─────────────────────────────────────────────┐
│  ← 기술 포트폴리오                           │   (상단 뒤로가기)
│                                             │
│  01                                         │   (번호, 작게)
│  오프라인 우선 아키텍처                      │   (h1, 크게)
│  Offline-First Architecture                 │   (영문 부제, 회색)
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 핵심 가치                            │   │   (배경색 박스)
│  │ • 네트워크 불안정 환경에서도 앱 기능  │   │
│  │ • UI와 서버 통신 레이어를 완전히 분리 │   │
│  │ • 일관된 데이터 흐름으로 버그 추적   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [섹션 제목]                                │   (h2)
│  [텍스트 블록]                              │
│  ┌ diagram / code 블록 ──────────────────┐  │
│  │  (monospace, 배경 어두움)              │  │
│  └────────────────────────────────────────┘  │
│                                             │
│  ... (섹션 반복)                            │
│                                             │
│  ─────────────────────────────────────────  │
│  ← 이전: JWT 인증    |   다음: 하이브리드 → │   (이전/다음 네비)
└─────────────────────────────────────────────┘
```

---

## 4. 컴포넌트 설계

### 4-1. `PortfolioCard`

**파일**: `src/components/PortfolioCard.tsx`

```typescript
// Props
type Props = {
  item: PortfolioItem;
};

// 렌더링 구조
// <Link href={`/portfolio/${item.slug}`}>
//   <article>
//     <div>  ← 번호 + 영문 제목
//       <span>{item.num}</span>
//       <span>{item.titleEn}</span>
//     </div>
//     <h3>{item.title}</h3>
//     <p>{item.summary}</p>
//     <div>  ← 태그
//       {item.tags.map(tag => <span>#{tag}</span>)}
//     </div>
//   </article>
// </Link>
```

**스타일 가이드** (기존 사이트 일관성):
- 배경: `bg-white border border-gray-100 rounded-2xl`
- 호버: `hover:border-indigo-200 hover:shadow-md transition-all`
- 번호: `text-4xl font-bold text-indigo-100` (장식용, 크게)
- 태그: `px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md border border-gray-100`
- 전체 카드가 클릭 가능한 링크 (Next.js `<Link>` 사용)

---

### 4-2. `PortfolioArticle`

**파일**: `src/components/PortfolioArticle.tsx`

```typescript
// Props
type Props = {
  item: PortfolioItem;
  prev: PortfolioItem | null;
  next: PortfolioItem | null;
};
```

내부 블록 렌더 함수:

```typescript
function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case "text":
      return <p key={index}>{block.content}</p>;

    case "diagram":
      return (
        <pre key={index} className="...monospace 스타일...">
          {block.content}
        </pre>
      );

    case "code":
      return (
        <pre key={index} className="...dark 배경...">
          <code className={`language-${block.lang}`}>
            {block.content}
          </code>
        </pre>
      );

    case "list":
      return (
        <ul key={index}>
          {block.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
  }
}
```

**스타일 상세**:

| 블록 타입 | 배경 | 폰트 | 기타 |
|----------|------|------|------|
| text | 없음 | geist-sans | `text-gray-700 leading-relaxed` |
| diagram | `bg-gray-900` | `font-mono text-sm` | `text-green-400 overflow-x-auto` |
| code | `bg-gray-900` | `font-mono text-sm` | `text-gray-100 overflow-x-auto` |
| list | 없음 | geist-sans | `text-gray-600`, bullet `text-indigo-400` |

이전/다음 네비게이션:
```typescript
// 하단 prev/next
<nav>
  {prev && <Link href={`/portfolio/${prev.slug}`}>← {prev.title}</Link>}
  {next && <Link href={`/portfolio/${next.slug}`}>  {next.title} →</Link>}
</nav>
```

---

## 5. 기존 파일 수정 사항

### 5-1. `Navigation.tsx` 수정

```typescript
// 변경 전
const navItems = [
  { label: "About", href: "#about" },
  ...
  { label: "Contact", href: "#contact" },
];

// 변경 후: Portfolio 추가 (앵커 방식과 혼재 허용)
const navItems = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Portfolio", href: "/portfolio" },   // ← 신규 (일반 링크)
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];
```

링크 렌더링: `href`가 `/`로 시작하면 `<Link>` (Next.js), `#`으로 시작하면 `<a>`.

### 5-2. `Projects.tsx` 수정

BizbeeeTalk 카드 하단 링크 영역에 포트폴리오 링크 추가:

```tsx
// 기존 GitHub / npm 링크 아래에 추가 (BizbeeeTalk만)
{project.title === "BizbeeeTalk" && (
  <Link
    href="/portfolio"
    className="text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
  >
    기술 포트폴리오 →
  </Link>
)}
```

**더 나은 방법**: `profile.ts`의 `Project` 타입에 `portfolioHref?: string` 필드 추가:
```typescript
// profile.ts에 필드 추가
export type Project = {
  ...
  portfolioHref?: string;   // 포트폴리오 링크 (선택)
};

// BizbeeeTalk 데이터에 추가
{
  title: "BizbeeeTalk",
  ...
  portfolioHref: "/portfolio",
}
```

---

## 6. 라우팅 & Next.js 설정

### `next.config.ts` 확인 필요

현재 설정에 `output: "export"` 여부 확인. 없으면 변경 불필요.
`generateStaticParams` 사용 시 별도 설정 없이 정적 생성 동작.

### 404 처리

`/portfolio/[slug]` 에서 매칭 안 될 경우 → `notFound()` 호출 → Next.js 기본 404 페이지.

---

## 7. 구현 순서 (Do Phase 가이드)

```
Step 1. src/data/portfolio.ts 작성
        └─ PortfolioItem 타입 정의
        └─ 7개 아이템 데이터 입력 (docs/portfolio/ README 참고)

Step 2. PortfolioCard 컴포넌트 작성

Step 3. /portfolio 목록 페이지 작성
        └─ PortfolioCard 사용

Step 4. PortfolioArticle 컴포넌트 작성
        └─ Block 렌더러 구현

Step 5. /portfolio/[slug] 상세 페이지 작성
        └─ generateStaticParams
        └─ PortfolioArticle 사용

Step 6. Navigation.tsx 수정
        └─ Portfolio 링크 추가
        └─ Link vs a 분기 처리

Step 7. profile.ts + Projects.tsx 수정
        └─ portfolioHref 필드 추가
        └─ BizbeeeTalk 카드에 링크 표시

Step 8. npm run build 확인
```

---

## 8. 완료 기준 (Done Criteria)

- [ ] `portfolioItems` 배열에 7개 아이템 모두 입력 완료
- [ ] `/portfolio` → 7개 카드 그리드 표시
- [ ] `/portfolio/[slug]` → 각 아이템 상세 페이지 접근 가능
- [ ] 다이어그램 (`type: "diagram"`) monospace 렌더링 정상
- [ ] 코드 블록 (`type: "code"`) dark 배경 렌더링 정상
- [ ] 이전/다음 네비게이션 동작
- [ ] Navigation에 Portfolio 링크 표시
- [ ] BizbeeeTalk 카드 → "기술 포트폴리오 →" 링크 동작
- [ ] `npm run build` 에러 없음
- [ ] 모바일 반응형 정상

---

## 9. 다음 단계

```
/pdca do portfolio-section   ← 구현 시작
```
