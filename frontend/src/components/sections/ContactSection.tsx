import { useRef, memo } from "react";
import { PoneglyphOverlay } from "../PoneglyphOverlay";
import { PoneglyphSection } from "../PoneglyphSection";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

const PONEGLYPH_QUOTE =
  "Bob Marley If there's a problem there's a solution If there's no solution there's no problem";

interface ContactSectionProps {
  readonly onNavigate: (section: string) => void;
}

export const ContactSection = memo(function ContactSection({
  onNavigate,
}: ContactSectionProps) {
  const ref = useRef(null);
  const isVisible = useIntersectionObserver(ref, {
    once: true,
    rootMargin: "-10%",
  });

  return (
    <PoneglyphSection id="contact" showConnectionLine={false}>
      <div
        ref={ref}
        className={`relative section-entrance ${isVisible ? "visible" : ""}`}
      >
        <PoneglyphOverlay text={PONEGLYPH_QUOTE} columns={15} />
        <div className="poneglyph-block relative z-[1]">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-ocean-300 to-cyber-400 bg-clip-text text-transparent">
            Final Poneglyph
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            {/* TODO: Implement contact form backend - connect to Rust backend for email sending */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Send a Message
              </h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full p-3 bg-stone-700 border border-stone-600 rounded-lg text-white placeholder-stone-400 focus:border-cyber-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full p-3 bg-stone-700 border border-stone-600 rounded-lg text-white placeholder-stone-400 focus:border-cyber-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    rows={5}
                    placeholder="Your Message"
                    className="w-full p-3 bg-stone-700 border border-stone-600 rounded-lg text-white placeholder-stone-400 focus:border-cyber-400 focus:outline-none transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-ocean-600 to-ocean-500 rounded-lg font-semibold hover:from-ocean-500 hover:to-ocean-400 transition-all duration-300 shadow-lg hover:shadow-cyan-400/25"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info & Links */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Connect With Me
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "Email",
                      value: "Contact via form below",
                      icon: "📧",
                    },
                    { label: "Location", value: "France", icon: "📍" },
                    {
                      label: "Status",
                      value: "Currently Employed - Open to Opportunities",
                      icon: "💼",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center space-x-3"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-stone-400 text-sm">{item.label}</p>
                        <p className="text-white font-semibold">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold text-white mb-4">
                  Social Links
                </h4>
                {/* TODO: Add real social links - GitHub: Natchica, LinkedIn: nathan-gaud */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "GitHub", icon: "💻", url: "#" },
                    { name: "LinkedIn", icon: "💼", url: "#" },
                    { name: "Twitter", icon: "🐦", url: "#" },
                    { name: "Email", icon: "📧", url: "#" },
                  ].map((social) => (
                    <button
                      key={social.name}
                      className="flex items-center space-x-2 p-3 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors"
                    >
                      <span className="text-xl">{social.icon}</span>
                      <span className="text-white font-semibold">
                        {social.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-600">
                {/* TODO: Implement CV download functionality */}
                <button className="w-full py-3 bg-gradient-to-r from-cyber-600 to-cyber-500 rounded-lg font-semibold hover:from-cyber-500 hover:to-cyber-400 transition-all duration-300">
                  📄 Download CV
                </button>
              </div>
            </div>
          </div>

          {/* Loop back to beginning */}
          <div className="text-center mt-12 pt-8 border-t border-stone-600">
            <p className="text-stone-400 mb-4">The blockchain continues...</p>
            <button
              onClick={() => onNavigate("about")}
              className="px-8 py-3 border-2 border-ocean-400 text-ocean-400 rounded-lg font-semibold hover:bg-ocean-400 hover:text-ocean-900 transition-all duration-300"
            >
              ⚓ Return to Genesis Block
            </button>
          </div>
        </div>
      </div>
    </PoneglyphSection>
  );
});
