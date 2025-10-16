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
