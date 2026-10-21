use leptos::prelude::*;

use crate::components::poneglyph_overlay::PoneglyphOverlay;
use crate::components::poneglyph_section::PoneglyphSection;
use crate::context::{ContactDecodeRequest, contact_decode_requested};
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

    // "Get in Touch" asks the stone to decode itself once the smooth scroll has brought it
    // into the middle of the viewport, so the visitor sees the glyphs flip and needs no tap.
    let request = expect_context::<ContactDecodeRequest>();
    let shared_start: RwSignal<Option<(f64, f64)>> = RwSignal::new(None);
    let in_middle = use_intersection_observer(
        node_ref,
        IntersectionObserverOptions {
            threshold: 0.0,
            root_margin: "-30% 0px -30% 0px",
            once: false,
        },
    );
    Effect::new(move |_| {
        if !in_middle.get() {
            return;
        }
        let Some(requested_at) = request.requested_at.get() else {
            return;
        };
        request.requested_at.set(None);
        if !contact_decode_requested(Some(requested_at), js_sys::Date::now())
            || decoded.get_untracked()
            || shared_start.get_untracked().is_some()
        {
            return;
        }
        let Some(el) = node_ref.get_untracked() else {
            return;
        };
        let rect = el.get_bounding_client_rect();
        let (scroll_x, scroll_y) = web_sys::window()
            .map(|w| (w.scroll_x().unwrap_or(0.0), w.scroll_y().unwrap_or(0.0)))
            .unwrap_or((0.0, 0.0));
        shared_start.set(Some((
            rect.left() + rect.width() / 2.0 + scroll_x,
            rect.top() + rect.height() / 2.0 + scroll_y,
        )));
    });

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
                    shared_start=shared_start
                    on_decode_complete=Callback::new(move |_| set_decoded.set(true))
                    on_encode=Callback::new(move |_| set_decoded.set(false))
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
                                            <ul class="language-list">
                                                <li>
                                                    <span class="language-flag" aria-hidden="true">"\u{1f1eb}\u{1f1f7}"</span>
                                                    "French (native)"
                                                </li>
                                                <li>
                                                    <span class="language-flag" aria-hidden="true">"\u{1f1ec}\u{1f1e7}"</span>
                                                    "English (C2)"
                                                </li>
                                                <li>
                                                    <span class="language-flag" aria-hidden="true">"\u{1f1e9}\u{1f1ea}"</span>
                                                    "German (B1)"
                                                </li>
                                            </ul>
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
