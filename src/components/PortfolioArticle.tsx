import Link from "next/link";
import { Block, PortfolioItem } from "@/data/portfolio";
import MermaidDiagram from "./MermaidDiagram";

type Props = {
  item: PortfolioItem;
  prev: PortfolioItem | null;
  next: PortfolioItem | null;
};

function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case "text":
      return (
        <p key={index} className="text-gray-700 leading-relaxed">
          {block.content}
        </p>
      );

    case "mermaid":
      return <MermaidDiagram key={index} content={block.content} />;

    case "table":
      return (
        <div key={index} className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-50">
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left font-semibold text-indigo-700 border-b border-indigo-100 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-2.5 text-gray-600 border-b border-gray-100 align-top"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "code":
      return (
        <div key={index} className="relative">
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-t-xl">
            <span className="text-xs text-gray-400 font-mono">{block.lang}</span>
          </div>
          <pre className="bg-gray-900 text-gray-100 font-mono text-xs leading-relaxed p-5 rounded-b-xl overflow-x-auto whitespace-pre">
            <code>{block.content}</code>
          </pre>
        </div>
      );

    case "list":
      return (
        <ul key={index} className="space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-indigo-400 mt-0.5 shrink-0">—</span>
              {item}
            </li>
          ))}
        </ul>
      );
  }
}

export default function PortfolioArticle({ item, prev, next }: Props) {
  return (
    <main className="min-h-screen pt-24 pb-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        {/* 뒤로가기 */}
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-10"
        >
          ← 기술 포트폴리오
        </Link>

        {/* 헤더 */}
        <div className="mb-10">
          <span className="text-6xl font-bold text-indigo-100 block mb-2 leading-none select-none">
            {item.num}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{item.title}</h1>
          <p className="text-gray-400 font-mono text-sm mb-5">{item.titleEn}</p>

          {/* 핵심 가치 박스 */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
            <p className="text-xs font-medium text-indigo-500 uppercase tracking-widest mb-3">
              핵심 가치
            </p>
            <ul className="space-y-2">
              {item.coreValues.map((v, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-indigo-800">
                  <span className="text-indigo-400 shrink-0 mt-0.5">•</span>
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 섹션 목록 */}
        <div className="space-y-12">
          {item.sections.map((section, si) => (
            <section key={si}>
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.blocks.map((block, bi) => renderBlock(block, bi))}
              </div>
            </section>
          ))}
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-gray-100">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-50 text-gray-500 text-sm rounded-full border border-gray-200"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 이전 / 다음 네비게이션 */}
        <nav className="flex justify-between items-center mt-10 pt-8 border-t border-gray-100 gap-4">
          {prev ? (
            <Link
              href={`/portfolio/${prev.slug}`}
              className="flex flex-col gap-1 group max-w-[45%]"
            >
              <span className="text-xs text-gray-400 group-hover:text-indigo-500 transition-colors">
                ← 이전
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors">
                {prev.num}. {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/portfolio/${next.slug}`}
              className="flex flex-col gap-1 group text-right max-w-[45%]"
            >
              <span className="text-xs text-gray-400 group-hover:text-indigo-500 transition-colors">
                다음 →
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors">
                {next.num}. {next.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </main>
  );
}
