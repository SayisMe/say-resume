import Link from "next/link";
import { portfolioItems } from "@/data/portfolio";
import PortfolioCard from "@/components/PortfolioCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "기술 포트폴리오 — SEHUI JEONG",
  description: "BizbeeeTalk 앱 개발에서 풀어낸 7가지 기술 문제",
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen pt-24 pb-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-10"
        >
          ← 프로젝트로
        </Link>

        <div className="mb-12">
          <p className="text-sm font-medium tracking-widest uppercase text-indigo-500 mb-2">
            Technical Portfolio
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">기술 포트폴리오</h1>
          <p className="text-gray-500 max-w-xl">
            BizbeeeTalk 기업용 메신저 앱 개발 과정에서 직면한 기술적 문제와 해결 방법을 정리했습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {portfolioItems.map((item) => (
            <PortfolioCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </main>
  );
}
