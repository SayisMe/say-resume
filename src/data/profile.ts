export const profile = {
  name: "정세희",
  nameEn: "JEONG SEHUI",
  title: "Front-End & React Native Developer",
  tagline: "기능을 만드는 일 뿐만 아니라, 유지보수까지 고려한 코드 작성에 집중합니다.",
  email: "zanne1218@naver.com",
  github: "https://github.com/SayisMe",
  about: [
    "변수명 하나, 폴더 구조 하나에도 의도가 드러나는 코드를 작성합니다. 코드 관리가 팀 전체의 생산성에 영향을 준다고 생각하기 때문입니다.",
    "Side-Effect를 최소화하며 리팩토링하는 데 강점을 가지고 있습니다. 파급력 있는 수정이 팀 전체에 어떤 영향을 미칠지 먼저 고려하고, 더 나은 구조를 함께 제안합니다.",
    "복잡한 문제일수록 본질을 찾아 단단하게 해결하는 과정에서 성장한다고 느낍니다. 문제의 표면만 보지 않고, 원인을 정확히 파악한 뒤 구조적으로 해결하는 걸 좋아합니다.",
  ],
};

export type Skill = {
  category: string;
  items: string[];
};

export const skills: Skill[] = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "SCSS", "Redux Toolkit", "TanStack Query", "Zustand", "react-hook-form"],
  },
  {
    category: "Mobile",
    items: ["React Native", "Expo", "Swift", "Kotlin", "Objective-C", "Vision Camera", "Reanimated"],
  },
  {
    category: "DB / Infra",
    items: ["SQLite", "TypeORM", "MMKV", "Firebase", "WebSocket / STOMP"],
  },
  {
    category: "Tools",
    items: ["Git", "Detox", "ESLint", "Prettier", "Figma", "OpenCV", "Unity3D"],
  },
];

export type Experience = {
  company: string;
  role: string;
  period: string;
  team?: string;
  type?: "work" | "intern";
  project?: string;
  description: string[];
  skills: string[];
};

export const experiences: Experience[] = [
  {
    company: "주식회사 비즈비",
    role: "사원 / 프론트엔드 개발",
    period: "2024.09 – 현재",
    team: "솔루션본부",
    type: "work",
    project: "BizbeeeTalk (구. 도토리톡)",
    description: [
      "React Native(Expo New Architecture) 기반 기업용 메신저 앱 개발 — 채팅, 일정, 명함 관리 통합",
      "Vision Camera + OpenCV Worklet으로 실시간 명함 자동 감지 시스템 구현 (Canny 엣지 감지, Contour 인식)",
      "TypeORM + SQLite(Nitro/SQLCipher) + Outbox 패턴으로 오프라인-온라인 하이브리드 아키텍처 설계",
      "STOMP/WebSocket 실시간 메시징 + 낙관적 업데이트(Optimistic UI) 구현",
      "Detox 기반 E2E 테스트 자동화 구축",
      "AOS / iOS 빌드 및 배포",
    ],
    skills: ["React Native", "Expo", "TypeScript", "Redux Toolkit", "TanStack Query", "TypeORM", "SQLite", "STOMP/WebSocket", "OpenCV", "Detox"],
  },
  {
    company: "한국산업은행",
    role: "인턴",
    period: "2024.05 – 2024.08",
    team: "코어금융부 글로벌개발팀",
    type: "intern",
    project: "NEW-KINS (산업은행 글로벌뱅킹시스템)",
    description: [
      "IT 재구축 사업관리 사무 보조",
      "사업수행계획서, 투입인력, WBS 등 문서 관리",
    ],
    skills: [],
  },
  {
    company: "NAVER Z",
    role: "인턴",
    period: "2022.03 – 2022.06",
    team: "Contents Dev팀",
    type: "intern",
    project: "ZEPETO world",
    description: [
      "Doll House (공식계정 릴리즈) 기능 구현 및 애니메이션 적용",
      "Road Dash (일반계정 릴리즈) 기능 구현 및 애니메이션 적용",
    ],
    skills: ["Unity3D", "TypeScript"],
  },
  {
    company: "한국과학기술연구원",
    role: "인턴",
    period: "2021.03 – 2021.08",
    team: "바이오닉스연구센터",
    type: "intern",
    project: "바이오메디컬 연구과제",
    description: [
      "Rehability 기능 구현 및 실험",
      "DVT app 기능 구현 및 실험",
    ],
    skills: ["Unity3D", "TypeScript"],
  },
];

