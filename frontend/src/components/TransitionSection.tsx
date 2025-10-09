import { motion } from "framer-motion";

interface TransitionSectionProps {
  readonly id?: string;
  readonly height?: string;
}

export function TransitionSection({
  id,
  height = "100vh",
}: TransitionSectionProps) {
  return (
    <section
      id={id}
      className="transition-section relative"
      style={{ height, minHeight: height }}
    >
      {/* Invisible spacer for now - future animations can go here */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0">
        {/* Future: Blockchain connection animations, particles, glowing lines */}
        <motion.div
          className="w-1 h-full bg-gradient-to-b from-transparent via-cyber-400/20 to-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
        />
      </div>
    </section>
  );
}
