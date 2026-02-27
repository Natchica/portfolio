use leptos::prelude::*;

struct SymbolData {
    path: &'static str,
    label: &'static str,
    is_letter: bool,
}

const SYMBOLS: &[SymbolData] = &[
    SymbolData {
        path: "/symbols/svg/letters/a.svg",
        label: "A",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/bv.svg",
        label: "B/V",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/kqc.svg",
        label: "K/Q/C",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/d.svg",
        label: "D",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/e.svg",
        label: "E",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/f.svg",
        label: "F",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/g.svg",
        label: "G",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/i.svg",
        label: "I",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/j.svg",
        label: "J",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/l.svg",
        label: "L",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/m.svg",
        label: "M",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/n.svg",
        label: "N",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/o.svg",
        label: "O",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/p.svg",
        label: "P",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/r.svg",
        label: "R",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/szc.svg",
        label: "S/Z/C",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/t.svg",
        label: "T",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/u.svg",
        label: "U",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/x.svg",
        label: "X",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/letters/yll.svg",
        label: "Y/LL",
        is_letter: true,
    },
    SymbolData {
        path: "/symbols/svg/numbers/0.svg",
        label: "0",
        is_letter: false,
    },
    SymbolData {
        path: "/symbols/svg/numbers/1.svg",
        label: "1",
        is_letter: false,
    },
    SymbolData {
        path: "/symbols/svg/numbers/2.svg",
        label: "2",
        is_letter: false,
    },
    SymbolData {
        path: "/symbols/svg/numbers/3.svg",
        label: "3",
        is_letter: false,
    },
    SymbolData {
        path: "/symbols/svg/numbers/4.svg",
        label: "4",
        is_letter: false,
    },
    SymbolData {
        path: "/symbols/svg/numbers/5.svg",
        label: "5",
        is_letter: false,
    },
    SymbolData {
        path: "/symbols/svg/numbers/6.svg",
        label: "6",
        is_letter: false,
    },
    SymbolData {
        path: "/symbols/svg/numbers/7.svg",
        label: "7",
        is_letter: false,
    },
    SymbolData {
        path: "/symbols/svg/numbers/8.svg",
        label: "8",
        is_letter: false,
    },
    SymbolData {
        path: "/symbols/svg/numbers/9.svg",
        label: "9",
        is_letter: false,
    },
];

#[component]
pub fn AlphabetGrid() -> impl IntoView {
    let letter_views: Vec<_> = SYMBOLS
        .iter()
        .filter(|s| s.is_letter)
        .map(|symbol| {
            let alt = format!("Poneglyph symbol for {}", symbol.label);
            view! {
                <div class="decoder-item">
                    <img
                        src={symbol.path}
                        alt={alt}
                        loading="lazy"
                        decoding="async"
                        width="32"
                        height="32"
                        class="alphabet-img"
                    />
                    <span class="decoder-label">{symbol.label}</span>
                </div>
            }
        })
        .collect();

    let number_views: Vec<_> = SYMBOLS
        .iter()
        .filter(|s| !s.is_letter)
        .map(|symbol| {
            let alt = format!("Poneglyph symbol for {}", symbol.label);
            view! {
                <div class="decoder-item">
                    <img
                        src={symbol.path}
                        alt={alt}
                        loading="lazy"
                        decoding="async"
                        width="32"
                        height="32"
                        class="alphabet-img"
                    />
                    <span class="decoder-label">{symbol.label}</span>
                </div>
            }
        })
        .collect();

    view! {
        <div class="decoder-grid-root">
            <div class="decoder-grid">{letter_views}</div>
            <div class="decoder-grid decoder-grid-numbers">{number_views}</div>
        </div>
    }
}

#[component]
pub fn PoneglyphAlphabetSection() -> impl IntoView {
    let letter_views: Vec<_> = SYMBOLS
        .iter()
        .filter(|s| s.is_letter)
        .map(|symbol| {
            let alt = format!("Poneglyph symbol for {}", symbol.label);
            view! {
                <div class="alphabet-item">
                    <div class="alphabet-img-wrapper">
                        <img
                            src={symbol.path}
                            alt={alt}
                            loading="lazy"
                            decoding="async"
                            width="64"
                            height="64"
                            class="alphabet-img"
                        />
                    </div>
                    <span class="alphabet-label">{symbol.label}</span>
                </div>
            }
        })
        .collect();

    let number_views: Vec<_> = SYMBOLS
        .iter()
        .filter(|s| !s.is_letter)
        .map(|symbol| {
            let alt = format!("Poneglyph symbol for {}", symbol.label);
            view! {
                <div class="alphabet-item">
                    <div class="alphabet-img-wrapper">
                        <img
                            src={symbol.path}
                            alt={alt}
                            loading="lazy"
                            decoding="async"
                            width="64"
                            height="64"
                            class="alphabet-img"
                        />
                    </div>
                    <span class="alphabet-label">{symbol.label}</span>
                </div>
            }
        })
        .collect();

    view! {
        <section class="alphabet-section">
            <div class="alphabet-container">
                <div class="alphabet-header">
                    <h2 class="section-header alphabet-title">"Poneglyph Alphabet"</h2>
                    <div class="alphabet-description">
                        <p>
                            "In One Piece, Poneglyphs are indestructible stone tablets that \
                             contain the true history of the world, written in an ancient \
                             script that only a few can decipher. They represent immutable, \
                             tamper-proof records of truth."
                        </p>
                        <p>
                            "Much like blockchain technology, Poneglyphs are "
                            <span class="highlight-inline">"permanent, distributed, and verifiable"</span>
                            " \u{2014} a fitting metaphor for decentralized systems where data \
                             integrity and transparency are paramount."
                        </p>
                        <p class="alphabet-footnote">
                            "Below is the complete Poneglyph writing system that inspired the \
                             visual identity of this portfolio."
                        </p>
                    </div>
                </div>

                <div class="alphabet-group">
                    <h3 class="alphabet-group-title">"Letters"</h3>
                    <div class="alphabet-grid alphabet-grid-letters">
                        {letter_views}
                    </div>
                </div>

                <div class="alphabet-group">
                    <h3 class="alphabet-group-title">"Numbers"</h3>
                    <div class="alphabet-grid alphabet-grid-numbers">
                        {number_views}
                    </div>
                </div>

                <div class="alphabet-footer">
                    <p>
                        "This ancient script serves as a visual representation of \
                         blockchain principles throughout this portfolio \u{2014} immutability \
                         meets artistry."
                    </p>
                </div>
            </div>
        </section>
    }
}
