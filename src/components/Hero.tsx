import { profile } from "@/data/profile";

const techBadges = [
  { label: "React Native", color: "bg-blue-100 text-blue-700" },
  { label: "TypeScript", color: "bg-sky-100 text-sky-700" },
  { label: "Next.js", color: "bg-gray-100 text-gray-700" },
  { label: "WebSocket", color: "bg-green-100 text-green-700" },
  { label: "SQLite", color: "bg-orange-100 text-orange-700" },
  { label: "OpenCV", color: "bg-purple-100 text-purple-700" },
];

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-white to-indigo-50 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-5xl w-full relative grid md:grid-cols-[1fr_200px] gap-12 items-center">
        <div>
          <p className="text-indigo-500 text-sm font-medium tracking-widest uppercase mb-4">
            Hello, I&apos;m
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-2">
            {profile.name}
          </h1>
          <p className="text-2xl md:text-3xl text-gray-400 font-light mb-3">
            {profile.nameEn}
          </p>
          <p className="text-xl text-indigo-500 font-medium mb-6">
            {profile.title}
          </p>
          <p className="text-lg text-gray-600 max-w-xl mb-10">
            {profile.tagline}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#projects"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              프로젝트 보기
            </a>
            <a
              href="#contact"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              연락하기
            </a>
          </div>
        </div>

        {/* 기술 배지 — 데스크탑 전용 */}
        <div className="hidden md:flex flex-col gap-3 items-start">
          {techBadges.map((badge) => (
            <span
              key={badge.label}
              className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm ${badge.color}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
