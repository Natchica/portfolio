use leptos::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen::prelude::*;

const GLYPHS: &[&str] = &[
    "symbols/svg/letters/a.svg",
    "symbols/svg/letters/bv.svg",
    "symbols/svg/letters/d.svg",
    "symbols/svg/letters/e.svg",
    "symbols/svg/letters/f.svg",
    "symbols/svg/letters/g.svg",
    "symbols/svg/letters/kqc.svg",
    "symbols/svg/letters/m.svg",
    "symbols/svg/letters/n.svg",
    "symbols/svg/letters/o.svg",
    "symbols/svg/letters/r.svg",
    "symbols/svg/letters/t.svg",
    "symbols/svg/letters/x.svg",
];

const NODES_PER_STRAND: usize = 24;

fn random_glyph() -> &'static str {
    GLYPHS[fastrand::usize(..GLYPHS.len())]
}

struct HelixNode {
    glyph: &'static str,
    y_pct: f64,
    base_angle: f64,
    amplitude: f64,
    taper: f64,
    index: usize,
    strand: usize,
}

fn generate_helix_nodes(fade: bool) -> Vec<HelixNode> {
    let mut nodes = Vec::with_capacity(NODES_PER_STRAND * 2);
    let amplitudes = [80.0, 68.0];
    let phases = [0.0, 200.0];

    for strand in 0..2 {
        for i in 0..NODES_PER_STRAND {
            let t_raw = i as f64 / (NODES_PER_STRAND - 1) as f64;
            let t = if fade { t_raw.powf(1.5) } else { t_raw };
            let base_angle = t * 720.0 + phases[strand];
            let taper = (t * std::f64::consts::PI).sin();
            nodes.push(HelixNode {
                glyph: random_glyph(),
                y_pct: t * 100.0,
                base_angle,
                amplitude: amplitudes[strand],
                taper,
                index: i + strand * NODES_PER_STRAND,
                strand,
            });
        }
    }
    nodes
}

/// Apply magnetic repulsion: each node within `radius` px of cursor
/// gets pushed radially outward with quadratic falloff.
fn apply_repulsion(container: &web_sys::Element, mx: f64, my: f64) {
    let radius: f64 = 350.0;
    let max_force: f64 = 200.0;

    let Ok(nodes) = container.query_selector_all(".helix-node") else {
        return;
    };
    for i in 0..nodes.length() {
        let Some(node) = nodes.item(i) else { continue };
        let elem: &web_sys::Element = node.unchecked_ref();
        let nr = elem.get_bounding_client_rect();
        let nx = nr.left() + nr.width() / 2.0;
        let ny = nr.top() + nr.height() / 2.0;
        let dx = nx - mx;
        let dy = ny - my;
        let dist = (dx * dx + dy * dy).sqrt();

        let html_node: &web_sys::HtmlElement = node.unchecked_ref();
        if dist < radius && dist > 1.0 {
            let t = 1.0 - dist / radius;
            let force = t * t * max_force;
            let rx = dx / dist * force;
            let ry = dy / dist * force;
            let _ = html_node
                .style()
                .set_property("--repel-x", &format!("{rx:.1}px"));
            let _ = html_node
                .style()
                .set_property("--repel-y", &format!("{ry:.1}px"));
        } else {
            let _ = html_node.style().set_property("--repel-x", "0px");
            let _ = html_node.style().set_property("--repel-y", "0px");
        }
    }
}

/// Reset all node repulsion vars to 0 (CSS transition handles spring-back).
fn clear_repulsion(container: &web_sys::Element) {
    let Ok(nodes) = container.query_selector_all(".helix-node") else {
        return;
    };
    for i in 0..nodes.length() {
        let Some(node) = nodes.item(i) else { continue };
        let html_node: &web_sys::HtmlElement = node.unchecked_ref();
        let _ = html_node.style().set_property("--repel-x", "0px");
        let _ = html_node.style().set_property("--repel-y", "0px");
    }
}

#[component]
pub fn TransitionSection(
    #[prop(optional)] id: Option<&'static str>,
    #[prop(optional)] chain: Option<bool>,
    #[prop(optional)] fade: Option<bool>,
) -> impl IntoView {
    let is_chain = chain.unwrap_or(false);

    if is_chain {
        let node_ref = NodeRef::<leptos::html::Div>::new();
        let is_fade = fade.unwrap_or(false);
        let nodes = generate_helix_nodes(is_fade);

        // Magnetic repulsion on mousemove, spring-back on mouseleave
        Effect::new(move |_| {
            let Some(el) = node_ref.get() else { return };
            let target: &web_sys::EventTarget = &el;

            // Mousemove: compute per-node repulsion, disable transition for instant tracking
            let move_closure =
                Closure::<dyn Fn(web_sys::MouseEvent)>::new(move |ev: web_sys::MouseEvent| {
                    let Some(el) = node_ref.get() else { return };
                    let _ = el.class_list().add_1("repelling");
                    let elem: &web_sys::Element = &el;
                    apply_repulsion(elem, ev.client_x() as f64, ev.client_y() as f64);
                });

            // Mouseleave: re-enable transition, reset repulsion (spring-back)
            let leave_closure = Closure::<dyn Fn()>::new(move || {
                let Some(el) = node_ref.get() else { return };
                let _ = el.class_list().remove_1("repelling");
                let elem: &web_sys::Element = &el;
                clear_repulsion(elem);
            });

            let _ = target.add_event_listener_with_callback(
                "mousemove",
                move_closure.as_ref().unchecked_ref(),
            );
            let _ = target.add_event_listener_with_callback(
                "mouseleave",
                leave_closure.as_ref().unchecked_ref(),
            );
            move_closure.forget();
            leave_closure.forget();
        });

        let node_views: Vec<_> = nodes
            .iter()
            .map(|n| {
                let style = format!(
                    "top: {y}%; --base-angle: {angle:.1}deg; --strand-amp: {amp:.0}; --taper: {taper:.3}; --node-i: {i}; --node-y: {ny:.3};",
                    y = n.y_pct,
                    angle = n.base_angle,
                    amp = n.amplitude,
                    taper = n.taper,
                    i = n.index,
                    ny = n.y_pct / 100.0,
                );
                let glyph = n.glyph;
                let class = if n.strand == 0 { "helix-node strand-a" } else { "helix-node strand-b" };
                view! {
                    <div
                        class={class}
                        style={style}
                    >
                        <img
                            src={glyph}
                            alt=""
                            width="28"
                            height="28"
                            class="helix-glyph"
                        />
                    </div>
                }
            })
            .collect();

        leptos::either::Either::Left(view! {
            <div
                node_ref=node_ref
                id={id.unwrap_or_default()}
                class=move || {
                    let mut cls = String::from("transition-section transition-chain");
                    if is_fade { cls.push_str(" transition-chain-fade"); }
                    cls
                }
            >
                <div class="helix-container">
                    {node_views}
                </div>
            </div>
        })
    } else {
        leptos::either::Either::Right(view! {
            <section
                id={id.unwrap_or_default()}
                class="transition-section"
                style="height: 100vh; min-height: 100vh;"
            >
                <div class="transition-inner">
                    <div class="transition-line" />
                </div>
            </section>
        })
    }
}
