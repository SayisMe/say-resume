export const profile = {
  name: "정세희",
  nameEn: "SEHUI JEONG",
  title: "Frontend Developer",
  tagline: "사용자 경험을 고민하는 프론트엔드 개발자입니다.",
  email: "zanne1218@naver.com",
  github: "https://github.com/SayisMe",
  about: `안녕하세요, 정세희입니다.\n프론트엔드 개발자로서 사용자 중심의 인터페이스를 만드는 것을 즐깁니다.\n새로운 기술을 배우고 적용하는 것을 좋아합니다.`,
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  description: string[];
  skills: string[];
};

export const experiences: Experience[] = [
  // 경력 사항을 여기에 추가해주세요
  // {
  //   company: "회사명",
  //   role: "직함",
  //   period: "2022.03 — 현재",
  //   description: ["담당 업무 1", "담당 업무 2"],
  //   skills: ["React", "TypeScript"],
  // },
];

export type Project = {
  title: string;
  description: string;
  tech: string[];
  github?: string;
  demo?: string;
};

export const projects: Project[] = [
  // 프로젝트를 여기에 추가해주세요
  // {
  //   title: "프로젝트명",
  //   description: "프로젝트 설명",
  //   tech: ["Next.js", "Tailwind CSS"],
  //   github: "https://github.com/SayisMe/project",
  //   demo: "https://example.com",
  // },
];
