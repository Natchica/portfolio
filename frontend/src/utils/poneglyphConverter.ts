/**
 * Maps characters to Poneglyph SVG symbol paths
 * Handles special character mappings (B/V, K/Q/C, S/Z/C, Y/LL)
 */

const CHAR_TO_SYMBOL: Record<string, string> = {
  // Single letters
  a: "/symbols/svg/letters/a.svg",
  d: "/symbols/svg/letters/d.svg",
  e: "/symbols/svg/letters/e.svg",
  f: "/symbols/svg/letters/f.svg",
  g: "/symbols/svg/letters/g.svg",
  i: "/symbols/svg/letters/i.svg",
  j: "/symbols/svg/letters/j.svg",
  l: "/symbols/svg/letters/l.svg",
  m: "/symbols/svg/letters/m.svg",
  n: "/symbols/svg/letters/n.svg",
  o: "/symbols/svg/letters/o.svg",
  p: "/symbols/svg/letters/p.svg",
  r: "/symbols/svg/letters/r.svg",
  t: "/symbols/svg/letters/t.svg",
  u: "/symbols/svg/letters/u.svg",
  x: "/symbols/svg/letters/x.svg",

  // Special mappings
  b: "/symbols/svg/letters/bv.svg",
  v: "/symbols/svg/letters/bv.svg",
  k: "/symbols/svg/letters/kqc.svg",
  q: "/symbols/svg/letters/kqc.svg",
  c: "/symbols/svg/letters/kqc.svg",
  s: "/symbols/svg/letters/szc.svg",
  z: "/symbols/svg/letters/szc.svg",
  y: "/symbols/svg/letters/yll.svg",

  // Numbers
  "0": "/symbols/svg/numbers/0.svg",
  "1": "/symbols/svg/numbers/1.svg",
  "2": "/symbols/svg/numbers/2.svg",
  "3": "/symbols/svg/numbers/3.svg",
  "4": "/symbols/svg/numbers/4.svg",
  "5": "/symbols/svg/numbers/5.svg",
  "6": "/symbols/svg/numbers/6.svg",
  "7": "/symbols/svg/numbers/7.svg",
  "8": "/symbols/svg/numbers/8.svg",
  "9": "/symbols/svg/numbers/9.svg",
};

/**
 * Converts a single character to its Poneglyph symbol path
 */
export function charToSymbol(char: string): string | null {
  const lowerChar = char.toLowerCase();
  return CHAR_TO_SYMBOL[lowerChar] || null;
}

/**
 * Converts text to an array of Poneglyph symbol paths
 * Handles spaces by returning null (which will be rendered as empty space)
 */
export function textToSymbols(text: string): (string | null)[] {
  return text.split("").map((char) => {
    if (char === " ") {
      return null; // Space
    }
    return charToSymbol(char);
  });
}

/**
 * Splits text into lines for grid arrangement
 * No word boundaries - just splits at the specified length
 */
export function splitTextIntoLines(
  text: string,
  symbolsPerLine: number
): string[] {
  const lines: string[] = [];

  for (let i = 0; i < text.length; i += symbolsPerLine) {
    lines.push(text.slice(i, i + symbolsPerLine));
  }

  return lines;
}

/**
 * Gets all available characters that can be converted to symbols
 */
export function getAvailableChars(): string[] {
  return Object.keys(CHAR_TO_SYMBOL);
}

/**
 * Generates random symbols to fill space
 */
export function generateRandomSymbols(count: number): string {
  const availableChars = getAvailableChars();
  let result = "";
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * availableChars.length);
    result += availableChars[randomIndex];
  }
  return result;
}

/**
 * Converts text to a grid of symbol paths
 * Returns a 2D array where each inner array represents a line
 * Ensures minimum rows to cover the block
 */
export function textToSymbolGrid(
  text: string,
  columns: number,
  minRows: number = 20
): (string | null)[][] {
  const lines = splitTextIntoLines(text, columns);

  // Calculate how many more lines we need
  const rowsNeeded = Math.max(minRows - lines.length, 0);

  // Generate random symbols to fill remaining space if needed
  if (rowsNeeded > 0) {
    // Add two spaces at the beginning for visual separation
    const randomText = "  " + generateRandomSymbols(rowsNeeded * columns);
    const randomLines = splitTextIntoLines(randomText, columns);
    lines.push(...randomLines);
  }

  return lines.map((line) => textToSymbols(line));
}

