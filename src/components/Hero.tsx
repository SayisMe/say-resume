import { profile } from "@/data/profile";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-white to-indigo-50">
      <div className="max-w-5xl w-full">
        <p className="text-indigo-500 text-sm font-medium tracking-widest uppercase mb-4">
          Hello, I&apos;m
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-2">
          {profile.name}
        </h1>
        <p className="text-2xl md:text-3xl text-gray-400 font-light mb-6">
          {profile.nameEn}
        </p>
        <p className="text-lg text-gray-600 max-w-xl mb-10">
          {profile.tagline}
        </p>
        <div className="flex gap-4">
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
    </section>
  );
}
