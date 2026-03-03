import { education, licenses, activities } from "@/data/profile";

export default function EducationSection() {
  return (
    <section id="education" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-medium tracking-widest uppercase text-indigo-500 mb-2">
          Education & More
        </h2>
        <h3 className="text-3xl font-bold text-gray-900 mb-12">학력 / 자격증 / 활동</h3>

        <div className="grid md:grid-cols-3 gap-8">
          {/* 학력 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Education
            </h4>
            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i}>
                  <p className="font-semibold text-gray-900">{edu.school}</p>
                  {edu.major && (
                    <p className="text-sm text-gray-600">{edu.major} {edu.degree}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{edu.period}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 자격증 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Licenses
            </h4>
            <ul className="space-y-2">
              {licenses.map((license) => (
                <li key={license} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                  {license}
                </li>
              ))}
            </ul>
          </div>

          {/* 활동 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Activities
            </h4>
            <ul className="space-y-2">
              {activities.map((act) => (
                <li key={act} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0 mt-1.5" />
                  {act}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
