import { useEffect, useRef } from "react";

/**
 * Throttles scroll events using requestAnimationFrame for smooth 60fps updates
 * Uses passive event listeners for better performance
 */
export function useThrottledScroll(callback: () => void) {
  const rafIdRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleScroll = () => {
      // Cancel previous RAF if exists
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Schedule callback for next animation frame
      rafIdRef.current = requestAnimationFrame(() => {
        callbackRef.current();
        rafIdRef.current = null;
      });
    };

    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);
}
