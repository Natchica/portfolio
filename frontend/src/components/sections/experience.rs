use leptos::either::Either;
use leptos::prelude::*;

use crate::components::slab_cluster::{ClusterSlab, SlabCluster};

pub(super) const PONEGLYPH_QUOTE: &str = "I left everything I own in that place";
pub(super) const QUOTE_AUTHOR: &str = "Gol D Roger";

struct ExperienceItem {
    kind: &'static str,
    title: &'static str,
    period: &'static str,
    bullets: &'static [&'static str],
    icon: &'static str,
}

struct ExperienceGroup {
    label: &'static str,
    kinds: &'static [&'static str],
}

const GROUPS: &[ExperienceGroup] = &[
    ExperienceGroup {
        label: "Professional Experience",
        kinds: &["Work", "Internship"],
    },
    ExperienceGroup {
        label: "Trainings",
        kinds: &["Training"],
    },
    ExperienceGroup {
        label: "Studies",
        kinds: &["Education"],
    },
];

/// Trainings and studies read as one or two plain sentences, with no kind label and no bullets.
fn is_summary(kind: &str) -> bool {
    matches!(kind, "Training" | "Education")
}

const EXPERIENCES: &[ExperienceItem] = &[
    ExperienceItem {
        kind: "Work",
        title: "Backend Software Engineer - iExec",
        period: "Sep 2024 to Oct 2026",
        bullets: &[
            "Lead developer of 3 Rust services in the Nox protocol (Handle Gateway, Observer, Ingestor-Replayer), with event-driven processing over NATS JetStream.",
            "Co-developer and reviewer for the KMS, Runner and Ingestor services.",
            "Rewrote 2 middleware components from Java to Rust, for a 75% gain in core performance.",
            "Lead developer of iexec-stork (Java, Spring), which migrates secrets between two instances of the secrets management service, covering AES encryption, H2 persistence, migration orchestration, CI and the OCI image.",
            "Migrated the middleware Spring services (Core, SMS, Worker, Common, Pre-compute) from Java 11 to 17 and Gradle 8.10, then shipped the coordinated 9.0.0 release.",
            "Hardened Java services with stronger AES encryption, proof of authorization for exchanges between services, immutable authorization objects and multi-error reporting in the Worker.",
        ],
        icon: "\u{1f4bc}",
    },
    ExperienceItem {
        kind: "Internship",
        title: "Backend Software Engineering Intern - iExec",
        period: "Feb 2024 to Aug 2024",
        bullets: &[
            "Merged the scheduler and worker codebases into an autonomous worker, removing centralized orchestration from a decentralized cloud platform.",
            "Removed REST/STOMP communication and JWT authentication between components while keeping 100% coverage across 1,250+ unit tests.",
            "Fixed production bugs found during code analysis and completed the v8.4 to v8.5 migration mid-development.",
        ],
        icon: "\u{2699}\u{fe0f}",
    },
    ExperienceItem {
        kind: "Internship",
        title: "Software Quality Engineer Intern - EES Clemessy",
        period: "Jun 2023 to Aug 2023",
        bullets: &[
            "Researched software testing approaches and benchmarked automated testing tools.",
            "Built a proof of concept for functional test automation in Python and JavaScript, applying web test automation frameworks.",
        ],
        icon: "\u{1f9ea}",
    },
    ExperienceItem {
        kind: "Work",
        title: "Assistant Director - Youth Supervision",
        period: "Jul 2017 to Aug 2022",
        bullets: &[
            "Supervised teams of up to 12 summer camp leaders for PEP Alsace, CCGPF and SNU: coordination, evaluation and operational management.",
            "Designed educational projects and ran residential programs, including their administration.",
        ],
        icon: "\u{1f3d5}\u{fe0f}",
    },
    ExperienceItem {
        kind: "Training",
        title: "Claude Code Training - Selina",
        period: "Jun 2026",
        bullets: &[
            "10.5-hour in-house training on fitting Claude Code into a shared software development lifecycle: context engineering, SDLC skills, commands, hooks, agents and plugins.",
            "Delivered a project CLAUDE.md, a library of SDLC skills, commands, pre- and post-tool hooks, a specialized agent and a plugin published on iExec's shared repository.",
        ],
        icon: "\u{1f9f0}",
    },
    ExperienceItem {
        kind: "Training",
        title: "Rust Training - Bashroom",
        period: "Jun 2025 to Sep 2025",
        bullets: &["Rust development training."],
        icon: "\u{1f980}",
    },
    ExperienceItem {
        kind: "Training",
        title: "EVM Bootcamp - Encode",
        period: "Mar 2025 to Apr 2025",
        bullets: &["Bootcamp on EVM blockchain development."],
        icon: "\u{26d3}\u{fe0f}",
    },
    ExperienceItem {
        kind: "Education",
        title: "Engineering Degree - INP-ENSEEIHT",
        period: "Sep 2021 to Sep 2024",
        bullets: &[
            "Computer Science, specialized in Software Systems and Engineering.",
            "Erasmus semester at UPM (ETSIINF), Madrid, Sep 2023 to Jan 2024: Data Sciences, Intelligent Systems, eHealth and Software.",
        ],
        icon: "\u{1f393}",
    },
    ExperienceItem {
        kind: "Education",
        title: "Preparatory Classes - La Prépa des INP, Nancy",
        period: "2019 to 2021",
        bullets: &[
            "Two-year integrated preparatory cycle of the Groupe INP engineering schools, assessed by continuous assessment with no competitive exam, leading to INP-ENSEEIHT.",
        ],
        icon: "\u{1f4d0}",
    },
    ExperienceItem {
        kind: "Education",
        title: "Baccalauréat S - Lycée Scheurer-Kestner, Thann",
        period: "2019",
        bullets: &[
            "French scientific baccalaureate with the mathematics specialty, passed with highest honours (mention Très Bien).",
            "German European section: extra German classes and physics and chemistry taught in German, with the European section mention on the diploma.",
        ],
        icon: "\u{1f3eb}",
    },
    ExperienceItem {
        kind: "Training",
        title: "Blockchain Certificate - University of Nicosia",
        period: "Sep 2023 to Dec 2023",
        bullets: &[
            "Certificate in Blockchain and Digital Currency Principles and Applications, taken remotely.",
        ],
        icon: "\u{1f517}",
    },
];

