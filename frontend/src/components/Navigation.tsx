interface NavigationProps {
  readonly sections: readonly string[];
  readonly currentSection: number;
  readonly onNavigate: (sectionId: string) => void;
}

export function Navigation({
  sections,
  currentSection,
  onNavigate,
}: NavigationProps) {
  return (
    <nav className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
      <div className="bg-stone-900/90 backdrop-blur-lg rounded-2xl p-6 border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/20">
        <div className="flex flex-col items-center space-y-0">
          {sections.map((section, index) => (
            <div key={section} className="flex flex-col items-center">
              {/* SQUARE Navigation Button */}
              <button
                onClick={() => onNavigate(section)}
                className={`w-8 h-8 border-2 transition-all duration-300 ${
                  currentSection === index
                    ? "bg-cyan-400 border-cyan-300 shadow-xl shadow-cyan-400/70 scale-110"
                    : "bg-stone-700 border-stone-500 hover:bg-cyan-600 hover:border-cyan-500 hover:scale-105"
                }`}
                title={section.charAt(0).toUpperCase() + section.slice(1)}
                aria-label={`Navigate to ${section}`}
              />

              {/* THREE CONNECTION DOTS */}
              {index < sections.length - 1 && (
                <div className="flex flex-col items-center py-3 space-y-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
