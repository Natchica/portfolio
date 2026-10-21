use leptos::prelude::*;

use crate::components::poneglyph_overlay::PoneglyphOverlay;
use crate::components::poneglyph_section::PoneglyphSection;
use crate::hooks::use_intersection_observer::{
    IntersectionObserverOptions, use_intersection_observer,
};

pub(super) const PONEGLYPH_QUOTE: &str = "Talk is cheap show me the code";
pub(super) const QUOTE_AUTHOR: &str = "Linus Torvalds";

struct SkillGroup {
    name: &'static str,
    icon: &'static str,
    tags: &'static [&'static str],
}

const SKILL_GROUPS: &[SkillGroup] = &[
    SkillGroup {
        name: "Languages",
        icon: "\u{1f4dc}",
        tags: &["Rust", "Java", "TypeScript"],
    },
    SkillGroup {
        name: "Backend",
        icon: "\u{2699}\u{fe0f}",
        tags: &[
            "Spring",
            "Axum",
            "NATS JetStream",
            "Event-driven services",
            "REST APIs",
            "AES encryption",
            "Authorization",
        ],
    },
    SkillGroup {
        name: "Infrastructure",
        icon: "\u{1f433}",
        tags: &["Docker", "OCI images", "GitHub Actions", "Jenkins", "CI/CD"],
    },
    SkillGroup {
        name: "Tooling",
        icon: "\u{1f6e0}\u{fe0f}",
        tags: &[
            "Git",
            "GitHub",
            "Gradle",
            "Linux",
            "Bash",
            "systemd",
            "Claude Code",
            "Test automation",
        ],
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
                    on_encode=Callback::new(move |_| set_decoded.set(false))
                />
                <div class=move || if decoded.get() {
                    "poneglyph-block content-layer content-decoded"
                } else {
                    "poneglyph-block content-layer"
                }>
                    <h2 class="section-header">"Technical Glyphs"</h2>
                    <div class="skill-grid">
                        {SKILL_GROUPS
                            .iter()
                            .enumerate()
                            .map(|(index, group)| {
                                let stagger = format!("--item-index: {index};");
                                view! {
                                    <div class="skill-card stagger-item" style={stagger}>
                                        <div class="skill-card-header">
                                            <span class="skill-icon">{group.icon}</span>
                                            <h3 class="skill-name">{group.name}</h3>
                                        </div>
                                        <div class="tech-tags">
                                            {group
                                                .tags
                                                .iter()
                                                .map(|t| view! { <span class="tech-tag">{*t}</span> })
                                                .collect_view()}
                                        </div>
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
