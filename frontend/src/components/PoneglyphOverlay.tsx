import { useEffect, useMemo, useRef, useState } from "react";
import { textToCenteredSymbolGrid } from "../utils/poneglyphConverter";
import "./PoneglyphOverlay.css";

interface PoneglyphOverlayProps {
  readonly author: string;
  readonly quote: string;
  readonly columns?: number;
}

export function PoneglyphOverlay({
  author,
  quote,
  columns = 15,
}: PoneglyphOverlayProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const responsiveColumns = useMemo(() => {
    const columnWidth = 32;
    const calculatedColumns =
      containerWidth > 0
        ? Math.max(1, Math.floor(containerWidth / columnWidth))
        : columns;

    return calculatedColumns;
  }, [containerWidth, columns]);

  const symbolGrid = useMemo(() => {
    const rowHeight = 32;
    const calculatedRows =
      containerHeight > 0
        ? Math.max(1, Math.floor(containerHeight / rowHeight))
        : 50;

    return textToCenteredSymbolGrid(
      author,
      quote,
      responsiveColumns,
      calculatedRows
    );
  }, [author, quote, responsiveColumns, containerHeight]);

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
        ref={containerRef}
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
