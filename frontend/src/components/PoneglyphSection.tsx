import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface PoneglyphSectionProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly id: string;
  readonly showConnectionLine?: boolean;
}

export function PoneglyphSection({
  children,
  className = "",
  id,
  showConnectionLine = true,
}: PoneglyphSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50%" });

  return (
    <section id={id} ref={ref} className={`poneglyph-section ${className}`}>
      {/* Background blockchain pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-cyber-400/20 to-ocean-600/20"></div>
      </div>

      {children}

      {/* Blockchain Connection Line */}
      {showConnectionLine && (
        <>
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-cyber-400 to-transparent"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isInView ? 64 : 0,
              opacity: isInView ? 1 : 0,
            }}
            transition={{ delay: 0.5, duration: 1 }}
          />

          <motion.div
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyber-400 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: isInView ? 1 : 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            style={{ boxShadow: "0 0 20px #00bfff" }}
          />
        </>
      )}
    </section>
  );
}
