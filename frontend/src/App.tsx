import { useEffect, useRef, useState, useCallback } from "react";
import { Navigation } from "./components/Navigation";
import { TransitionSection } from "./components/TransitionSection";
import { AboutSection } from "./components/sections/AboutSection";
import { ContactSection } from "./components/sections/ContactSection";
import { ExperienceSection } from "./components/sections/ExperienceSection";
import { PoneglyphAlphabetSection } from "./components/sections/PoneglyphAlphabetSection";
import { ProjectsSection } from "./components/sections/ProjectsSection";
import { SkillsSection } from "./components/sections/SkillsSection";
import { useThrottledScroll } from "./hooks/useThrottledScroll";

function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState<{
    section: number;
    dotIndex: number;
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
  const loopCountRef = useRef(0);

  useEffect(() => {
    loopCountRef.current = loopCount;
  }, [loopCount]);

  interface SectionPosition {
    top: number;
    bottom: number;
    height: number;
  }
  const sectionPositionsRef = useRef<SectionPosition[]>([]);
  const transitionPositionsRef = useRef<{
    top1: SectionPosition | null;
    top2: SectionPosition | null;
    bottom1: SectionPosition | null;
    bottom2: SectionPosition | null;
  }>({
    top1: null,
    top2: null,
    bottom1: null,
    bottom2: null,
  });

  const recalculatePositions = () => {
    sectionPositionsRef.current = sections.map((id) => {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        return {
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          height: rect.height,
        };
      }
      return { top: 0, bottom: 0, height: 0 };
    });

    const top1 = document.getElementById("transition-loop-top-1");
    const top2 = document.getElementById("transition-loop-top-2");
    const bottom1 = document.getElementById("transition-loop-bottom-1");
    const bottom2 = document.getElementById("transition-loop-bottom-2");

    const getPosition = (element: HTMLElement | null) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        height: rect.height,
      };
    };

    transitionPositionsRef.current = {
      top1: getPosition(top1),
      top2: getPosition(top2),
      bottom1: getPosition(bottom1),
      bottom2: getPosition(bottom2),
    };
  };

  useEffect(() => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      window.scrollTo({
        top: aboutSection.offsetTop,
        behavior: "instant" as ScrollBehavior,
      });
    }
    setTimeout(() => {
      recalculatePositions();
      if (
        !transitionPositionsRef.current.bottom2 ||
        !transitionPositionsRef.current.top1
      ) {
        setTimeout(() => {
          recalculatePositions();
        }, 200);
      }
    }, 200);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      recalculatePositions();
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleScroll = () => {
    if (isScrollingRef.current) return;

    const scrollPosition = window.scrollY;
    const viewportHeight = window.innerHeight;
    const viewportMiddle = scrollPosition + viewportHeight / 2;

    const currentScrollY = scrollPosition;
    const scrollDirection =
      currentScrollY > lastScrollY.current ? "down" : "up";
    lastScrollY.current = currentScrollY;

    const cachedPositions = sectionPositionsRef.current;
    let activeSectionIndex = 0;
    let activeDotIndex = -1;

    for (let i = cachedPositions.length - 1; i >= 0; i--) {
      if (cachedPositions[i].top <= viewportMiddle) {
        activeSectionIndex = i;
        break;
      }
    }

    if (activeSectionIndex < cachedPositions.length - 1) {
      const currentSectionBottom = cachedPositions[activeSectionIndex].bottom;
      const nextSectionTop = cachedPositions[activeSectionIndex + 1].top;

      if (
        viewportMiddle >= currentSectionBottom &&
        viewportMiddle <= nextSectionTop
      ) {
        const transitionZoneHeight = nextSectionTop - currentSectionBottom;
        const progressThroughTransition =
          (viewportMiddle - currentSectionBottom) / transitionZoneHeight;

        if (progressThroughTransition < 0.33) {
          activeDotIndex = 0;
        } else if (progressThroughTransition < 0.66) {
          activeDotIndex = 1;
        } else {
          activeDotIndex = 2;
        }
      }
    }

    setCurrentSection(activeSectionIndex);
    setScrollProgress({
      section: activeSectionIndex,
      dotIndex: activeDotIndex,
    });

    let transitions = transitionPositionsRef.current;
    if (!transitions.bottom2 || !transitions.top1) {
      recalculatePositions();
      transitions = transitionPositionsRef.current;
      if (!transitions.bottom2 || !transitions.top1) return;
    }

    if (scrollDirection === "down") {
      const bottomTransitionTop = transitions.bottom2.top;
      const bottomTransitionHeight = transitions.bottom2.height;
      const bottomTransitionBottom = transitions.bottom2.bottom;

      if (
        viewportMiddle >= bottomTransitionTop &&
        viewportMiddle <= bottomTransitionBottom
      ) {
        const transitionProgress =
          (viewportMiddle - bottomTransitionTop) / bottomTransitionHeight;

        if (transitionProgress >= 0.5 && transitionProgress <= 0.7) {
          isScrollingRef.current = true;
          setLoopCount((prev) => prev + 1);

          const offsetInTransition = viewportMiddle - bottomTransitionTop;
          const topTransitionTop = transitions.top1.top;
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

    if (scrollDirection === "up" && loopCountRef.current > 0) {
      const topTransitionTop = transitions.top1.top;
      const topTransitionHeight = transitions.top1.height;
      const topTransitionBottom = transitions.top1.bottom;

      if (
        viewportMiddle >= topTransitionTop &&
        viewportMiddle <= topTransitionBottom
      ) {
        const transitionProgress =
          (viewportMiddle - topTransitionTop) / topTransitionHeight;

        if (transitionProgress >= 0.3 && transitionProgress <= 0.5) {
          isScrollingRef.current = true;
          setLoopCount((prev) => Math.max(0, prev - 1));

          const offsetInTransition = viewportMiddle - topTransitionTop;
          const bottomTransitionTop = transitions.bottom2.top;
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

    if (loopCountRef.current === 0 && scrollDirection === "up") {
      const topTransitionTop = transitions.top1.top;

      if (scrollPosition < topTransitionTop) {
        window.scrollTo({
          top: topTransitionTop,
          behavior: "instant" as ScrollBehavior,
        });
      }
    }
  };

  useThrottledScroll(handleScroll);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 150);
    return () => clearTimeout(timeoutId);
  }, []);

  const scrollToSection = useCallback(
    (sectionId: string) => {
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
    },
    [sections]
  );

  const scrollToTop = () => {
    isScrollingRef.current = true;
    setLoopCount(0);

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
      <Navigation
        sections={sections}
        currentSection={currentSection}
        scrollProgress={scrollProgress}
        onNavigate={scrollToSection}
      />

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

      <TransitionSection id="transition-loop-top-1" />
      <TransitionSection id="transition-loop-top-2" />

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

      <TransitionSection id="transition-loop-bottom-1" />
      <TransitionSection id="transition-loop-bottom-2" />
    </div>
  );
}

export default App;
