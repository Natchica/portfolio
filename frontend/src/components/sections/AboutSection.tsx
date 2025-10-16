import { motion } from "framer-motion";
import { PoneglyphSection } from "../PoneglyphSection";

const ancientScript =
  "⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡ ⬟⬢⬡⬟ ⬢⬡⬟⬢ ⬡⬟⬢⬡";

interface AboutSectionProps {
  readonly onNavigate: (section: string) => void;
}

export function AboutSection({ onNavigate }: AboutSectionProps) {
  return (
    <PoneglyphSection id="about">
      <motion.div
        className="poneglyph-block text-center"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Ancient Script Overlay */}
        <motion.div
          className="ancient-text mb-6"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 3, delay: 1 }}
        >
          {ancientScript}
        </motion.div>

        {/* Decrypted Content */}
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 2, delay: 0.5 }}
          className="decrypt-animation"
        >
          {/* Profile Image Placeholder */}
          {/* TODO: Add profile photo - Replace src with image path (e.g., /profile-photo.jpg in public folder)
              Current placeholder shows developer emoji. To add photo:
              1. Place image in /frontend/public/ folder
              2. Replace <span> below with <img src="/your-photo.jpg" alt="Nathan GAUD" className="w-full h-full object-cover rounded-full" />
          */}
          <motion.div
            className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 30px rgba(0, 191, 255, 0.5)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-4xl">👨‍💻</span>
          </motion.div>

          {/* Title with Blockchain Effect */}
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-ocean-300 bg-clip-text text-transparent"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Nathan GAUD
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-ocean-200 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            Backend Web3 Software Engineer
          </motion.p>

          <motion.p
            className="text-lg md:text-xl text-ocean-300 mb-6 italic"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            Genesis Block - The Origin Story
          </motion.p>

          {/* Description */}
          <motion.div
            className="text-lg text-stone-300 max-w-2xl mx-auto space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            <p>
              Welcome to my digital Poneglyph. As a Backend Web3 Software
              Engineer at iExec, I develop decentralized applications and
              blockchain infrastructure that power the future of distributed
              computing. My work focuses on building secure, scalable backend
              systems using Rust and Java.
            </p>
            <p>
              What drives me in Web3 is the immutability and transparency of
              blockchain technology - you can't lie with the blockchain. For me,
              Web3 represents freedom and the power to build systems where truth
              is verifiable and trust is built into the code itself.
            </p>
            <p className="text-cyber-400 font-semibold">
              🦀 Rust & Java Developer • 🔗 Blockchain Enthusiast • 🌊 Building
              the Decentralized Future
            </p>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            className="mt-8 space-x-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            <button
              onClick={() => onNavigate("skills")}
              className="px-8 py-3 bg-gradient-to-r from-ocean-600 to-ocean-500 rounded-lg font-semibold hover:from-ocean-500 hover:to-ocean-400 transition-all duration-300 shadow-lg hover:shadow-cyan-400/25"
            >
              Explore Poneglyphs
            </button>
            <button
              onClick={() => onNavigate("contact")}
              className="px-8 py-3 border-2 border-cyber-400 text-cyber-400 rounded-lg font-semibold hover:bg-cyber-400 hover:text-ocean-900 transition-all duration-300"
            >
              Connect Blocks
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </PoneglyphSection>
  );
}