export type Project = {
  title: string;
  description: string;
  detail: string[];
  tech: string[];
  github?: string;
  demo?: string;
  period: string;
  highlight?: string;
};

export const projects: Project[] = [
  {
    title: "BizbeeeTalk",
    period: "2024.09 – 진행중",
    description: "기업용 메신저 앱 — 채팅 · 일정 · 명함 관리 통합 서비스 (AOS / iOS)",
    detail: [
      "Vision Camera + OpenCV Worklet으로 실시간 명함 자동 감지 구현 (카메라 프레임에서 사각형 인식)",
      "TypeORM + SQLite(Nitro/SQLCipher) + Outbox 패턴 오프라인 아키텍처 — 네트워크 단절 시에도 메시지 손실 없음",
      "STOMP/WebSocket 실시간 채팅 + 낙관적 업데이트(Optimistic UI) 및 읽음 동기화",
      "150+ Custom Hooks 구조 (useGet*, useAdd*, useSync*, useSlidingWindowChatMessages 등)",
      "npm 패키지 직접 제작: react-native-share-media (TurboModule) — iOS Share Extension 포함",
      "Detox 기반 E2E 테스트 자동화 구축 / Kotlin·Swift·Objective-C 네이티브 모듈 개발",
    ],
    tech: ["React Native 0.81", "Expo New Architecture", "TypeScript", "Redux Toolkit", "TanStack Query v5", "Zustand", "TypeORM", "SQLite", "STOMP/WebSocket", "OpenCV", "Vision Camera", "Detox"],
    demo: "https://www.npmjs.com/package/react-native-share-media",
  },
  {
    title: "MoodMemo",
    period: "2023.06 – 2023.11",
    description: "감정스탬프와 메모 한줄로 만드는 AI 일기앱 서비스",
    detail: [
      "ChatGPT API 기반 AI 일기 생성 모듈 설계 및 구현",
      "Google Play / App Store 배포 총괄",
      "Firebase Dynamic Links 딥링크, Amplitude 퍼널 분석",
      "평점 4.93 / 누적 다운로드 3,200 / MAU 1,400 달성",
      "SW마에스트로 14기 우수 인증프로젝트 (상위 9%)",
    ],
    highlight: "SW마에스트로 14기 우수 인증 · 특허 공동출원 · 두나무 투자유치 미팅",
    tech: ["React Native", "TypeScript", "Firebase", "ChatGPT API"],
  },
];

export type Education = {
  school: string;
  major?: string;
  degree?: string;
  period: string;
};

export const education: Education[] = [
  {
    school: "서울과학기술대학교",
    major: "컴퓨터공학과",
    degree: "학사",
    period: "2017.03 – 2022.02",
  },
];

export const licenses = [
  "정보처리기사",
  "PCCP C++ Lv.3",
  "SQLD",
  "PCSQL MySQL Lv.1",
  "컴퓨터활용능력 1급",
  "PCCE C++ Lv.3",
  "한국사능력검정 1급",
  "TOPCIT 수준3",
  "TOEIC 865",
];

export const activities = [
  "SKT데보션 영 3기 테크인플루언서",
  "SW마에스트로 14기 연수생 수료 (상위 9% 우수프로젝트 인증)",
  "2021 한이음ICT 멘토링",
  "2020 프로보노ICT 멘토링",
  "2018 평창 동계올림픽 자원봉사",
];
