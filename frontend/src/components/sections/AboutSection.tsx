import { useRef, memo } from "react";
import { PoneglyphOverlay } from "../PoneglyphOverlay";
import { PoneglyphSection } from "../PoneglyphSection";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

const PONEGLYPH_QUOTE =
  "Satoshi Nakamoto The root problem with conventional currency is all the trust that's required to make it work";

interface AboutSectionProps {
  readonly onNavigate: (section: string) => void;
}

export const AboutSection = memo(function AboutSection({
  onNavigate,
}: AboutSectionProps) {
  const ref = useRef(null);
  const isVisible = useIntersectionObserver(ref, {
    once: true,
    rootMargin: "-10%",
  });

  return (
    <PoneglyphSection id="about">
      <div
        ref={ref}
        className={`relative section-entrance ${isVisible ? "visible" : ""}`}
      >
        <PoneglyphOverlay text={PONEGLYPH_QUOTE} columns={15} />
        <div className="poneglyph-block text-center relative z-[1]">
          {/* Decrypted Content */}
          <div>
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center hover:scale-105 hover:shadow-[0_0_30px_rgba(0,191,255,0.5)] transition-all duration-300">
              <img
                src="/Nathan-G.png"
                alt="Nathan GAUD"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                width="128"
                height="128"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Title with Blockchain Effect */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-ocean-300 bg-clip-text text-transparent">
              Nathan GAUD
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-ocean-200 mb-6">
              Backend Web3 Software Engineer
            </p>

            <p className="text-lg md:text-xl text-ocean-300 mb-6 italic">
              Genesis Block - The Origin Story
            </p>

            {/* Description */}
            <div className="text-lg text-stone-300 max-w-2xl mx-auto space-y-4">
              <p>
                Welcome to my digital Poneglyph. As a Backend Web3 Software
                Engineer at iExec, I develop decentralized applications and
                blockchain infrastructure that power the future of distributed
                computing. My work focuses on building secure, scalable backend
                systems using Rust and Java.
              </p>
              <p>
                What drives me in Web3 is the immutability and transparency of
                blockchain technology - you can't lie with the blockchain. For
                me, Web3 represents freedom and the power to build systems where
                truth is verifiable and trust is built into the code itself.
              </p>
              <p className="text-cyber-400 font-semibold">
                🦀 Rust & Java Developer • 🔗 Blockchain Enthusiast • 🌊
                Building the Decentralized Future
              </p>
            </div>

            {/* Call to Action */}
            <div className="mt-8 space-x-4">
              <button
                onClick={() => onNavigate("skills")}
                className="px-8 py-3 bg-gradient-to-r from-ocean-600 to-ocean-500 rounded-lg font-semibold hover:from-ocean-500 hover:to-ocean-400 transition-all duration-300 shadow-lg hover:shadow-cyan-400/25"
              >
                Explore Poneglyphs
              </button>
              <button
                onClick={() => onNavigate("contact")}
                className="px-8 py-3 border-2 border-cyber-400 text-cyber-400 rounded-lg font-semibold hover:bg-cyber-400 hover:text-ocean-900 transition-all duration-300"
              >
                Connect Blocks
              </button>
            </div>
          </div>
        </div>
      </div>
    </PoneglyphSection>
  );
});
