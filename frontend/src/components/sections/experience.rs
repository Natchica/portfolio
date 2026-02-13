use leptos::prelude::*;

use crate::components::poneglyph_overlay::PoneglyphOverlay;
use crate::components::poneglyph_section::PoneglyphSection;
use crate::hooks::use_intersection_observer::{
    IntersectionObserverOptions, use_intersection_observer,
};

const PONEGLYPH_QUOTE: &str = "I left everything I own in that place";
const QUOTE_AUTHOR: &str = "Gol D Roger";

struct ExperienceItem {
    kind: &'static str,
    title: &'static str,
    period: &'static str,
    description: &'static str,
    icon: &'static str,
}

const EXPERIENCES: &[ExperienceItem] = &[
    ExperienceItem {
        kind: "Education",
        title: "Dipl\u{00f4}me d'Ing\u{00e9}nieur - Software Engineering",
        period: "2021-2024",
        description: "Engineering degree in Computer Science from INP-ENSEEIHT, specializing in Systems and Software Engineering. Included Erasmus semester in Madrid focusing on Data Sciences and Intelligent Systems.",
        icon: "\u{1f393}",
    },
    ExperienceItem {
        kind: "Certification",
        title: "Blockchain Principles & Digital Currencies",
        period: "2023",
        description: "MOOC certification from University of Nicosia covering blockchain fundamentals, cryptocurrency principles, and decentralized applications.",
        icon: "\u{1f517}",
    },
    ExperienceItem {
        kind: "Experience",
        title: "Backend Web3 Software Engineer - iExec",
        period: "Feb 2024-Present",
        description: "Developing backend services for decentralized computing platform. Working with Rust and Java to build scalable Web3 infrastructure. Managing middleware roadmap, implementing automated testing, and mentoring junior developers.",
        icon: "\u{1f4bc}",
    },
    ExperienceItem {
        kind: "Internship",
        title: "Software Quality Engineer - EES Clemessy",
        period: "Jun-Aug 2023",
        description: "Conducted comprehensive software testing, benchmarked automated testing tools, and implemented POC for functional test automation.",
        icon: "\u{2699}\u{fe0f}",
    },
];

#[component]
pub fn ExperienceSection() -> impl IntoView {
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
        <PoneglyphSection id="experience-inner">
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
                    <h2 class="section-header">"Historical Records"</h2>
                    <div class="experience-list">
                        {EXPERIENCES
                            .iter()
                            .enumerate()
                            .map(|(index, item)| {
                                let stagger = format!("--item-index: {index};");
                                view! {
                                    <div class="experience-item stagger-slide" style={stagger}>
                                        <div class="experience-icon">{item.icon}</div>
                                        <div class="experience-content">
                                            <div class="experience-header">
                                                <h3 class="experience-title">{item.title}</h3>
                                                <span class="experience-period">{item.period}</span>
                                            </div>
                                            <p class="experience-type">{item.kind}</p>
                                            <p class="experience-description">{item.description}</p>
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
