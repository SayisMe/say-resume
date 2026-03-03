import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import EducationSection from "@/components/EducationSection";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <EducationSection />
      <Contact />
      <footer className="py-8 text-center text-sm text-gray-400 bg-gray-50 border-t border-gray-100">
        © 2025 JEONG SEHUI. All rights reserved.
      </footer>
    </main>
  );
}
