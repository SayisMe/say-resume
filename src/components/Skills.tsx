import { skills } from "@/data/profile";

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-medium tracking-widest uppercase text-indigo-500 mb-2">
          Skills
        </h2>
        <h3 className="text-3xl font-bold text-gray-900 mb-12">기술 스택</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {skills.map((group) => (
            <div key={group.category} className="bg-white rounded-2xl p-6 border border-gray-100">
              <h4 className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-4">
                {group.category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 bg-gray-50 text-gray-700 text-sm rounded-full border border-gray-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
