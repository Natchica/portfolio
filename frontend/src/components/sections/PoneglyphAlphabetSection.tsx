import React, { memo } from "react";

interface SymbolData {
  path: string;
  label: string;
  category: "letter" | "number";
}

const SYMBOLS: SymbolData[] = [
  // Letters
  { path: "/symbols/svg/letters/a.svg", label: "A", category: "letter" },
  {
    path: "/symbols/svg/letters/bv.svg",
    label: "B/V",
    category: "letter",
  },
  {
    path: "/symbols/svg/letters/kqc.svg",
    label: "K/Q/C",
    category: "letter",
  },
  { path: "/symbols/svg/letters/d.svg", label: "D", category: "letter" },
  { path: "/symbols/svg/letters/e.svg", label: "E", category: "letter" },
  { path: "/symbols/svg/letters/f.svg", label: "F", category: "letter" },
  { path: "/symbols/svg/letters/g.svg", label: "G", category: "letter" },
  { path: "/symbols/svg/letters/i.svg", label: "I", category: "letter" },
  { path: "/symbols/svg/letters/j.svg", label: "J", category: "letter" },
  { path: "/symbols/svg/letters/l.svg", label: "L", category: "letter" },
  { path: "/symbols/svg/letters/m.svg", label: "M", category: "letter" },
  { path: "/symbols/svg/letters/n.svg", label: "N", category: "letter" },
  { path: "/symbols/svg/letters/o.svg", label: "O", category: "letter" },
  { path: "/symbols/svg/letters/p.svg", label: "P", category: "letter" },
  { path: "/symbols/svg/letters/r.svg", label: "R", category: "letter" },
  {
    path: "/symbols/svg/letters/szc.svg",
    label: "S/Z/C",
    category: "letter",
  },
  { path: "/symbols/svg/letters/t.svg", label: "T", category: "letter" },
  { path: "/symbols/svg/letters/u.svg", label: "U", category: "letter" },
  { path: "/symbols/svg/letters/x.svg", label: "X", category: "letter" },
  {
    path: "/symbols/svg/letters/yll.svg",
    label: "Y/LL",
    category: "letter",
  },
  // Numbers
  { path: "/symbols/svg/numbers/0.svg", label: "0", category: "number" },
  { path: "/symbols/svg/numbers/1.svg", label: "1", category: "number" },
  { path: "/symbols/svg/numbers/2.svg", label: "2", category: "number" },
  { path: "/symbols/svg/numbers/3.svg", label: "3", category: "number" },
  { path: "/symbols/svg/numbers/4.svg", label: "4", category: "number" },
  { path: "/symbols/svg/numbers/5.svg", label: "5", category: "number" },
  { path: "/symbols/svg/numbers/6.svg", label: "6", category: "number" },
  { path: "/symbols/svg/numbers/7.svg", label: "7", category: "number" },
  { path: "/symbols/svg/numbers/8.svg", label: "8", category: "number" },
  { path: "/symbols/svg/numbers/9.svg", label: "9", category: "number" },
];

export const PoneglyphAlphabetSection: React.FC = memo(
  function PoneglyphAlphabetSection() {
    const letters = SYMBOLS.filter((s) => s.category === "letter");
    const numbers = SYMBOLS.filter((s) => s.category === "number");

    return (
      <section className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 text-stone-100 flex items-center justify-center py-20 px-4">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 text-transparent bg-clip-text">
              Poneglyph Alphabet
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 text-stone-300">
              <p className="text-lg leading-relaxed">
                In One Piece, Poneglyphs are indestructible stone tablets that
                contain the true history of the world, written in an ancient
                script that only a few can decipher. They represent immutable,
                tamper-proof records of truth.
              </p>
              <p className="text-lg leading-relaxed">
                Much like blockchain technology, Poneglyphs are{" "}
                <span className="text-cyan-400 font-semibold">
                  permanent, distributed, and verifiable
                </span>{" "}
                — a fitting metaphor for decentralized systems where data
                integrity and transparency are paramount.
              </p>
              <p className="text-base text-stone-400 italic mt-6">
                Below is the complete Poneglyph writing system that inspired the
                visual identity of this portfolio.
              </p>
            </div>
          </div>

          {/* Alphabet Section */}
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-center mb-8 text-cyan-400">
              Letters
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-4 md:gap-6">
              {letters.map((symbol) => (
                <div
                  key={symbol.path}
                  className="group flex flex-col items-center gap-3 p-4 rounded-lg bg-stone-800/50 border border-stone-700/50 hover:border-cyan-400/50 hover:bg-stone-800/80 transition-all duration-300"
                >
                  <div className="w-16 h-16 flex items-center justify-center">
                    <img
                      src={symbol.path}
                      alt={`Poneglyph symbol for ${symbol.label}`}
                      loading="lazy"
                      decoding="async"
                      width="64"
                      height="64"
                      className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all duration-300"
                    />
                  </div>
                  <span className="text-sm font-mono text-stone-300 group-hover:text-cyan-400 transition-colors duration-300">
                    {symbol.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Numbers Section */}
          <div>
            <h3 className="text-3xl font-bold text-center mb-8 text-cyan-400">
              Numbers
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-4 md:gap-6 max-w-4xl mx-auto">
              {numbers.map((symbol) => (
                <div
                  key={symbol.path}
                  className="group flex flex-col items-center gap-3 p-4 rounded-lg bg-stone-800/50 border border-stone-700/50 hover:border-cyan-400/50 hover:bg-stone-800/80 transition-all duration-300"
                >
                  <div className="w-16 h-16 flex items-center justify-center">
                    <img
                      src={symbol.path}
                      alt={`Poneglyph symbol for ${symbol.label}`}
                      loading="lazy"
                      decoding="async"
                      width="64"
                      height="64"
                      className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all duration-300"
                    />
                  </div>
                  <span className="text-sm font-mono text-stone-300 group-hover:text-cyan-400 transition-colors duration-300">
                    {symbol.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-16 text-center">
            <p className="text-stone-400 text-sm max-w-2xl mx-auto">
              This ancient script serves as a visual representation of
              blockchain principles throughout this portfolio — immutability
              meets artistry.
            </p>
          </div>
        </div>
      </section>
    );
  }
);
