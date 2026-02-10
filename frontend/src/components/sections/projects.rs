use leptos::prelude::*;

use crate::components::poneglyph_overlay::PoneglyphOverlay;
use crate::components::poneglyph_section::PoneglyphSection;
use crate::hooks::use_intersection_observer::{
    use_intersection_observer, IntersectionObserverOptions,
};

const PONEGLYPH_QUOTE: &str = "I am going to be the Pirate King";
const QUOTE_AUTHOR: &str = "Monkey D Luffy";

struct Project {
    title: &'static str,
    description: &'static str,
    tech: &'static [&'static str],
    status: &'static str,
    status_class: &'static str,
    icon: &'static str,
}

const PROJECTS: &[Project] = &[
    Project {
        title: "Poneglyph Portfolio",
        description: "Personal portfolio combining One Piece aesthetics with blockchain themes. Built with Leptos, Rust, and Axum backend featuring infinite scroll and decryption animations.",
        tech: &["Leptos", "Rust", "Axum", "WASM"],
        status: "In Development",
        status_class: "status-dev",
        icon: "\u{2693}",
    },
    Project {
        title: "Web3 Infrastructure Development",
        description: "Backend engineering for decentralized cloud computing platform. Confidential project work involving Rust and Java development for blockchain-integrated middleware.",
        tech: &["Rust", "Java", "Blockchain", "Web3", "Microservices"],
        status: "In Development",
        status_class: "status-dev",
        icon: "\u{1f980}",
    },
];

#[component]
pub fn ProjectsSection() -> impl IntoView {
    let node_ref = NodeRef::<leptos::html::Div>::new();
    let is_visible = use_intersection_observer(
        node_ref,
        IntersectionObserverOptions {
            once: true,
            root_margin: "-10%",
            ..Default::default()
        },
    );

    view! {
        <PoneglyphSection id="projects-inner">
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
                <PoneglyphOverlay author=QUOTE_AUTHOR quote=PONEGLYPH_QUOTE columns=15 />
                <div class="poneglyph-block content-layer">
                    <h2 class="section-header">"Treasure Maps"</h2>
                    <div class="project-grid">
                        {PROJECTS
                            .iter()
                            .map(|project| {
                                view! {
                                    <div class="project-card">
                                        <div class="project-card-header">
                                            <span class="project-icon">{project.icon}</span>
                                            <div>
                                                <h3 class="project-title">{project.title}</h3>
                                                <span class={format!(
                                                    "status-badge {}",
                                                    project.status_class,
                                                )}>{project.status}</span>
                                            </div>
                                        </div>
                                        <p class="project-description">{project.description}</p>
                                        <div class="tech-tags">
                                            {project
                                                .tech
                                                .iter()
                                                .map(|t| {
                                                    view! { <span class="tech-tag">{*t}</span> }
                                                })
                                                .collect_view()}
                                        </div>
                                    </div>
                                }
                            })
                            .collect_view()}
                    </div>
                    <div class="text-center mt-8">
                        <button class="btn-primary btn-coming-soon">
                            "More Projects Coming Soon"
                        </button>
                    </div>
                </div>
            </div>
        </PoneglyphSection>
    }
}
