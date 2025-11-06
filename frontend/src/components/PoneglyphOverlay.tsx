import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { textToSymbolGrid } from "../utils/poneglyphConverter";
import "./PoneglyphOverlay.css";

interface PoneglyphOverlayProps {
  readonly text: string;
  readonly columns?: number;
}

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

  const debouncedWindowWidth = useDebounce(windowWidth, 150);

  useEffect(() => {
    if (globalThis.window === undefined) return;

    const handleResize = () => {
      setWindowWidth(globalThis.window.innerWidth);
    };

    globalThis.window.addEventListener("resize", handleResize, {
      passive: true,
    });
    return () => globalThis.window.removeEventListener("resize", handleResize);
  }, []);

  const responsiveColumns = useMemo(() => {
    if (globalThis.window === undefined || debouncedWindowWidth === 0)
      return columns;
    if (debouncedWindowWidth < 640) return 8;
    if (debouncedWindowWidth < 1024) return 12;
    return columns;
  }, [columns, debouncedWindowWidth]);

  const textWithoutSpaces = useMemo(() => {
    return text.replaceAll(/\s+/g, "");
  }, [text]);

  const repeatedText = useMemo(() => {
    if (textWithoutSpaces.length === 0) {
      return "";
    }
    const repeatCount = Math.ceil(
      (responsiveColumns * 15) / textWithoutSpaces.length
    );
    return new Array(repeatCount).fill(textWithoutSpaces).join("");
  }, [textWithoutSpaces, responsiveColumns]);

  const symbolGrid = useMemo(() => {
    const minRows = 50;
    return textToSymbolGrid(repeatedText, responsiveColumns, minRows);
  }, [repeatedText, responsiveColumns]);

  const handleActivate = () => {
    if (isHovered && !hasStarted) {
      setHasStarted(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
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
              <div
                key={`${lineIndex}-${symbolIndex}`}
                className={`poneglyph-symbol-cell ${
                  hasStarted ? "animating" : ""
                }`}
                style={
                  {
                    "--line-index": lineIndex,
                  } as React.CSSProperties
                }
              >
                {symbolPath ? (
                  <img
                    src={symbolPath}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width="32"
                    height="32"
                    className="w-full h-full object-contain max-w-[32px] max-h-[32px] relative z-10"
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            );
          })
        )}
      </div>
    </button>
  );
}
