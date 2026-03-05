import Link from "next/link";
import { PortfolioItem } from "@/data/portfolio";

type Props = {
  item: PortfolioItem;
};

export default function PortfolioCard({ item }: Props) {
  return (
    <Link href={`/portfolio/${item.slug}`} className="group block">
      <article className="h-full bg-white border border-gray-100 rounded-2xl p-8 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-4">
          <span className="text-5xl font-bold text-indigo-100 leading-none select-none">
            {item.num}
          </span>
          <span className="text-xs text-indigo-400 font-mono mt-1 shrink-0">
            {item.titleEn}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
          {item.title}
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-5">
          {item.summary}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md border border-gray-100"
            >
              #{tag}
            </span>
          ))}
        </div>
      </article>
    </Link>
  );
}
