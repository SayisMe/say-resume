import { profile } from "@/data/profile";

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-sm font-medium tracking-widest uppercase text-indigo-500 mb-2">
          Contact
        </h2>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">연락하기</h3>
        <p className="text-gray-500 mb-10 max-w-md mx-auto">
          새로운 기회나 협업에 언제든지 연락 주세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`mailto:${profile.email}`}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
