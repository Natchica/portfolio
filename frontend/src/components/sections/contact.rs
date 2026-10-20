use leptos::prelude::*;

use crate::components::poneglyph_overlay::PoneglyphOverlay;
use crate::components::poneglyph_section::PoneglyphSection;
use crate::hooks::use_intersection_observer::{
    IntersectionObserverOptions, use_intersection_observer,
};

pub(super) const PONEGLYPH_QUOTE: &str =
    "If there is a problem there is a solution If there is no solution there is no problem";
pub(super) const QUOTE_AUTHOR: &str = "Bob Marley";

#[component]
pub fn ContactSection(on_navigate: impl Fn(String) + Send + 'static + Clone) -> impl IntoView {
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

    let nav_about = on_navigate.clone();

    view! {
        <PoneglyphSection id="contact-inner" show_connection_line=false>
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
                    <h2 class="section-header">"Final Poneglyph"</h2>
                    <div class="contact-grid">
                        <div class="contact-info-panel stagger-item" style="--item-index: 0;">
                            <div>
                                <h3 class="contact-subtitle">"Connect With Me"</h3>
                                <div class="contact-info-list">
                                    <div class="contact-info-item">
                                        <span class="contact-info-icon">"\u{1f4cd}"</span>
                                        <div>
                                            <p class="contact-info-label">"Location"</p>
                                            <p class="contact-info-value">"France"</p>
                                        </div>
                                    </div>
                                    <div class="contact-info-item">
                                        <span class="contact-info-icon">"\u{1f4bc}"</span>
                                        <div>
                                            <p class="contact-info-label">"Status"</p>
                                            <p class="contact-info-value">"Available now"</p>
                                        </div>
                                    </div>
                                    <div class="contact-info-item">
                                        <span class="contact-info-icon">"\u{1f5e3}\u{fe0f}"</span>
                                        <div>
                                            <p class="contact-info-label">"Languages"</p>
                                            <p class="contact-info-value">"French (native), English (C2), German (B1)"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="contact-info-panel stagger-item" style="--item-index: 1;">
                            <div>
                                <h4 class="contact-social-title">"Social Links"</h4>
                                <div class="social-grid">
                                    <a
                                        class="social-link"
                                        href="https://github.com/Natchica"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span class="social-icon" aria-hidden="true">"\u{1f4bb}"</span>
                                        <span class="social-name">"GitHub"</span>
                                    </a>
                                    <a
                                        class="social-link"
                                        href="https://www.linkedin.com/in/nathan-gaud"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span class="social-icon" aria-hidden="true">"\u{1f517}"</span>
                                        <span class="social-name">"LinkedIn"</span>
                                    </a>
                                </div>
                            </div>
                            <div class="cv-download-wrapper">
                                <a
                                    class="btn-primary btn-full btn-cv"
                                    href="https://www.linkedin.com/in/nathan-gaud"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    "View CV on LinkedIn"
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="loop-back-section stagger-item" style="--item-index: 2;">
                        <p class="loop-back-text">"The voyage continues..."</p>
                        <button
                            class="btn-outline btn-genesis"
                            on:click=move |_| nav_about("about".to_string())
                        >
                            "\u{2693} Return to the First Poneglyph"
                        </button>
                    </div>
                </div>
            </div>
        </PoneglyphSection>
    }
}
