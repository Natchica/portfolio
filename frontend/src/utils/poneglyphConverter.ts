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
      return null;
    }
    return charToSymbol(char);
  });
}

function getAvailableChars(): string[] {
  return Object.keys(CHAR_TO_SYMBOL);
}

function generateRandomSymbols(count: number): string {
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
 */
export function textToCenteredSymbolGrid(
  author: string,
  quote: string,
  columns: number,
  rows: number
): (string | null)[][] {
  const authorNoSpaces = author.replaceAll(/\s+/g, "");
  const quoteNoSpaces = quote.replaceAll(/\s+/g, "");
  const authorSymbols = textToSymbols(authorNoSpaces);
  const quoteSymbols = textToSymbols(quoteNoSpaces);

  const totalSpace = columns * rows;
  const fixedContentLength = authorSymbols.length + quoteSymbols.length + 4;
  const availableForRandomSuites = Math.max(0, totalSpace - fixedContentLength);
  const randomSuiteLength = Math.max(
    0,
    Math.floor(availableForRandomSuites / 3)
  );

  const randomSuiteText = generateRandomSymbols(randomSuiteLength);
  const randomSuite = textToSymbols(randomSuiteText);

  const contentArray: (string | null)[] = [
    ...randomSuite,
    null,
    ...authorSymbols,
    null,
    ...randomSuite,
    null,
    ...quoteSymbols,
    null,
    ...randomSuite,
  ];

  const contentLines: (string | null)[][] = [];
  let currentLine: (string | null)[] = [];
  let contentIndex = 0;

  while (contentIndex < contentArray.length) {
    const remainingInLine = columns - currentLine.length;
    const remainingContent = contentArray.length - contentIndex;

    if (remainingInLine >= remainingContent) {
      currentLine.push(...contentArray.slice(contentIndex));
      contentIndex = contentArray.length;
    } else {
      const toAdd = contentArray.slice(
        contentIndex,
        contentIndex + remainingInLine
      );
      currentLine.push(...toAdd);
      contentIndex += remainingInLine;
    }

    if (currentLine.length >= columns || contentIndex >= contentArray.length) {
      if (currentLine.length < columns) {
        const remaining = columns - currentLine.length;
        const extraRandom = textToSymbols(generateRandomSymbols(remaining));
        currentLine.push(...extraRandom);
      } else if (currentLine.length > columns) {
        currentLine = currentLine.slice(0, columns);
      }
      contentLines.push([...currentLine]);
      currentLine = [];
    }
  }

  const actualRows = Math.max(rows, contentLines.length);
  const contentStartRow = Math.max(
    0,
    Math.floor((actualRows - contentLines.length) / 2)
  );
  const grid: (string | null)[][] = [];

  for (let row = 0; row < actualRows; row++) {
    const contentLineIndex = row - contentStartRow;
    if (contentLineIndex >= 0 && contentLineIndex < contentLines.length) {
      grid.push([...contentLines[contentLineIndex]]);
    } else {
      const randomText = generateRandomSymbols(columns);
      grid.push(textToSymbols(randomText));
    }
  }

  return grid;
}
