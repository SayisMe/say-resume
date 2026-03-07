"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || open ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-indigo-600 tracking-tight">SJ</span>

        {/* 데스크탑 메뉴 */}
        <ul className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <li key={item.href}>
              {item.href.startsWith("/") ? (
                <Link
                  href={item.href}
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* 모바일 햄버거 버튼 */}
        <button
          className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8"
          onClick={() => setOpen((v) => !v)}
          aria-label="메뉴 열기/닫기"
        >
          <span
            className={`block h-0.5 bg-gray-700 transition-all duration-300 ${
              open ? "w-5 rotate-45 translate-y-2" : "w-5"
            }`}
          />
          <span
            className={`block h-0.5 bg-gray-700 transition-all duration-300 ${
              open ? "opacity-0 w-5" : "w-5"
            }`}
          />
          <span
            className={`block h-0.5 bg-gray-700 transition-all duration-300 ${
              open ? "w-5 -rotate-45 -translate-y-2" : "w-5"
            }`}
          />
        </button>
      </nav>

      {/* 모바일 메뉴 */}
      {open && (
        <div className="md:hidden border-t border-gray-100 px-6 py-5">
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.href}>
                {item.href.startsWith("/") ? (
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
