use std::cell::{Cell, RefCell};
use std::rc::Rc;

use leptos::either::Either;
use leptos::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen::closure::Closure;

use crate::components::sections::alphabet::PoneglyphAlphabetSection;
use crate::context::EasterEggState;

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

// Bouncing easter egg trigger with RAF-driven physics
#[component]
fn EasterEggTrigger(unlocked: RwSignal<bool>) -> impl IntoView {
    let pos_x = RwSignal::new(50.0_f64 + fastrand::f64() * 300.0);
    let pos_y = RwSignal::new(50.0_f64 + fastrand::f64() * 200.0);

    let stopped = RwSignal::new(false);
    on_cleanup(move || stopped.set(true));

    let init_speed = 0.6 + fastrand::f64() * 1.2;
    let init_angle = fastrand::f64() * std::f64::consts::TAU;
    let vx = Rc::new(Cell::new(init_angle.cos() * init_speed));
    let vy = Rc::new(Cell::new(init_angle.sin() * init_speed));
    let frames_to_change: Rc<Cell<u32>> = Rc::new(Cell::new(fastrand::u32(60..240)));

    type RafClosure = Rc<RefCell<Option<Closure<dyn FnMut()>>>>;
    let f: RafClosure = Rc::new(RefCell::new(None));
    let f_inner = f.clone();
    let f_sched = f.clone();

    {
        let vx = vx.clone();
        let vy = vy.clone();
        let frames_to_change = frames_to_change.clone();

        *f.borrow_mut() = Some(Closure::new(move || {
            if stopped.get_untracked() || unlocked.get_untracked() {
                return;
            }

            let window = match web_sys::window() {
                Some(w) => w,
                None => return,
            };
            let w = (window
                .inner_width()
                .ok()
                .and_then(|v| v.as_f64())
                .unwrap_or(1280.0)
                - 48.0)
                .max(0.0);
            let h = (window
                .inner_height()
                .ok()
                .and_then(|v| v.as_f64())
                .unwrap_or(768.0)
                - 50.0)
                .max(0.0);

            let x = pos_x.get_untracked();
            let y = pos_y.get_untracked();
            let mut cur_vx = vx.get();
            let mut cur_vy = vy.get();

            let mut new_x = x + cur_vx;
            let mut new_y = y + cur_vy;

            if new_x <= 0.0 {
                new_x = 0.0;
                cur_vx = cur_vx.abs();
            } else if new_x >= w {
                new_x = w;
                cur_vx = -cur_vx.abs();
            }
            if new_y <= 0.0 {
                new_y = 0.0;
                cur_vy = cur_vy.abs();
            } else if new_y >= h {
                new_y = h;
                cur_vy = -cur_vy.abs();
            }

            let ftc = frames_to_change.get();
            if ftc == 0 {
                let new_speed = 0.15 + fastrand::f64() * 2.8;
                let cur_angle = cur_vy.atan2(cur_vx);
                let twist = (fastrand::f64() - 0.5) * std::f64::consts::PI * 1.5;
                let new_angle = cur_angle + twist;
                cur_vx = new_angle.cos() * new_speed;
                cur_vy = new_angle.sin() * new_speed;
                frames_to_change.set(fastrand::u32(30..300));
            } else {
                frames_to_change.set(ftc - 1);
            }

            vx.set(cur_vx);
            vy.set(cur_vy);
            pos_x.set(new_x);
            pos_y.set(new_y);

            let _ = window.request_animation_frame(
                f_inner.borrow().as_ref().unwrap().as_ref().unchecked_ref(),
            );
        }));
    }

    if let Some(window) = web_sys::window() {
        let _ = window
            .request_animation_frame(f_sched.borrow().as_ref().unwrap().as_ref().unchecked_ref());
    }
    std::mem::forget(f_sched);

    view! {
        <button
            class="easter-egg-trigger"
            type="button"
            aria-label="???"
            style=move || format!("left: {}px; top: {}px;", pos_x.get() as i32, pos_y.get() as i32)
            on:click=move |_| unlocked.set(true)
        >
            <img src="symbols/ng-logo.svg" alt="" width="46" height="48" />
        </button>
    }
}

#[component]
pub fn TransitionSection(
    #[prop(optional)] id: Option<&'static str>,
    #[prop(optional)] chain: Option<bool>,
    #[prop(optional)] fade: Option<bool>,
    #[prop(optional)] easter_egg: Option<bool>,
) -> impl IntoView {
    let is_chain = chain.unwrap_or(false);

    if is_chain {
        let is_fade = fade.unwrap_or(false);
        let nodes = generate_helix_nodes(is_fade);

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
        let is_easter_egg = easter_egg.unwrap_or(false);
        let maybe_state = if is_easter_egg {
            use_context::<EasterEggState>()
        } else {
            None
        };

        leptos::either::Either::Right(if let Some(state) = maybe_state {
            let unlocked = state.alphabet_unlocked;
            (move || {
                if unlocked.get() {
                    Either::Left(view! {
                        <div id={id.unwrap_or_default()}>
                            <PoneglyphAlphabetSection />
                        </div>
                    })
                } else {
                    Either::Right(view! {
                        <section
                            id={id.unwrap_or_default()}
                            class="transition-section"
                            style="height: 100vh; min-height: 100vh;"
                        >
                            <div class="easter-egg-container">
                                <EasterEggTrigger unlocked=unlocked />
                            </div>
                        </section>
                    })
                }
            })
            .into_any()
        } else {
            view! {
                <section
                    id={id.unwrap_or_default()}
                    class="transition-section"
                    style="height: 100vh; min-height: 100vh;"
                >
                    <div class="transition-inner">
                        <div class="transition-line" />
                    </div>
                </section>
            }
            .into_any()
        })
    }
}
