import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { textToSymbolGrid } from "../utils/poneglyphConverter";

interface PoneglyphOverlayProps {
  readonly text: string;
  readonly columns?: number;
}

export const LINE_DELAY = 0.1;
export const LINE_DURATION = 0.2;

export function PoneglyphOverlay({
  text,
  columns = 15,
}: PoneglyphOverlayProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (globalThis.window === undefined) return 0;
    return globalThis.window.innerWidth;
  });

  // Listen for window resize events
  useEffect(() => {
    if (globalThis.window === undefined) return;

    const handleResize = () => {
      setWindowWidth(globalThis.window.innerWidth);
    };

    globalThis.window.addEventListener("resize", handleResize);
    return () => globalThis.window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate responsive columns based on viewport
  const responsiveColumns = useMemo(() => {
    if (globalThis.window === undefined || windowWidth === 0) return columns;
    if (windowWidth < 640) return 8; // mobile
    if (windowWidth < 1024) return 12; // tablet
    return columns; // desktop
  }, [columns, windowWidth]);

  // Remove spaces and repeat text to fill grid pattern
  const textWithoutSpaces = useMemo(() => {
    return text.replaceAll(/\s+/g, "");
  }, [text]);

  const repeatedText = useMemo(() => {
    // Handle empty or whitespace-only text
    if (textWithoutSpaces.length === 0) {
      return "";
    }
    const repeatCount = Math.ceil(
      (responsiveColumns * 15) / textWithoutSpaces.length
    );
    return new Array(repeatCount).fill(textWithoutSpaces).join("");
  }, [textWithoutSpaces, responsiveColumns]);

  // Convert text to symbol grid with minimum rows to ensure full coverage
  // Use generous row count to ensure complete block coverage
  const symbolGrid = useMemo(() => {
    const minRows = 50; // Generous minimum to ensure full block coverage
    return textToSymbolGrid(repeatedText, responsiveColumns, minRows);
  }, [repeatedText, responsiveColumns]);

  // Animation should start only when both hovered and clicked
  // Once started, it continues forever (never resets)
  const shouldDecrypt = hasStarted;

  const handleActivate = () => {
    // Only start if hovered (user must be hovering when clicking)
    if (isHovered && !hasStarted) {
      setHasStarted(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      // For keyboard, allow activation without hover requirement
      if (!hasStarted) {
        setHasStarted(true);
      }
    }
  };

  return (
    <button
      type="button"
      className="poneglyph-overlay"
      style={{
        border: "none",
        background: "none",
        padding: 0,
        margin: 0,
        cursor: "pointer",
        width: "100%",
        height: "100%",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      <div
        className="poneglyph-grid h-full w-full"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${responsiveColumns}, minmax(0, 1fr))`,
          gridAutoRows: "minmax(32px, 1fr)",
          gap: 0,
          padding: 0,
          height: "100%",
        }}
      >
        {symbolGrid.map((line, lineIndex) =>
          line.map((symbolPath, symbolIndex) => {
            return (
              <motion.div
                key={`${lineIndex}-${symbolIndex}`}
                className="poneglyph-symbol flex items-center justify-center relative"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "32px",
                  margin: 0,
                  padding: 0,
                  boxSizing: "border-box",
                }}
                initial={{ opacity: 1 }}
                animate={{
                  opacity: shouldDecrypt ? 0 : 1,
                }}
                transition={{
                  duration: LINE_DURATION,
                  delay: lineIndex * LINE_DELAY,
                  ease: "easeInOut",
                }}
              >
                {/* Background that matches overlay container - fades with symbol */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "#4a5568",
                    zIndex: -1,
                    margin: 0,
                    padding: 0,
                    borderRadius: 0,
                    boxSizing: "border-box",
                  }}
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: shouldDecrypt ? 0 : 1,
                  }}
                  transition={{
                    duration: LINE_DURATION,
                    delay: lineIndex * LINE_DELAY,
                    ease: "easeInOut",
                  }}
                />
                {symbolPath ? (
                  <img
                    src={symbolPath}
                    alt=""
                    className="w-full h-full object-contain max-w-[32px] max-h-[32px] relative z-10"
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </button>
  );
}
