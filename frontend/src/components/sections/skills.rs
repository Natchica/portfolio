use leptos::prelude::*;

use crate::components::poneglyph_overlay::PoneglyphOverlay;
use crate::components::poneglyph_section::PoneglyphSection;
use crate::hooks::use_intersection_observer::{
    IntersectionObserverOptions, use_intersection_observer,
};

const PONEGLYPH_QUOTE: &str = "Bitcoin is the apex property of the human race";
const QUOTE_AUTHOR: &str = "Michael Saylor";

struct Skill {
    name: &'static str,
    level: u32,
    icon: &'static str,
}

const SKILLS: &[Skill] = &[
    Skill {
        name: "Rust",
        level: 90,
        icon: "\u{1f980}",
    },
    Skill {
        name: "Java",
        level: 90,
        icon: "\u{2615}",
    },
    Skill {
        name: "TypeScript",
        level: 70,
        icon: "\u{26a1}",
    },
    Skill {
        name: "Solidity",
        level: 65,
        icon: "\u{1f4dc}",
    },
    Skill {
        name: "Backend Development",
        level: 85,
        icon: "\u{2699}\u{fe0f}",
    },
    Skill {
        name: "Web3/Blockchain",
        level: 75,
        icon: "\u{1f517}",
    },
    Skill {
        name: "DevOps/CI-CD",
        level: 70,
        icon: "\u{1f504}",
    },
];

#[component]
pub fn SkillsSection() -> impl IntoView {
    let node_ref = NodeRef::<leptos::html::Div>::new();
    let is_visible = use_intersection_observer(
        node_ref,
        IntersectionObserverOptions {
            once: true,
            root_margin: "-10%",
            ..Default::default()
        },
    );
    let (decoded, set_decoded) = signal(false);

    view! {
        <PoneglyphSection id="skills-inner">
            <div
                node_ref=node_ref
                class={move || {
                    if is_visible.get() {
                        "section-entrance-wrapper section-entrance visible"
                    } else {
                        "section-entrance-wrapper section-entrance"
                    }
                }}
            >
                <PoneglyphOverlay
                    author=QUOTE_AUTHOR
                    quote=PONEGLYPH_QUOTE
                    columns=15
                    on_decode_complete=Callback::new(move |_| set_decoded.set(true))
                />
                <div class=move || if decoded.get() {
                    "poneglyph-block content-layer content-decoded"
                } else {
                    "poneglyph-block content-layer"
                }>
                    <h2 class="section-header">"Technical Glyphs"</h2>
                    <div class="skill-grid">
                        {SKILLS
                            .iter()
                            .enumerate()
                            .map(|(index, skill)| {
                                let width_style = format!("width: {}%;", skill.level);
                                let stagger = format!("--item-index: {index};");
                                view! {
                                    <div class="skill-card stagger-item" style={stagger}>
                                        <div class="skill-card-header">
                                            <span class="skill-icon">{skill.icon}</span>
                                            <h3 class="skill-name">{skill.name}</h3>
                                        </div>
                                        <div class="skill-bar">
                                            <div class="skill-bar-fill" style={width_style} />
                                        </div>
                                        <p class="skill-proficiency">
                                            {format!("{}% Proficiency", skill.level)}
                                        </p>
                                    </div>
                                }
                            })
                            .collect_view()}
                    </div>
                </div>
            </div>
        </PoneglyphSection>
    }
}
