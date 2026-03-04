import { notFound } from "next/navigation";
import { portfolioItems } from "@/data/portfolio";
import PortfolioArticle from "@/components/PortfolioArticle";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return portfolioItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = portfolioItems.find((i) => i.slug === slug);
  if (!item) return {};
  return {
    title: `${item.num}. ${item.title} — SEHUI JEONG`,
    description: item.summary,
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = portfolioItems.find((i) => i.slug === slug);
  if (!item) notFound();

  const idx = portfolioItems.indexOf(item);
  const prev = portfolioItems[idx - 1] ?? null;
  const next = portfolioItems[idx + 1] ?? null;

  return <PortfolioArticle item={item} prev={prev} next={next} />;
}
