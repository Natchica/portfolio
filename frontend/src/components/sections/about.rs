use leptos::prelude::*;

use crate::components::poneglyph_overlay::PoneglyphOverlay;
use crate::components::poneglyph_section::PoneglyphSection;
use crate::context::ContactDecodeRequest;
use crate::hooks::use_intersection_observer::{
    IntersectionObserverOptions, use_intersection_observer,
};

pub(super) const PONEGLYPH_QUOTE: &str =
    "Inherited will the destiny of the age the dreams of the people these things cannot be stopped";
pub(super) const QUOTE_AUTHOR: &str = "Gol D Roger";

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
    let contact_request = expect_context::<ContactDecodeRequest>();

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
                    on_encode=Callback::new(move |_| set_decoded.set(false))
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
                        <p class="section-subtitle stagger-item" style="--item-index: 2;">"Software engineer specialized in building and optimizing backend systems in Rust and Java."</p>
                        <div class="description stagger-item" style="--item-index: 3;">
                            <p>
                                "Welcome to my digital Poneglyph. I am a backend software engineer \
                                 who builds and optimizes services in Java and Rust. I care about \
                                 readable code, thorough tests and releases that ship without \
                                 drama, and I am open to any field where solid backend \
                                 engineering matters."
                            </p>
                            <p>
                                "On my own time I use AI assistants to shape my development \
                                 environment: with Claude Code I built hooks, guards and small \
                                 automations that make my daily work smoother. It is a personal \
                                 workbench, not how I ship production code. Off screen I play \
                                 competitive badminton, train for ultra trails and travel."
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
                                on:click=move |_| {
                                    contact_request.requested_at.set(Some(js_sys::Date::now()));
                                    nav_contact("contact".to_string());
                                }
                            >
                                "Get in Touch"
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PoneglyphSection>
    }
}
