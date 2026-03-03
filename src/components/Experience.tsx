import { experiences } from "@/data/profile";

export default function Experience() {
  return (
    <section id="experience" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-medium tracking-widest uppercase text-indigo-500 mb-2">
          Experience
        </h2>
        <h3 className="text-3xl font-bold text-gray-900 mb-12">경력</h3>
        <div className="space-y-6">
          {experiences.map((exp, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-200 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-1">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xl font-bold text-gray-900">{exp.company}</h4>
                    {exp.type === "intern" && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        인턴
                      </span>
                    )}
                  </div>
                  <p className="text-indigo-600 font-medium">{exp.role}</p>
                  {exp.team && (
                    <p className="text-sm text-gray-400 mt-0.5">{exp.team}</p>
                  )}
                </div>
                <span className="text-sm text-gray-400 whitespace-nowrap">{exp.period}</span>
              </div>

              {exp.project && (
                <p className="text-sm font-semibold text-gray-500 mt-3 mb-2">
                  ▸ {exp.project}
                </p>
              )}

              <ul className="space-y-1.5 mb-4">
                {exp.description.map((desc, j) => (
                  <li key={j} className="text-gray-600 flex items-start gap-2">
                    <span className="text-indigo-300 mt-1 shrink-0">—</span>
                    {desc}
                  </li>
                ))}
              </ul>

              {exp.skills.length > 0 && (
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
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
