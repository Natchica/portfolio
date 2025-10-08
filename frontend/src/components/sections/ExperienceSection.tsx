import { motion } from "framer-motion";
import { PoneglyphSection } from "../PoneglyphSection";

const ancientScript =
  "⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡";

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
    title: "ENSEEIHT - Computer Science Engineering",
    period: "2019-2024",
    description:
      "Advanced studies in computer science and engineering with focus on software development and systems architecture.",
    icon: "🎓",
  },
  {
    type: "Experience",
    title: "Full-Stack Developer",
    period: "2023-Present",
    description:
      "Building innovative web applications with modern technologies, specializing in React and backend development.",
    icon: "💼",
  },
  {
    type: "Project",
    title: "TimeGuard Application",
    period: "2023",
    description:
      "Personal project showcasing time management solutions with clean UI/UX design and robust functionality.",
    icon: "⏰",
  },
  {
    type: "Skills",
    title: "Web3 & Blockchain Exploration",
    period: "2024-Present",
    description:
      "Diving deep into decentralized technologies, smart contracts, and the future of web development.",
    icon: "🔗",
  },
];

export function ExperienceSection() {
  return (
    <PoneglyphSection id="experience">
      <motion.div
        className="poneglyph-block"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="ancient-text mb-6">{ancientScript}</div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-ocean-300 to-cyber-400 bg-clip-text text-transparent">
            Historical Records
          </h2>

          <div className="space-y-8">
            {experiences.map((item, index) => (
              <motion.div
                key={`${item.type}-${index}`}
                className="flex items-start space-x-4 bg-gradient-to-r from-stone-700/50 to-stone-800/50 p-6 rounded-lg backdrop-blur-sm"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
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
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </PoneglyphSection>
  );
}
