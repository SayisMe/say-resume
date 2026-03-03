import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Contact />
      <footer className="py-8 text-center text-sm text-gray-400 bg-gray-50 border-t border-gray-100">
        © 2025 SEHUI JEONG. All rights reserved.
      </footer>
    </main>
  );
}
