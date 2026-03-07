import { profile } from "@/data/profile";

export default function About() {
  return (
    <section id="about" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-medium tracking-widest uppercase text-indigo-500 mb-2">
          About
        </h2>
        <h3 className="text-3xl font-bold text-gray-900 mb-12">소개</h3>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* 프로필 아바타 */}
          <div className="shrink-0 mx-auto md:mx-0">
            <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-5xl font-bold text-white select-none">
                {profile.name[0]}
              </span>
            </div>
          </div>

          {/* 소개 텍스트 */}
          <div className="space-y-5 flex-1">
            {profile.about.map((line, i) => (
              <p key={i} className="text-gray-600 text-lg leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* 연락처 */}
        <div className="mt-12 bg-indigo-50 rounded-2xl p-6 flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <span className="text-indigo-400 text-lg">✉</span>
            <a
              href={`mailto:${profile.email}`}
              className="text-gray-700 hover:text-indigo-600 transition-colors break-all"
            >
              {profile.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-indigo-400 text-lg">⌥</span>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              github.com/SayisMe
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
