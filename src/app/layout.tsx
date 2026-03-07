import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "정세희 — Front-End & React Native Developer",
  description:
    "React Native · Next.js · TypeScript 개발자 정세희의 포트폴리오. 기업용 메신저 앱, 오프라인 아키텍처, 실시간 채팅 등을 개발했습니다.",
  openGraph: {
    title: "정세희 — Front-End & React Native Developer",
    description:
      "React Native · Next.js · TypeScript 개발자 정세희의 포트폴리오.",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
