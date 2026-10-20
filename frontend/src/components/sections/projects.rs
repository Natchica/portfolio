use leptos::either::Either;
use leptos::prelude::*;

use crate::components::poneglyph_overlay::PoneglyphOverlay;
use crate::components::poneglyph_section::PoneglyphSection;
use crate::hooks::use_intersection_observer::{
    IntersectionObserverOptions, use_intersection_observer,
};

pub(super) const PONEGLYPH_QUOTE: &str = "I am going to be the Pirate King";
pub(super) const QUOTE_AUTHOR: &str = "Monkey D Luffy";

struct Project {
    title: &'static str,
    description: &'static str,
    tech: &'static [&'static str],
    status: &'static str,
    status_class: &'static str,
    icon: &'static str,
    href: Option<&'static str>,
}

struct ProjectGroup {
    label: &'static str,
    projects: &'static [Project],
}

const PROJECT_GROUPS: &[ProjectGroup] = &[
    ProjectGroup {
        label: "Professional",
        projects: &[
            Project {
                title: "Nox Protocol Services",
                description: "Lead developer of three event-driven Rust services (Handle Gateway, Observer, Ingestor-Replayer) over NATS JetStream, and co-developer of the KMS, Runner and Ingestor that run TEE computation in Intel TDX.",
                tech: &["Rust", "NATS JetStream", "Intel TDX", "TEE"],
                status: "Delivered",
                status_class: "status-complete",
                icon: "\u{1f980}",
                href: None,
            },
            Project {
                title: "iexec-stork and Java 17 Migration",
                description: "Lead developer of iexec-stork, a Java and Spring tool that migrates secrets from Intel SGX to Intel TDX. Also moved the middleware Spring services to Java 17 and Gradle 8.10 for the coordinated 9.0.0 release.",
                tech: &["Java", "Spring", "Intel SGX", "Intel TDX", "Gradle"],
                status: "Delivered",
                status_class: "status-complete",
                icon: "\u{1f510}",
                href: None,
            },
            Project {
                title: "Autonomous Worker and Rust Middleware",
                description: "Merged the scheduler and worker into an autonomous worker without REST/STOMP or JWT between components, keeping 100% coverage across 1,250+ unit tests. Later rewrote two middleware components from Java to Rust for a 75% gain in core performance.",
                tech: &["Java", "Spring", "Rust", "Web3j"],
                status: "Delivered",
                status_class: "status-complete",
                icon: "\u{2699}\u{fe0f}",
                href: None,
            },
        ],
    },
    ProjectGroup {
        label: "Built with AI",
        projects: &[
            Project {
                title: "claude-plugins",
                description: "Function-hook plugins for Claude Code: model routing when agents spawn, a fail-closed guard on secret-file reads and edits, and stable handles with delivery and read receipts for messages between sessions.",
                tech: &["TypeScript", "Claude Code"],
                status: "Active",
                status_class: "status-dev",
                icon: "\u{1f9e9}",
                href: None,
            },
            Project {
                title: "cc-window-primer",
                description: "A systemd user timer that sends one minimal Claude Code message at laptop boot and again after each 5-hour usage window, so a fresh quota lands earlier in the working day.",
                tech: &["Node.js", "systemd", "Claude Code"],
                status: "Active",
                status_class: "status-dev",
                icon: "\u{23f1}\u{fe0f}",
                href: None,
            },
            Project {
                title: "career-ops (fork)",
                description: "My fork of career-ops, the open-source AI job search agent that scans job portals, scores listings and tailors a CV, running locally in Claude Code.",
                tech: &["JavaScript", "Claude Code"],
                status: "Active",
                status_class: "status-dev",
                icon: "\u{1f9ed}",
                href: Some("https://github.com/Natchica/career-ops"),
            },
        ],
    },
    ProjectGroup {
        label: "Personal",
        projects: &[
            Project {
                title: "Poneglyph Portfolio",
                description: "This site: a One Piece poneglyph world in Rust, with Leptos compiled to WASM, a Three.js layer for the stone slabs and an endless scroll loop.",
                tech: &["Rust", "Leptos", "WASM", "Three.js"],
                status: "Active",
                status_class: "status-dev",
                icon: "\u{2693}",
                href: Some("https://github.com/Natchica/portfolio"),
            },
            Project {
                title: "TimeGuard",
                description: "Concept for a mobile app that stops you from getting lost in social feeds and going to bed hours after you meant to.",
                tech: &["Mobile"],
                status: "Concept",
                status_class: "status-planned",
                icon: "\u{1f319}",
                href: Some("https://github.com/Natchica/TimeGuard"),
            },
            Project {
                title: "Wikipedia Traffic Forecasting",
                description: "Data mining project that forecasts future traffic of Wikipedia pages, with exploratory analysis, SARIMA and Huber regression notebooks.",
                tech: &["Python", "Jupyter", "SARIMA"],
                status: "Complete",
                status_class: "status-complete",
                icon: "\u{1f4c8}",
                href: Some("https://github.com/Natchica/DM_WebTraffic"),
            },
            Project {
                title: "Ethereum Bootcamp Projects",
                description: "Personal code from an Ethereum developer bootcamp: a block explorer, ECDSA and transaction signing, and Hardhat practice.",
                tech: &["Solidity", "JavaScript", "Hardhat"],
                status: "Complete",
                status_class: "status-complete",
                icon: "\u{1f517}",
                href: Some("https://github.com/Natchica/AU_EthereumFundamentals-EthBootcamp"),
            },
        ],
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
    let (decoded, set_decoded) = signal(false);

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
                    <h2 class="section-header">"Treasure Maps"</h2>
                    {PROJECT_GROUPS
                        .iter()
                        .enumerate()
                        .map(|(group_index, group)| {
                            let offset: usize = PROJECT_GROUPS[..group_index]
                                .iter()
                                .map(|g| g.projects.len())
                                .sum();
                            view! {
                                <h3 class="project-group-title">{group.label}</h3>
                                <div class="project-grid">
                                    {group
                                        .projects
                                        .iter()
                                        .enumerate()
                                        .map(|(i, project)| {
                                            let stagger = format!("--item-index: {};", offset + i);
                                            let title = match project.href {
                                                Some(href) => {
                                                    Either::Left(
                                                        view! {
                                                            <a
                                                                class="project-link"
                                                                href=href
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {project.title}
                                                            </a>
                                                        },
                                                    )
                                                }
                                                None => Either::Right(project.title),
                                            };
                                            view! {
                                                <div class="project-card stagger-scale" style={stagger}>
                                                    <div class="project-card-header">
                                                        <span class="project-icon">{project.icon}</span>
                                                        <div>
                                                            <h4 class="project-title">{title}</h4>
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
                            }
                        })
                        .collect_view()}
                </div>
            </div>
        </PoneglyphSection>
    }
}
