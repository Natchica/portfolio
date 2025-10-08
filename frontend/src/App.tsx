import { useEffect, useRef, useState } from "react";
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
  const isScrollingRef = useRef(false);

  // Track which section is currently visible
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollPosition = window.scrollY + window.innerHeight / 2;

      // Check which section is visible
      const sectionElements = sections.map((id) => ({
        id,
        element: document.getElementById(id),
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { element } = sectionElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setCurrentSection(i);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  // Infinite down scroll
  useEffect(() => {
    const handleInfiniteScroll = () => {
      if (isScrollingRef.current) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const viewportMiddle = scrollTop + windowHeight / 2;

      const bottomClone = document.getElementById("about-clone-bottom");
      const realAbout = document.getElementById("about");

      if (!bottomClone || !realAbout) return;

      const bottomCloneTop = bottomClone.offsetTop;

      // When viewport middle crosses into the bottom clone, jump to real About
      if (viewportMiddle >= bottomCloneTop + 50) {
        isScrollingRef.current = true;

        const offsetInClone = viewportMiddle - bottomCloneTop;
        const newScrollTop =
          realAbout.offsetTop + offsetInClone - windowHeight / 2;

        window.scrollTo({
          top: newScrollTop,
          behavior: "instant" as ScrollBehavior,
        });

        setTimeout(() => {
          isScrollingRef.current = false;
          setCurrentSection(0);
        }, 100);
      }
    };

    const scrollInterval = setInterval(handleInfiniteScroll, 50);

    return () => clearInterval(scrollInterval);
  }, []);

  // Navigation function
  const scrollToSection = (sectionId: string) => {
    // Immediately update the navigation state
    const sectionIndex = sections.findIndex((s) => s === sectionId);
    if (sectionIndex !== -1) {
      setCurrentSection(sectionIndex);
    }

    isScrollingRef.current = true;
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
    });

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);
  };

  return (
    <div className="portfolio-container">
      {/* Navigation Menu */}
      <Navigation
        sections={sections}
        currentSection={currentSection}
        onNavigate={scrollToSection}
      />

      {/* Real Portfolio Sections */}
      <div id="about">
        <AboutSection onNavigate={scrollToSection} />
      </div>
      <div id="skills">
        <SkillsSection />
      </div>
      <div id="experience">
        <ExperienceSection />
      </div>
      <div id="projects">
        <ProjectsSection />
      </div>
      <div id="contact">
        <ContactSection onNavigate={scrollToSection} />
      </div>

      {/* Clone of About at the bottom for infinite scroll */}
      <div id="about-clone-bottom">
        <AboutSection onNavigate={scrollToSection} />
      </div>
    </div>
  );
}

export default App;
