import Link from "next/link";
import { projects } from "@/data/profile";

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-medium tracking-widest uppercase text-indigo-500 mb-2">
          Projects
        </h2>
        <h3 className="text-3xl font-bold text-gray-900 mb-12">프로젝트</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-8 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-xl font-bold text-gray-900">{project.title}</h4>
                <span className="text-xs text-gray-400 whitespace-nowrap mt-1">{project.period}</span>
              </div>
              <p className="text-gray-600 mb-4">{project.description}</p>

              <ul className="space-y-1.5 mb-5 flex-1">
                {project.detail.map((d, j) => (
                  <li key={j} className="text-sm text-gray-500 flex items-start gap-2">
                    <span className="text-indigo-300 mt-0.5 shrink-0">—</span>
                    {d}
                  </li>
                ))}
              </ul>

              {project.highlight && (
                <div className="mb-4 px-4 py-2.5 bg-indigo-50 rounded-xl text-sm text-indigo-700">
                  🏆 {project.highlight}
                </div>
              )}

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

              <div className="flex gap-4 flex-wrap">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    GitHub →
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    npm →
                  </a>
                )}
                {project.portfolioHref && (
                  <Link
                    href={project.portfolioHref}
                    className="text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                  >
                    기술 포트폴리오 →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
