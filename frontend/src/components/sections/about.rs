use leptos::prelude::*;

use crate::components::poneglyph_overlay::PoneglyphOverlay;
use crate::components::poneglyph_section::PoneglyphSection;
use crate::hooks::use_intersection_observer::{
    IntersectionObserverOptions, use_intersection_observer,
};

pub(super) const PONEGLYPH_QUOTE: &str =
    "Programs must be written for people to read and only incidentally for machines to execute";
pub(super) const QUOTE_AUTHOR: &str = "Abelson and Sussman";

#[component]
pub fn AboutSection(on_navigate: impl Fn(String) + Send + 'static + Clone) -> impl IntoView {
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

    let nav_skills = on_navigate.clone();
    let nav_contact = on_navigate.clone();

    view! {
        <PoneglyphSection id="about-inner">
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
                    "poneglyph-block text-center content-layer content-decoded"
                } else {
                    "poneglyph-block text-center content-layer"
                }>
                    <div>
                        <div class="profile-image-wrapper stagger-item" style="--item-index: 0;">
                            <img
                                src="Nathan-G.png"
                                alt="Nathan GAUD"
                                loading="eager"
                                decoding="async"
                                width="128"
                                height="128"
                                class="profile-image"
                            />
                        </div>
                        <h1 class="section-header about-title stagger-item" style="--item-index: 1;">"Nathan GAUD"</h1>
                        <p class="subtitle stagger-item" style="--item-index: 2;">"Backend Software Engineer"</p>
                        <p class="section-subtitle stagger-item" style="--item-index: 2;">"Java and Rust backends. Event-driven services, performance and reliable releases."</p>
                        <div class="description stagger-item" style="--item-index: 3;">
                            <p>
                                "Welcome to my digital Poneglyph. I am a backend software engineer \
                                 who builds and optimizes services in Java and Rust. At iExec, from \
                                 2024 to 2026, I led three event-driven Rust services, rewrote two \
                                 middleware components from Java to Rust for a 75% gain in core \
                                 performance, and led iexec-stork, a Java and Spring tool that \
                                 migrates secrets between service instances."
                            </p>
                            <p>
                                "I am open to any field where solid backend engineering matters. \
                                 I care about readable code, thorough tests and releases that \
                                 ship without drama. I work in French (native), English (C2) and \
                                 German (B1)."
                            </p>
                            <p class="highlight-text">
                                "\u{1f980} Rust Services \u{2022} \u{2615} Java and Spring \u{2022} \u{26a1} Event-Driven Systems"
                            </p>
                        </div>
                        <div class="cta-buttons stagger-item" style="--item-index: 4;">
                            <button
                                class="btn-primary"
                                on:click=move |_| nav_skills("skills".to_string())
                            >
                                "Explore Poneglyphs"
                            </button>
                            <button
                                class="btn-outline"
                                on:click=move |_| nav_contact("contact".to_string())
                            >
                                "Connect Blocks"
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PoneglyphSection>
    }
}
