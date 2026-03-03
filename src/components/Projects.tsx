import { projects } from "@/data/profile";

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-medium tracking-widest uppercase text-indigo-500 mb-2">
          Projects
        </h2>
        <h3 className="text-3xl font-bold text-gray-900 mb-12">프로젝트</h3>

        {projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">프로젝트를 추가해주세요.</p>
            <p className="text-sm mt-2">
              <code className="bg-gray-100 px-2 py-1 rounded">
                src/data/profile.ts
              </code>{" "}
              파일의 projects 배열에 입력하면 됩니다.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-md transition-all group"
              >
                <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {project.title}
                </h4>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      GitHub →
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      Live Demo →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
