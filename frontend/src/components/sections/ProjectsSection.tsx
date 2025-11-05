import { motion } from "framer-motion";
import { PoneglyphOverlay } from "../PoneglyphOverlay";
import { PoneglyphSection } from "../PoneglyphSection";

const PONEGLYPH_QUOTE = "Monkey D. Luffy I'm going to be the Pirate King";

interface Project {
  title: string;
  description: string;
  tech: string[];
  status: "Completed" | "In Development" | "Planned";
  icon: string;
}

const projects: Project[] = [
  {
    title: "Poneglyph Portfolio",
    description:
      "Personal portfolio combining One Piece aesthetics with blockchain themes. Built with React, TypeScript, and Rust backend featuring infinite scroll and decryption animations.",
    tech: ["React", "TypeScript", "Rust", "Tailwind CSS", "Framer Motion"],
    status: "In Development",
    icon: "⚓",
  },
  {
    title: "Web3 Infrastructure Development",
    description:
      "Backend engineering for decentralized cloud computing platform. Confidential project work involving Rust and Java development for blockchain-integrated middleware.",
    tech: ["Rust", "Java", "Blockchain", "Web3", "Microservices"],
    status: "In Development",
    icon: "🦀",
  },
];

export function ProjectsSection() {
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-green-600 text-green-100";
      case "In Development":
        return "bg-yellow-600 text-yellow-100";
      case "Planned":
        return "bg-blue-600 text-blue-100";
    }
  };

  return (
    <PoneglyphSection id="projects">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <PoneglyphOverlay text={PONEGLYPH_QUOTE} columns={15} />
        <div className="poneglyph-block relative z-[1]">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-cyber-400 via-ocean-300 to-cyber-400 bg-clip-text text-transparent">
            Treasure Maps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project.title}
                className="bg-gradient-to-br from-stone-700 to-stone-800 p-6 rounded-lg hover:shadow-xl hover:shadow-cyber-400/20 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{project.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {project.title}
                    </h3>
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
                <p className="text-stone-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-ocean-600 text-ocean-100 rounded-md text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="px-8 py-3 bg-gradient-to-r from-cyber-600 to-cyber-500 rounded-lg font-semibold hover:from-cyber-500 hover:to-cyber-400 transition-all duration-300">
              More Projects Coming Soon
            </button>
          </div>
        </div>
      </motion.div>
    </PoneglyphSection>
  );
}