#[component]
pub fn ExperienceSection() -> impl IntoView {
    view! {
        <SlabCluster
            id="experience-inner"
            title="Historical Records"
            author=QUOTE_AUTHOR
            quote=PONEGLYPH_QUOTE
        >
            {GROUPS
                .iter()
                .enumerate()
                .map(|(group_index, group)| {
                    view! {
                        <ClusterSlab index=group_index label=group.label>
                            <div class="experience-list">
                                {EXPERIENCES
                                    .iter()
                                    .enumerate()
                                    .filter(|(_, item)| group.kinds.contains(&item.kind))
                                    .map(|(index, item)| {
                                        let stagger = format!("--item-index: {index};");
                                        view! {
                                            <div class="experience-item stagger-slide" style={stagger}>
                                                <div class="experience-icon">{item.icon}</div>
                                                <div class="experience-content">
                                                    <div class="experience-header">
                                                        <h4 class="experience-title">{item.title}</h4>
                                                        <span class="experience-period">{item.period}</span>
                                                    </div>
                                                    {if is_summary(item.kind) {
                                                        Either::Left(
                                                            view! {
                                                                <p class="experience-description">{item.bullets.join(" ")}</p>
                                                            },
                                                        )
                                                    } else {
                                                        Either::Right(
                                                            view! {
                                                                <p class="experience-type">{item.kind}</p>
                                                                <ul class="experience-bullets">
                                                                    {item
                                                                        .bullets
                                                                        .iter()
                                                                        .map(|b| view! { <li>{*b}</li> })
                                                                        .collect_view()}
                                                                </ul>
                                                            },
                                                        )
                                                    }}
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
    use super::{EXPERIENCES, GROUPS, is_summary};
    use crate::utils::quote_split::CLUSTER_SLABS;

    #[test]
    fn summary_entries_have_at_most_two_sentences() {
        for item in EXPERIENCES.iter().filter(|item| is_summary(item.kind)) {
            assert!(
                (1..=2).contains(&item.bullets.len()),
                "{} has {} sentences",
                item.title,
                item.bullets.len()
            );
        }
    }

    #[test]
    fn professional_entries_keep_their_bullets() {
        assert!(!is_summary("Work"));
        assert!(!is_summary("Internship"));
    }

    #[test]
    fn groups_fill_one_cluster() {
        assert_eq!(GROUPS.len(), CLUSTER_SLABS);
    }

    #[test]
    fn every_experience_lands_in_exactly_one_slab() {
        for item in EXPERIENCES {
            let slabs = GROUPS
                .iter()
                .filter(|group| group.kinds.contains(&item.kind))
                .count();
            assert_eq!(slabs, 1, "{} belongs to {slabs} slabs", item.title);
        }
    }
}
