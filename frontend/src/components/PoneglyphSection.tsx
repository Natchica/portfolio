import { useRef } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

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
  const isInView = useIntersectionObserver(ref, {
    once: false,
    rootMargin: "-50%",
  });

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
          <div
            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px bg-gradient-to-b from-cyber-400 to-transparent connection-line ${isInView ? "visible" : ""}`}
          />

          <div
            className={`absolute bottom-16 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyber-400 rounded-full connection-dot ${isInView ? "visible" : ""}`}
            style={{ boxShadow: "0 0 20px #00bfff" }}
          />
        </>
      )}
    </section>
  );
}
