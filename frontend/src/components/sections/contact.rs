use leptos::prelude::*;

use crate::components::poneglyph_overlay::PoneglyphOverlay;
use crate::components::poneglyph_section::PoneglyphSection;
use crate::hooks::use_intersection_observer::{
    IntersectionObserverOptions, use_intersection_observer,
};

const PONEGLYPH_QUOTE: &str =
    "If there is a problem there is a solution If there is no solution there is no problem";
const QUOTE_AUTHOR: &str = "Bob Marley";

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
                <PoneglyphOverlay author=QUOTE_AUTHOR quote=PONEGLYPH_QUOTE columns=15 />
                <div class="poneglyph-block content-layer">
                    <h2 class="section-header">"Final Poneglyph"</h2>
                    <div class="contact-grid">
                        // Contact Form
                        <div>
                            <h3 class="contact-subtitle">"Send a Message"</h3>
                            <form class="contact-form">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        class="form-input"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Your Email"
                                        class="form-input"
                                    />
                                </div>
                                <div>
                                    <textarea
                                        rows="5"
                                        placeholder="Your Message"
                                        class="form-textarea"
                                    />
                                </div>
                                <button type="submit" class="btn-primary btn-full">
                                    "Send Message"
                                </button>
                            </form>
                        </div>
                        // Contact Info
                        <div class="contact-info-panel">
                            <div>
                                <h3 class="contact-subtitle">"Connect With Me"</h3>
                                <div class="contact-info-list">
                                    <div class="contact-info-item">
                                        <span class="contact-info-icon">"\u{1f4e7}"</span>
                                        <div>
                                            <p class="contact-info-label">"Email"</p>
                                            <p class="contact-info-value">"Contact via form below"</p>
                                        </div>
                                    </div>
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
                                            <p class="contact-info-value">
                                                "Currently Employed - Open to Opportunities"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 class="contact-social-title">"Social Links"</h4>
                                <div class="social-grid">
                                    <button class="social-link">
                                        <span class="social-icon">"\u{1f4bb}"</span>
                                        <span class="social-name">"GitHub"</span>
                                    </button>
                                    <button class="social-link">
                                        <span class="social-icon">"\u{1f4bc}"</span>
                                        <span class="social-name">"LinkedIn"</span>
                                    </button>
                                    <button class="social-link">
                                        <span class="social-icon">"\u{1f426}"</span>
                                        <span class="social-name">"Twitter"</span>
                                    </button>
                                    <button class="social-link">
                                        <span class="social-icon">"\u{1f4e7}"</span>
                                        <span class="social-name">"Email"</span>
                                    </button>
                                </div>
                            </div>
                            <div class="cv-download-wrapper">
                                <button class="btn-primary btn-full btn-cv">
                                    "\u{1f4c4} Download CV"
                                </button>
                            </div>
                        </div>
                    </div>
                    // Loop back
                    <div class="loop-back-section">
                        <p class="loop-back-text">"The blockchain continues..."</p>
                        <button
                            class="btn-outline btn-genesis"
                            on:click=move |_| nav_about("about".to_string())
                        >
                            "\u{2693} Return to Genesis Block"
                        </button>
                    </div>
                </div>
            </div>
        </PoneglyphSection>
    }
}
