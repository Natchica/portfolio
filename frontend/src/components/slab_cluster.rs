//! A cluster is one section made of 3 independent poneglyph slabs that decode together: one tap on
//! any slab starts the wave on all 3, and their content reveals when the last grid finishes.
use leptos::prelude::*;

use crate::components::poneglyph_overlay::PoneglyphOverlay;
use crate::components::poneglyph_section::PoneglyphSection;
use crate::context::{AutoDecode, cluster_slab_shows};
use crate::hooks::use_intersection_observer::{
    IntersectionObserverOptions, use_intersection_observer,
};
use crate::utils::quote_split::{CLUSTER_SLABS, slab_inscription};

#[derive(Clone, Copy)]
struct ClusterCtx {
    start: RwSignal<Option<(f64, f64)>>,
    finished: RwSignal<usize>,
    decoded: Memo<bool>,
    title: &'static str,
    author: &'static str,
    quote: &'static str,
}

/// One section: 3 slabs in a grid. The title is the heading of the first slab.
#[component]
pub fn SlabCluster(
    id: &'static str,
    title: &'static str,
    author: &'static str,
    quote: &'static str,
    children: Children,
) -> impl IntoView {
    let finished = RwSignal::new(0usize);
    provide_context(ClusterCtx {
        start: RwSignal::new(None),
        finished,
        decoded: Memo::new(move |_| finished.get() >= CLUSTER_SLABS),
        title,
        author,
        quote,
    });
    view! {
        <PoneglyphSection id=id>
            <div class="slab-cluster">
                <div class="slab-cluster-grid">{children()}</div>
            </div>
        </PoneglyphSection>
    }
}

#[component]
pub fn ClusterSlab(index: usize, label: &'static str, children: Children) -> impl IntoView {
    let ctx = expect_context::<ClusterCtx>();
    let node_ref = NodeRef::<leptos::html::Div>::new();
    let is_visible = use_intersection_observer(
        node_ref,
        IntersectionObserverOptions {
            once: true,
            root_margin: "-10%",
            ..Default::default()
        },
    );
    let armed = expect_context::<AutoDecode>().armed;
    // After the first tap each slab follows its own state, the shared wave only covers the first decode.
    let slab_decoded = RwSignal::new(false);
    let shows = move || {
        let wave_running = ctx.start.get().is_some() && !ctx.decoded.get();
        cluster_slab_shows(
            armed.get(),
            wave_running,
            ctx.decoded.get(),
            slab_decoded.get(),
        )
    };
    let (author, quote) = slab_inscription(ctx.author, ctx.quote, index);
    let show_hint = index == 0;
    view! {
        <div class=format!("cluster-slab cluster-slab-{}", index + 1)>
            <div
                node_ref=node_ref
                class=move || {
                    if is_visible.get() {
                        "section-entrance-wrapper section-entrance visible"
                    } else {
                        "section-entrance-wrapper section-entrance"
                    }
                }
            >
                // Keep the overlay right before the block: `.poneglyph-overlay:has(+ .content-decoded)` releases clicks.
                <PoneglyphOverlay
                    author=author
                    quote=quote
                    columns=15
                    shared_start=ctx.start
                    show_hint=show_hint
                    on_decode_complete=Callback::new(move |_| {
                        slab_decoded.set(true);
                        ctx.finished.update(|n| *n += 1);
                    })
                    on_encode=Callback::new(move |_| slab_decoded.set(false))
                />
                <div class=move || if shows() {
                    "poneglyph-block content-layer content-decoded"
                } else {
                    "poneglyph-block content-layer"
                }>
                    {(index == 0).then(|| view! { <h2 class="section-header">{ctx.title}</h2> })}
                    <h3 class="project-group-title">{label}</h3>
                    {children()}
                </div>
            </div>
        </div>
    }
}
