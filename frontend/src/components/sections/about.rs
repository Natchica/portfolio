use leptos::prelude::*;

use crate::components::poneglyph_overlay::PoneglyphOverlay;
use crate::components::poneglyph_section::PoneglyphSection;
use crate::hooks::use_intersection_observer::{
    use_intersection_observer, IntersectionObserverOptions,
};

const PONEGLYPH_QUOTE: &str =
    "The root problem with conventional currency is all the trust that is required to make it work";
const QUOTE_AUTHOR: &str = "Satoshi Nakamoto";

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
                <PoneglyphOverlay author=QUOTE_AUTHOR quote=PONEGLYPH_QUOTE columns=15 />
                <div class="poneglyph-block text-center content-layer">
                    <div>
                        <div class="profile-image-wrapper">
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
                        <h1 class="section-header about-title">"Nathan GAUD"</h1>
                        <p class="subtitle">"Backend Web3 Software Engineer"</p>
                        <p class="section-subtitle">"Genesis Block - The Origin Story"</p>
                        <div class="description">
                            <p>
                                "Welcome to my digital Poneglyph. As a Backend Web3 Software \
                                 Engineer at iExec, I develop decentralized applications and \
                                 blockchain infrastructure that power the future of distributed \
                                 computing. My work focuses on building secure, scalable backend \
                                 systems using Rust and Java."
                            </p>
                            <p>
                                "What drives me in Web3 is the immutability and transparency of \
                                 blockchain technology - you can\u{2019}t lie with the blockchain. For \
                                 me, Web3 represents freedom and the power to build systems where \
                                 truth is verifiable and trust is built into the code itself."
                            </p>
                            <p class="highlight-text">
                                "\u{1f980} Rust & Java Developer \u{2022} \u{1f517} Blockchain Enthusiast \u{2022} \u{1f30a} Building the Decentralized Future"
                            </p>
                        </div>
                        <div class="cta-buttons">
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
