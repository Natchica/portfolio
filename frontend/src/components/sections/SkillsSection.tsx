import { motion } from "framer-motion";
import { PoneglyphOverlay } from "../PoneglyphOverlay";
import { PoneglyphSection } from "../PoneglyphSection";

const PONEGLYPH_QUOTE =
  "Michael Saylor Bitcoin is the apex property of the human race";

interface Skill {
  name: string;
  level: number;
  icon: string;
}

const skills: Skill[] = [
  { name: "Rust", level: 90, icon: "🦀" },
  { name: "Java", level: 90, icon: "☕" },
  { name: "TypeScript", level: 70, icon: "⚡" },
  { name: "Solidity", level: 65, icon: "📜" },
  { name: "Backend Development", level: 85, icon: "⚙️" },
  { name: "Web3/Blockchain", level: 75, icon: "🔗" },
  { name: "DevOps/CI-CD", level: 70, icon: "🔄" },
];

export function SkillsSection() {
  return (
    <PoneglyphSection id="skills">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <PoneglyphOverlay text={PONEGLYPH_QUOTE} columns={15} />
        <div className="poneglyph-block relative z-[1]">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-cyber-400 to-ocean-300 bg-clip-text text-transparent">
            Technical Glyphs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="bg-gradient-to-br from-stone-700 to-stone-800 p-4 rounded-lg hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{skill.icon}</span>
                  <h3 className="text-lg font-semibold text-white">
                    {skill.name}
                  </h3>
                </div>
                <div className="w-full bg-stone-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyber-400 to-ocean-400 h-2 rounded-full"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
                <p className="text-sm text-stone-300 mt-2">
                  {skill.level}% Proficiency
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </PoneglyphSection>
  );
}
