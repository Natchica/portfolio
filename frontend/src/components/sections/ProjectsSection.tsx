import { motion } from "framer-motion";
import { PoneglyphSection } from "../PoneglyphSection";

const ancientScript =
  "⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡";

interface Project {
  title: string;
  description: string;
  tech: string[];
  status: "Completed" | "In Development" | "Planned";
  icon: string;
}

const projects: Project[] = [
  {
    title: "Portfolio Website",
    description:
      "This very website! A One Piece-inspired portfolio with blockchain aesthetics, built with React and Rust.",
    tech: ["React", "TypeScript", "Rust", "Tailwind CSS", "Framer Motion"],
    status: "In Development",
    icon: "⚓",
  },
  {
    title: "TimeGuard App",
    description:
      "Personal time management application with clean UI and robust functionality for productivity tracking.",
    tech: ["React", "Node.js", "MongoDB", "Material-UI"],
    status: "Completed",
    icon: "⏰",
  },
  {
    title: "Blockchain Explorer",
    description:
      "Web3 application for exploring blockchain transactions with real-time data visualization.",
    tech: ["React", "Web3.js", "Chart.js", "Ethereum"],
    status: "Planned",
    icon: "🔍",
  },
  {
    title: "Rust API Server",
    description:
      "High-performance backend server built with Axum, showcasing modern Rust web development practices.",
    tech: ["Rust", "Axum", "PostgreSQL", "Docker"],
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
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-cyber-400 via-ocean-300 to-cyber-400 bg-clip-text text-transparent">
            Treasure Maps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                className="bg-gradient-to-br from-stone-700 to-stone-800 p-6 rounded-lg hover:shadow-xl hover:shadow-cyber-400/20 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
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
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <button className="px-8 py-3 bg-gradient-to-r from-cyber-600 to-cyber-500 rounded-lg font-semibold hover:from-cyber-500 hover:to-cyber-400 transition-all duration-300">
              View All on GitHub
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </PoneglyphSection>
  );
}
