import { useEffect, useState } from "react";
import "./App.css";
import { Navigation } from "./components/Navigation";
import { AboutSection } from "./components/sections/AboutSection";
import { ContactSection } from "./components/sections/ContactSection";
import { ExperienceSection } from "./components/sections/ExperienceSection";
import { ProjectsSection } from "./components/sections/ProjectsSection";
import { SkillsSection } from "./components/sections/SkillsSection";

function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const sections = [
    "about",
    "skills",
    "experience",
    "projects",
    "contact",
  ] as const;

  // Track which section is currently visible
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((id) => document.getElementById(id));
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setCurrentSection(i);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  // Navigation function
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="portfolio-container">
      {/* Navigation Menu */}
      <Navigation
        sections={sections}
        currentSection={currentSection}
        onNavigate={scrollToSection}
      />

      {/* Portfolio Sections */}
      <AboutSection onNavigate={scrollToSection} />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <ContactSection onNavigate={scrollToSection} />
    </div>
  );
}

export default App;
