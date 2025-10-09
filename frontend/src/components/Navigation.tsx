import { motion } from "framer-motion";

interface NavigationProps {
  readonly sections: readonly string[];
  readonly currentSection: number;
  readonly scrollProgress: {
    section: number;
    dotIndex: number; // -1 = none, 0-2 = which dot is active
  };
  readonly onNavigate: (sectionId: string) => void;
}

export function Navigation({
  sections,
  currentSection,
  scrollProgress,
  onNavigate,
}: NavigationProps) {
  return (
    <nav className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
      <motion.div
        className="bg-stone-900/90 backdrop-blur-lg rounded-2xl p-6 border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/20"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center space-y-0">
          {sections.map((section, index) => {
            // Square is only active if we're in this section AND no dots are active
            const isSquareActive =
              currentSection === index && scrollProgress.dotIndex === -1;

            return (
              <div key={section} className="flex flex-col items-center">
                {/* SQUARE Navigation Button with smooth transitions */}
                <motion.button
                  onClick={() => onNavigate(section)}
                  className={`w-8 h-8 border-2 ${
                    isSquareActive
                      ? "bg-cyan-400 border-cyan-300"
                      : "bg-stone-700 border-stone-500 hover:bg-cyan-600 hover:border-cyan-500"
                  }`}
                  title={section.charAt(0).toUpperCase() + section.slice(1)}
                  aria-label={`Navigate to ${section}`}
                  animate={{
                    scale: isSquareActive ? 1.15 : 1,
                    boxShadow: isSquareActive
                      ? "0 0 25px rgba(0, 212, 255, 0.7)"
                      : "0 0 0px rgba(0, 212, 255, 0)",
                  }}
                  whileHover={{ scale: 1.1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                />

                {/* THREE CONNECTION DOTS showing scroll progress */}
                {index < sections.length - 1 && (
                  <div className="flex flex-col items-center py-3 space-y-2">
                    {[0, 1, 2].map((dotIndex) => {
                      // Dot is active if we're transitioning from current section
                      // and this specific dot matches the scroll progress
                      const isActiveDot =
                        scrollProgress.section === index &&
                        scrollProgress.dotIndex === dotIndex;

                      return (
                        <motion.div
                          key={dotIndex}
                          className="w-2 h-2 rounded-full"
                          animate={{
                            backgroundColor: isActiveDot
                              ? "#00d4ff"
                              : "#4a5568",
                            scale: isActiveDot ? 1.3 : 1,
                            opacity: isActiveDot ? 1 : 0.4,
                            boxShadow: isActiveDot
                              ? "0 0 15px rgba(0, 212, 255, 0.8)"
                              : "0 0 0px rgba(0, 212, 255, 0)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}
