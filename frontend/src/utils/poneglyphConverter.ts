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

  // Fallback mappings for missing letters
  h: "/symbols/svg/letters/g.svg", // h → g (visually similar)
  w: "/symbols/svg/letters/u.svg", // w → u (phonetically similar)

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
 * Converts text to a grid of symbol paths with author and quote integrated
 * Layout: random → blank → author → blank → random → blank → quote → blank → random
 * All three random suites have the same length, placed sequentially without centering
 * @param rows - Number of rows to generate based on container height
 */
export function textToCenteredSymbolGrid(
  author: string,
  quote: string,
  columns: number,
  rows: number
): (string | null)[][] {
  // Remove spaces from author and quote for symbol conversion
  const authorNoSpaces = author.replaceAll(/\s+/g, "");
  const quoteNoSpaces = quote.replaceAll(/\s+/g, "");

  // Convert to symbols
  const authorSymbols = textToSymbols(authorNoSpaces);
  const quoteSymbols = textToSymbols(quoteNoSpaces);

  // Calculate random suite length based on total available space in the grid
  // We want the three random suites to fill the remaining space after author, quote, and blanks
  // Total space = columns * rows (entire grid)
  // Fixed content = author + quote + 4 blanks
  // Available for random suites = total space - fixed content
  // Each random suite = available / 3 (all three suites are identical)
  const totalSpace = columns * rows;
  const fixedContentLength = authorSymbols.length + quoteSymbols.length + 4; // 4 blanks
  const availableForRandomSuites = Math.max(0, totalSpace - fixedContentLength);
  const randomSuiteLength = Math.max(
    0,
    Math.floor(availableForRandomSuites / 3)
  );

  // Generate ONE random suite and reuse it 3 times (all identical)
  const randomSuiteText = generateRandomSymbols(randomSuiteLength);
  const randomSuite = textToSymbols(randomSuiteText);

  // Build content array sequentially: random → blank → author → blank → random → blank → quote → blank → random
  // All three random suites have the same length
  const contentArray: (string | null)[] = [
    ...randomSuite, // First random suite (length: randomSuiteLength)
    null, // Blank 1
    ...authorSymbols, // Author
    null, // Blank 2
    ...randomSuite, // Second random suite (same length: randomSuiteLength)
    null, // Blank 3
    ...quoteSymbols, // Quote
    null, // Blank 4
    ...randomSuite, // Third random suite (same length: randomSuiteLength)
  ];

  // Wrap content across multiple lines
  const contentLines: (string | null)[][] = [];
  let currentLine: (string | null)[] = [];
  let contentIndex = 0;

  while (contentIndex < contentArray.length) {
    const remainingInLine = columns - currentLine.length;
    const remainingContent = contentArray.length - contentIndex;

    if (remainingInLine >= remainingContent) {
      // All remaining content fits on current line
      currentLine.push(...contentArray.slice(contentIndex));
      contentIndex = contentArray.length;
    } else {
      // Fill current line up to column limit
      const toAdd = contentArray.slice(
        contentIndex,
        contentIndex + remainingInLine
      );
      currentLine.push(...toAdd);
      contentIndex += remainingInLine;
    }

    // If line is full or we've processed all content, finalize the line
    if (currentLine.length >= columns || contentIndex >= contentArray.length) {
      // Ensure line is exactly columns wide
      if (currentLine.length < columns) {
        // Fill remaining space with random symbols
        const remaining = columns - currentLine.length;
        const extraRandom = textToSymbols(generateRandomSymbols(remaining));
        currentLine.push(...extraRandom);
      } else if (currentLine.length > columns) {
        // Trim excess (shouldn't happen, but handle it)
        currentLine = currentLine.slice(0, columns);
      }
      contentLines.push([...currentLine]);
      currentLine = [];
    }
  }

  // Position content lines vertically centered
  const contentStartRow = Math.max(
    0,
    Math.floor((rows - contentLines.length) / 2)
  );
  const grid: (string | null)[][] = [];

  for (let row = 0; row < rows; row++) {
    const contentLineIndex = row - contentStartRow;
    if (contentLineIndex >= 0 && contentLineIndex < contentLines.length) {
      // Use content line
      grid.push([...contentLines[contentLineIndex]]);
    } else {
      // Fill with random symbols
      const randomText = generateRandomSymbols(columns);
      grid.push(textToSymbols(randomText));
    }
  }

  return grid;
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
