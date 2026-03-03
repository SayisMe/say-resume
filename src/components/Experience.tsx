import { experiences } from "@/data/profile";

export default function Experience() {
  return (
    <section id="experience" className="py-24 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-medium tracking-widest uppercase text-indigo-500 mb-2">
          Experience
        </h2>
        <h3 className="text-3xl font-bold text-gray-900 mb-12">경력</h3>

        {experiences.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">경력 사항을 추가해주세요.</p>
            <p className="text-sm mt-2">
              <code className="bg-gray-100 px-2 py-1 rounded">
                src/data/profile.ts
              </code>{" "}
              파일의 experiences 배열에 입력하면 됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {experiences.map((exp, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-200 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      {exp.role}
                    </h4>
                    <p className="text-indigo-600 font-medium">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-400 whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>
                <ul className="space-y-2 mb-4">
                  {exp.description.map((desc, j) => (
                    <li key={j} className="text-gray-600 flex items-start gap-2">
                      <span className="text-indigo-300 mt-1">—</span>
                      {desc}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {exp.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
