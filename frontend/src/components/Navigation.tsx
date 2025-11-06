import { memo } from "react";

interface NavigationProps {
  readonly sections: readonly string[];
  readonly currentSection: number;
  readonly scrollProgress: {
    section: number;
    dotIndex: number; // -1 = none, 0-2 = which dot is active
  };
  readonly onNavigate: (sectionId: string) => void;
}

export const Navigation = memo(function Navigation({
  sections,
  currentSection,
  scrollProgress,
  onNavigate,
}: NavigationProps) {
  return (
    <nav className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
      <div className="bg-stone-900/90 backdrop-blur-lg rounded-2xl p-6 border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/20 nav-container">
        <div className="flex flex-col items-center space-y-0">
          {sections.map((section, index) => {
            const isSquareActive =
              currentSection === index && scrollProgress.dotIndex === -1;

            return (
              <div key={section} className="flex flex-col items-center">
                <button
                  onClick={() => onNavigate(section)}
                  className={`w-8 h-8 border-2 nav-button ${
                    isSquareActive
                      ? "bg-cyan-400 border-cyan-300 active"
                      : "bg-stone-700 border-stone-500 hover:bg-cyan-600 hover:border-cyan-500"
                  }`}
                  title={section.charAt(0).toUpperCase() + section.slice(1)}
                  aria-label={`Navigate to ${section}`}
                />

                {index < sections.length - 1 && (
                  <div className="flex flex-col items-center py-3 space-y-2">
                    {[0, 1, 2].map((dotIndex) => {
                      const isActiveDot =
                        scrollProgress.section === index &&
                        scrollProgress.dotIndex === dotIndex;

                      return (
                        <div
                          key={dotIndex}
                          className={`w-2 h-2 rounded-full nav-dot ${
                            isActiveDot ? "active" : ""
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
});
