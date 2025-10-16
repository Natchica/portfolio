import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Navigation } from "./components/Navigation";
import { TransitionSection } from "./components/TransitionSection";
import { AboutSection } from "./components/sections/AboutSection";
import { ContactSection } from "./components/sections/ContactSection";
import { ExperienceSection } from "./components/sections/ExperienceSection";
import { PoneglyphAlphabetSection } from "./components/sections/PoneglyphAlphabetSection";
import { ProjectsSection } from "./components/sections/ProjectsSection";
import { SkillsSection } from "./components/sections/SkillsSection";

function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const [loopCount, setLoopCount] = useState(0); // Track how many loops from origin
  const [scrollProgress, setScrollProgress] = useState<{
    section: number;
    dotIndex: number; // -1 = none, 0-2 = which dot is active
  }>({ section: 0, dotIndex: -1 });

  const sections = [
    "about",
    "skills",
    "experience",
    "projects",
    "alphabet",
    "contact",
  ] as const;
  const isScrollingRef = useRef(false);
  const lastScrollY = useRef(0);

  // Initial scroll to About section on mount
  useEffect(() => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      window.scrollTo({
        top: aboutSection.offsetTop,
        behavior: "instant" as ScrollBehavior,
      });
    }
  }, []);

  // Track which section is currently visible and calculate scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      const viewportMiddle = scrollPosition + viewportHeight / 2;

      // Check which section is visible
      const sectionElements = sections.map((id) => ({
        id,
        element: document.getElementById(id),
      }));

      let activeSectionIndex = 0;
      let activeDotIndex = -1;

      // Find which section we're currently in
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { element } = sectionElements[i];
        if (element && element.offsetTop <= viewportMiddle) {
          activeSectionIndex = i;
          break;
        }
      }

      // Calculate dot progress if we're transitioning between sections
      if (activeSectionIndex < sections.length - 1) {
        const currentSection = sectionElements[activeSectionIndex].element;
        const nextSection = sectionElements[activeSectionIndex + 1].element;

        if (currentSection && nextSection) {
          const currentSectionBottom =
            currentSection.offsetTop + currentSection.offsetHeight;
          const nextSectionTop = nextSection.offsetTop;

          // Check if we're in the transition zone (between sections)
          if (
            viewportMiddle >= currentSectionBottom &&
            viewportMiddle <= nextSectionTop
          ) {
            // Calculate progress through the transition zone (0 to 1)
            const transitionZoneHeight = nextSectionTop - currentSectionBottom;
            const progressThroughTransition =
              (viewportMiddle - currentSectionBottom) / transitionZoneHeight;

            // Map progress to dot indices (0, 1, 2)
            if (progressThroughTransition < 0.33) {
              activeDotIndex = 0; // First third = first dot
            } else if (progressThroughTransition < 0.66) {
              activeDotIndex = 1; // Second third = second dot
            } else {
              activeDotIndex = 2; // Final third = third dot
            }
          }
        }
      }

      setCurrentSection(activeSectionIndex);
      setScrollProgress({
        section: activeSectionIndex,
        dotIndex: activeDotIndex,
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  // Bidirectional infinite scroll with memory
  useEffect(() => {
    const handleInfiniteScroll = () => {
      if (isScrollingRef.current) return;

      const currentScrollY = window.scrollY;
      const scrollDirection =
        currentScrollY > lastScrollY.current ? "down" : "up";
      lastScrollY.current = currentScrollY;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const viewportMiddle = scrollTop + windowHeight / 2;

      // Get key elements for loop transitions
      // When scrolling DOWN: trigger on bottom-2, jump to top-1
      // When scrolling UP: trigger on top-1, jump to bottom-2
      const bottomTransitionTrigger = document.getElementById(
        "transition-loop-bottom-2"
      );
      const topTransitionTrigger = document.getElementById(
        "transition-loop-top-1"
      );

      if (!bottomTransitionTrigger || !topTransitionTrigger) return;

      // Scrolling DOWN: Check if we've reached the bottom-2 transition
      if (scrollDirection === "down") {
        const bottomTransitionTop = bottomTransitionTrigger.offsetTop;
        const bottomTransitionHeight = bottomTransitionTrigger.offsetHeight;
        const bottomTransitionBottom =
          bottomTransitionTop + bottomTransitionHeight;

        // Check if viewport middle is inside bottom-2 transition
        if (
          viewportMiddle >= bottomTransitionTop &&
          viewportMiddle <= bottomTransitionBottom
        ) {
          // Jump at 50% through bottom-2 to the same relative position in top-1
          const transitionProgress =
            (viewportMiddle - bottomTransitionTop) / bottomTransitionHeight;

          if (transitionProgress >= 0.5 && transitionProgress <= 0.7) {
            isScrollingRef.current = true;

            // Increment loop count
            setLoopCount((prev) => prev + 1);

            // Calculate offset within the transition (relative to transition start)
            const offsetInTransition = viewportMiddle - bottomTransitionTop;

            // Jump to the same relative position in top-1
            const topTransitionTop = topTransitionTrigger.offsetTop;
            const newScrollTop = topTransitionTop + offsetInTransition;

            window.scrollTo({
              top: newScrollTop,
              behavior: "instant" as ScrollBehavior,
            });

            setTimeout(() => {
              isScrollingRef.current = false;
            }, 50);
          }
        }
      }

      // Scrolling UP: Check if we've reached the top-1 transition (and we're not at origin)
      if (scrollDirection === "up" && loopCount > 0) {
        const topTransitionTop = topTransitionTrigger.offsetTop;
        const topTransitionHeight = topTransitionTrigger.offsetHeight;
        const topTransitionBottom = topTransitionTop + topTransitionHeight;

        // Check if viewport middle is inside top-1 transition
        if (
          viewportMiddle >= topTransitionTop &&
          viewportMiddle <= topTransitionBottom
        ) {
          // Jump at 50% through top-1 to the same relative position in bottom-2
          const transitionProgress =
            (viewportMiddle - topTransitionTop) / topTransitionHeight;

          if (transitionProgress >= 0.3 && transitionProgress <= 0.5) {
            isScrollingRef.current = true;

            // Decrement loop count
            setLoopCount((prev) => Math.max(0, prev - 1));

            // Calculate offset within the transition
            const offsetInTransition = viewportMiddle - topTransitionTop;

            // Jump to the same relative position in bottom-2
            const bottomTransitionTop = bottomTransitionTrigger.offsetTop;
            const newScrollTop = bottomTransitionTop + offsetInTransition;

            window.scrollTo({
              top: newScrollTop,
              behavior: "instant" as ScrollBehavior,
            });

            setTimeout(() => {
              isScrollingRef.current = false;
            }, 50);
          }
        }
      }

      // Block scrolling above origin when loopCount is 0 (only upward!)
      if (loopCount === 0 && scrollDirection === "up") {
        const topTransitionTop = topTransitionTrigger.offsetTop;

        // Prevent scrolling above the top-1 transition when at origin
        if (scrollTop < topTransitionTop) {
          window.scrollTo({
            top: topTransitionTop,
            behavior: "instant" as ScrollBehavior,
          });
        }
      }
    };

    const scrollInterval = setInterval(handleInfiniteScroll, 50);

    return () => clearInterval(scrollInterval);
  }, [loopCount]);

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

  // Back to top function - resets to origin
  const scrollToTop = () => {
    isScrollingRef.current = true;
    setLoopCount(0); // Reset loop count to origin

    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      window.scrollTo({
        top: aboutSection.offsetTop,
        behavior: "smooth",
      });
    }

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
        scrollProgress={scrollProgress}
        onNavigate={scrollToSection}
      />

      {/* Loop Counter and Back to Top Button */}
      {loopCount > 0 && (
        <div className="fixed top-4 left-4 z-50 flex flex-col gap-3">
          <div className="bg-stone-900/80 backdrop-blur-lg px-4 py-2 rounded-lg border border-cyan-400/30 text-cyan-400 text-sm">
            🏴‍☠️ Loops sailed: {loopCount}
          </div>
          <button
            onClick={scrollToTop}
            className="bg-stone-900/80 backdrop-blur-lg px-4 py-2 rounded-lg border border-cyan-400/30 text-cyan-400 text-sm hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300 flex items-center justify-center gap-2"
            aria-label="Back to top"
          >
            ⚓ Return to origin
          </button>
        </div>
      )}

      {/* Top loop transitions - buffer for seamless jumps */}
      <TransitionSection id="transition-loop-top-1" />
      <TransitionSection id="transition-loop-top-2" />

      {/* Real Portfolio Sections with 3 TransitionSections between each */}
      <div id="about">
        <AboutSection onNavigate={scrollToSection} />
      </div>
      <TransitionSection />
      <TransitionSection />
      <TransitionSection />

      <div id="skills">
        <SkillsSection />
      </div>
      <TransitionSection />
      <TransitionSection />
      <TransitionSection />

      <div id="experience">
        <ExperienceSection />
      </div>
      <TransitionSection />
      <TransitionSection />
      <TransitionSection />

      <div id="projects">
        <ProjectsSection />
      </div>
      <TransitionSection />
      <TransitionSection />
      <TransitionSection />

      <div id="alphabet">
        <PoneglyphAlphabetSection />
      </div>
      <TransitionSection />
      <TransitionSection />
      <TransitionSection />

      <div id="contact">
        <ContactSection onNavigate={scrollToSection} />
      </div>

      {/* Bottom loop transitions - buffer for seamless jumps */}
      <TransitionSection id="transition-loop-bottom-1" />
      <TransitionSection id="transition-loop-bottom-2" />
    </div>
  );
}

export default App;
