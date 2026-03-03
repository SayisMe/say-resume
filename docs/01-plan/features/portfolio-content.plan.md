# [Plan] portfolio-content

## 목표
이력서 PDF 데이터를 포트폴리오 사이트에 완전히 반영하여,
채용담당자/협업파트너가 정세희의 경력·프로젝트·역량을 한눈에 파악할 수 있는 사이트 완성

## 현재 상태 (As-Is)
- ✅ Hero, About, Experience, Projects, Contact 섹션 골격 구현
- ❌ 실제 데이터 없음 (profile.ts 플레이스홀더 상태)
- ❌ Skills, Education, Licenses 섹션 없음

## 목표 상태 (To-Be)

### 섹션 구성
| 섹션 | 현재 | 목표 |
|------|------|------|
| Hero | 플레이스홀더 | 실제 이름/직함/tagline 반영 |
| About | 플레이스홀더 | 실제 자기소개 3줄 반영 |
| Skills | 없음 | 기술 스택 시각적으로 표시 |
| Experience | 빈 배열 | 비즈비(현재) + 인턴십 3개 반영 |
| Projects | 빈 배열 | Dotoritalk + MoodMemo 상세 반영 |
| Education | 없음 | 학력 + 자격증 + 활동 통합 섹션 |
| Contact | 구현됨 | 유지 |

---

## 추출된 데이터 (이력서 PDF 기반)

### 프로필
- **이름**: 정세희 (JEONG SEHUI)
- **직함**: Front-End & React Native Developer
- **위치**: 용인시, 경기도
- **이메일**: zanne1218@naver.com
- **GitHub**: https://github.com/SayisMe

### 핵심 가치 (tagline 후보)
1. "기능을 만드는 일 뿐만 아니라, 유지보수까지 고려한 코드 작성에 집중합니다."
2. "Side-Effect를 최소화하며 리팩토링하는 데 강점을 가지고 있습니다."
3. "복잡한 문제일수록 본질을 찾아 단단하게 해결하는 과정에서 성장한다고 느낍니다."

### 기술 스택
**Frontend**: React Native, Next.js, React, TypeScript, Redux, React Query, SCSS, react-hook-form
**Native**: Swift, Kotlin, Objective-C, Unity3D
**DB/Infra**: SQLite, Firebase, WebSocket/STOMP
**Tools**: ESLint, Prettier, Figma, Amplitude

### Work Experience
1. **주식회사 비즈비** (2024.09 – 현재)
   - 솔루션본부 도토리톡팀 / 사원 / 프론트엔드 개발
   - Dotori Talk: 개인 소통 및 업무 협업용 메신저
   - Web FE + React Native 앱 개발, AOS/iOS 빌드 및 배포
   - 기술: React Native, Next.js, TS, React Query, Redux, SCSS

2. **한국산업은행** (2024.05 – 2024.08) — 인턴
   - 코어금융부 글로벌개발팀
   - NEW-KINS IT 재구축 사업관리 보조

3. **NAVER Z** (2022.03 – 2022.06) — 인턴
   - Contents Dev팀
   - ZEPETO world: Doll House, Road Dash 기능 구현 및 애니메이션
   - 기술: Unity3D, TS

4. **한국과학기술연구원** (2021.03 – 2021.08) — 인턴
   - 바이오닉스연구센터
   - Rehability, DVT app 기능 구현
   - 기술: Unity3D, TS

### Projects
1. **Dotoritalk** (2024.12 – 진행중)
   - 개인 소통 및 업무 협업용 메신저 서비스 (AOS/iOS/Web)
   - STOMP/WebSocket 실시간 채팅, 낙관적 업데이트
   - npm 패키지 직접 제작: react-native-share-media
   - Android/iOS 네이티브 모듈 9개 개발 (Kotlin, Swift, ObjC)
   - Redux 24 slice, SQLite 14테이블, FTS4 검색
   - FlashList/FlatList 렌더링 최적화
   - 기술: React Native, Next.js, TS, Redux, React Query, SQLite, STOMP/WebSocket

2. **MoodMemo** (2023.06 – 2023.11)
   - 감정스탬프 + AI일기앱 (Android/iOS)
   - ChatGPT API 기반 AI 일기 생성
   - 평점 4.93, 누적 다운로드 3,200, MAU 1,400
   - SW마에스트로 14기 우수 인증프로젝트 (상위 9%)
   - 특허 공동출원 (출원번호: 10-2023-0145409)
   - 두나무 투자유치 미팅, AWS 크레딧 제안
   - 기술: React Native, TypeScript

### Education
- 서울과학기술대학교 컴퓨터공학과 학사 (2017.03 – 2022.02)

### Licenses
- 정보처리기사
- PCCP C++ Lv.3
- SQLD
- PCSQL MySQL Lv.1
- 컴퓨터활용능력 1급
- PCCE C++ Lv.3
- 한국사능력검정 1급
- TOPCIT 수준3
- TOEIC 865

### Extra Activities
- SKT데보션 영 3기 테크인플루언서
- SW마에스트로 14기 연수생 수료
- 2021 한이음ICT 멘토링
- 2020 프로보노ICT 멘토링
- 2018 평창 동계올림픽 자원봉사

---

## 구현 계획

### Phase 1 — 데이터 업데이트 (즉시)
- `src/data/profile.ts` 실제 데이터로 전면 교체
- tagline, about, experiences, projects 채우기

### Phase 2 — 새 섹션 추가
- `Skills` 컴포넌트: 기술 스택 카테고리별 태그
- `Education` 컴포넌트: 학력 + 자격증 + 활동

### Phase 3 — 디자인 개선 (선택)
- Hero 애니메이션 (타이핑 효과 등)
- 프로젝트 카드 hover 효과 강화
- 스크롤 애니메이션

### Phase 4 — 배포
- Vercel 연결 및 커스텀 도메인 (선택)

---

## 완료 기준
- [ ] 모든 섹션에 실제 데이터 표시
- [ ] Skills 섹션 추가
- [ ] Education/자격증 섹션 추가
- [ ] 모바일 반응형 확인
- [ ] Vercel 배포
