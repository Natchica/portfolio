import { useRef, memo } from "react";
import { PoneglyphOverlay } from "../PoneglyphOverlay";
import { PoneglyphSection } from "../PoneglyphSection";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

const PONEGLYPH_QUOTE = "Gol D. Roger I left everything I own in that place";

interface ExperienceItem {
  type: string;
  title: string;
  period: string;
  description: string;
  icon: string;
}

const experiences: ExperienceItem[] = [
  {
    type: "Education",
    title: "Diplôme d'Ingénieur - Software Engineering",
    period: "2021-2024",
    description:
      "Engineering degree in Computer Science from INP-ENSEEIHT, specializing in Systems and Software Engineering. Included Erasmus semester in Madrid focusing on Data Sciences and Intelligent Systems.",
    icon: "🎓",
  },
  {
    type: "Certification",
    title: "Blockchain Principles & Digital Currencies",
    period: "2023",
    description:
      "MOOC certification from University of Nicosia covering blockchain fundamentals, cryptocurrency principles, and decentralized applications.",
    icon: "🔗",
  },
  {
    type: "Experience",
    title: "Backend Web3 Software Engineer - iExec",
    period: "Feb 2024-Present",
    description:
      "Developing backend services for decentralized computing platform. Working with Rust and Java to build scalable Web3 infrastructure. Managing middleware roadmap, implementing automated testing, and mentoring junior developers.",
    icon: "💼",
  },
  {
    type: "Internship",
    title: "Software Quality Engineer - EES Clemessy",
    period: "Jun-Aug 2023",
    description:
      "Conducted comprehensive software testing, benchmarked automated testing tools, and implemented POC for functional test automation.",
    icon: "⚙️",
  },
];

export const ExperienceSection = memo(function ExperienceSection() {
  const ref = useRef(null);
  const isVisible = useIntersectionObserver(ref, {
    once: true,
    rootMargin: "-10%",
  });

  return (
    <PoneglyphSection id="experience">
      <div
        ref={ref}
        className={`relative section-entrance ${isVisible ? "visible" : ""}`}
      >
        <PoneglyphOverlay text={PONEGLYPH_QUOTE} columns={15} />
        <div className="poneglyph-block relative z-[1]">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-ocean-300 to-cyber-400 bg-clip-text text-transparent">
            Historical Records
          </h2>

          <div className="space-y-8">
            {experiences.map((item) => (
              <div
                key={`${item.type}-${item.title}`}
                className="flex items-start space-x-4 bg-gradient-to-r from-stone-700/50 to-stone-800/50 p-6 rounded-lg backdrop-blur-sm"
              >
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {item.title}
                    </h3>
                    <span className="text-cyber-400 font-semibold">
                      {item.period}
                    </span>
                  </div>
                  <p className="text-sm text-ocean-300 mb-2">{item.type}</p>
                  <p className="text-stone-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PoneglyphSection>
  );
});
