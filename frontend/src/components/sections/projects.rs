use leptos::either::Either;
use leptos::prelude::*;

use crate::components::slab_cluster::{ClusterSlab, SlabCluster};

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
                description: "Lead developer of three event-driven Rust services (Handle Gateway, Observer, Ingestor-Replayer) over NATS JetStream, and co-developer and reviewer of the KMS, Runner and Ingestor services.",
                tech: &["Rust", "NATS JetStream", "Event-driven"],
                status: "Shipped",
                status_class: "status-complete",
                icon: "\u{1f980}",
                href: None,
            },
            Project {
                title: "iexec-stork and Java 17 Migration",
                description: "Lead developer of iexec-stork, a Java and Spring tool that migrates secrets between two service instances. Also moved the middleware Spring services to Java 17 and Gradle 8.10 for the coordinated 9.0.0 release.",
                tech: &["Java", "Spring", "Gradle", "Docker"],
                status: "Shipped",
                status_class: "status-complete",
                icon: "\u{1f510}",
                href: None,
            },
            Project {
                title: "Autonomous Worker and Rust Middleware",
                description: "Merged the scheduler and worker into an autonomous worker without REST/STOMP or JWT between components, keeping 100% coverage across 1,250+ unit tests. Later rewrote two middleware components from Java to Rust for a 75% gain in core performance.",
                tech: &["Java", "Spring", "Rust"],
                status: "Shipped",
                status_class: "status-complete",
                icon: "\u{2699}\u{fe0f}",
                href: None,
            },
        ],
    },
    ProjectGroup {
        label: "Tools for Myself",
        projects: &[
            Project {
                title: "claude-plugins",
                description: "Small hook plugins that tune my own Claude Code setup: a guard on secret-file access, model routing and messaging between my sessions. A personal workbench, not production code.",
                tech: &["TypeScript", "Claude Code"],
                status: "Active",
                status_class: "status-dev",
                icon: "\u{1f9e9}",
                href: None,
            },
            Project {
                title: "cc-window-primer",
                description: "A systemd user timer that starts my Claude Code usage window when my laptop boots, so a fresh quota lands earlier in the working day.",
                tech: &["Node.js", "systemd"],
                status: "Active",
                status_class: "status-dev",
                icon: "\u{23f1}\u{fe0f}",
                href: None,
            },
            Project {
                title: "career-ops (fork)",
                description: "My fork of career-ops, an open-source tool that helps organize a job search: it scans job portals, scores listings and keeps track of applications.",
                tech: &["JavaScript"],
                status: "Active",
                status_class: "status-dev",
                icon: "\u{1f9ed}",
                href: Some("https://github.com/Natchica/career-ops"),
            },
        ],
    },
    ProjectGroup {
        label: "Side Projects",
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
    view! {
        <SlabCluster
            id="projects-inner"
            title="Log Pose"
            author=QUOTE_AUTHOR
            quote=PONEGLYPH_QUOTE
        >
            {PROJECT_GROUPS
                .iter()
                .enumerate()
                .map(|(group_index, group)| {
                    let offset: usize = PROJECT_GROUPS[..group_index]
                        .iter()
                        .map(|g| g.projects.len())
                        .sum();
                    view! {
                        <ClusterSlab index=group_index label=group.label>
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
                        </ClusterSlab>
                    }
                })
                .collect_view()}
        </SlabCluster>
    }
}

#[cfg(test)]
mod tests {
    use super::PROJECT_GROUPS;
    use crate::utils::quote_split::CLUSTER_SLABS;

    #[test]
    fn groups_fill_one_cluster() {
        assert_eq!(PROJECT_GROUPS.len(), CLUSTER_SLABS);
    }
}
