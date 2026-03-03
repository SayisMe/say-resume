import { profile } from "@/data/profile";

export default function About() {
  return (
    <section id="about" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-medium tracking-widest uppercase text-indigo-500 mb-2">
          About
        </h2>
        <h3 className="text-3xl font-bold text-gray-900 mb-12">소개</h3>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            {profile.about.split("\n").map((line, i) => (
              <p key={i} className="text-gray-600 text-lg leading-relaxed mb-4">
                {line}
              </p>
            ))}
          </div>
          <div className="bg-indigo-50 rounded-2xl p-8">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="text-indigo-400">✉</span>
                <a
                  href={`mailto:${profile.email}`}
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  {profile.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-indigo-400">⌥</span>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  github.com/SayisMe
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
