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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-indigo-600 tracking-tight">SJ</span>
        <ul className="flex gap-6">
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
      </nav>
    </header>
  );
}
