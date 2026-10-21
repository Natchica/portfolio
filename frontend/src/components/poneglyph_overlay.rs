use leptos::portal::Portal;
use leptos::prelude::*;
use wasm_bindgen::prelude::*;

use crate::context::{AutoDecode, AutoMode, auto_mode, hint_visible};
use crate::hooks::use_intersection_observer::{
    IntersectionObserverOptions, use_intersection_observer,
};
use crate::utils::poneglyph_converter::text_to_centered_symbol_grid;

/// How long a visitor looks at an encoded slab before the decode hint appears.
const HINT_DELAY_MS: i32 = 15_000;

fn run_after_ms(millis: i32, f: impl Fn() + 'static) {
    let closure = Closure::<dyn Fn()>::new(f);
    let window = web_sys::window().expect("no window");
    let _ = window.set_timeout_with_callback_and_timeout_and_arguments_0(
        closure.as_ref().unchecked_ref(),
        millis,
    );
    closure.forget();
}

fn schedule_callback(duration_secs: f64, cb: Callback<()>) {
    let millis = ((duration_secs * 0.7) * 1000.0) as i32;
    run_after_ms(millis, move || cb.run(()));
}

fn max_corner_distance(click_col: f64, click_row: f64, cols: f64, rows: f64) -> f64 {
    let corners = [(0.0, 0.0), (cols, 0.0), (0.0, rows), (cols, rows)];
    corners
        .iter()
        .map(|(cx, cy)| {
            let dx = click_col - cx;
            let dy = click_row - cy;
            (dx * dx + dy * dy).sqrt()
        })
        .fold(0.0_f64, f64::max)
}

fn prefers_reduced_motion() -> bool {
    web_sys::window()
        .and_then(|w| {
            w.match_media("(prefers-reduced-motion: reduce)")
                .ok()
                .flatten()
        })
        .is_some_and(|m| m.matches())
}

/// Phones and reduced-motion users get a decode twice as fast.
fn decode_speed() -> f64 {
    let Some(window) = web_sys::window() else {
        return 1.0;
    };
    let narrow = window
        .inner_width()
        .ok()
        .and_then(|w| w.as_f64())
        .is_some_and(|w| w < 768.0);
    if narrow || prefers_reduced_motion() {
        0.5
    } else {
        1.0
    }
}

fn page_scroll() -> (f64, f64) {
    web_sys::window()
        .map(|w| (w.scroll_x().unwrap_or(0.0), w.scroll_y().unwrap_or(0.0)))
        .unwrap_or((0.0, 0.0))
}

#[component]
pub fn PoneglyphOverlay(
    author: &'static str,
    quote: &'static str,
    #[prop(default = 15)] columns: usize,
    #[prop(optional)] on_decode_complete: Option<Callback<()>>,
    /// Cluster mode: the tap shared by the slabs of one cluster, in page coordinates.
    #[prop(optional)]
    shared_start: Option<RwSignal<Option<(f64, f64)>>>,
    /// Only the first slab of a cluster shows the decode hint.
    #[prop(default = true)]
    show_hint: bool,
) -> impl IntoView {
    let webgl = crate::utils::render::webgl();
    let armed = expect_context::<AutoDecode>().armed;
    let (has_started, set_has_started) = signal(false);
    let (container_width, set_container_width) = signal(0u32);
    let (container_height, set_container_height) = signal(0u32);
    let click_coords: RwSignal<Option<(f64, f64)>> = RwSignal::new(None);
    let decode_duration: RwSignal<f64> = RwSignal::new(0.0);
    let decode_speed_factor: RwSignal<f64> = RwSignal::new(1.0);
    let container_ref = NodeRef::<leptos::html::Div>::new();

    // ResizeObserver to track container size
    Effect::new(move |_| {
        let Some(el) = container_ref.get() else {
            return;
        };

        set_container_width.set(el.client_width() as u32);
        set_container_height.set(el.client_height() as u32);

        let closure = Closure::<dyn Fn(js_sys::Array)>::new(move |_entries: js_sys::Array| {
            if let Some(el) = container_ref.get() {
                set_container_width.set(el.client_width() as u32);
                set_container_height.set(el.client_height() as u32);
            }
        });

        let observer = web_sys::ResizeObserver::new(closure.as_ref().unchecked_ref())
            .expect("Failed to create ResizeObserver");
        let html_el: &web_sys::Element = &el;
        observer.observe(html_el);

        closure.forget();
    });

    let responsive_columns = Memo::new(move |_| {
        let cw = container_width.get();
        if cw > 0 {
            (cw / 32).max(1) as usize
        } else {
            columns
        }
    });

    let symbol_grid = Memo::new(move |_| {
        let ch = container_height.get();
        let calculated_rows = if ch > 0 {
            (ch / 32).max(1) as usize
        } else {
            50
        };
        text_to_centered_symbol_grid(author, quote, responsive_columns.get(), calculated_rows)
    });

    // The hint stays hidden until the slab has been in the middle band of the
    // viewport for HINT_DELAY_MS, so a visitor can discover the gate first.
    let (hint_ready, set_hint_ready) = signal(false);
    let (hint_armed, set_hint_armed) = signal(false);
    let in_view = use_intersection_observer(
        container_ref,
        IntersectionObserverOptions {
            threshold: 0.0,
            root_margin: "-30% 0px -30% 0px",
            once: false,
        },
    );
    Effect::new(move |_| {
        if show_hint && in_view.get() && !hint_armed.get_untracked() {
            set_hint_armed.set(true);
            run_after_ms(HINT_DELAY_MS, move || set_hint_ready.set(true));
        }
    });

    let start_decode = move |x: f64, y: f64| {
        if has_started.get_untracked() {
            return;
        }
        let speed = decode_speed();
        let cols = responsive_columns.get_untracked() as f64;
        let rows = symbol_grid.get_untracked().len() as f64;
        let max_dist = max_corner_distance(x / 32.0, y / 32.0, cols, rows);
        let dur = (max_dist * 0.04 + 0.6) * speed;
        decode_speed_factor.set(speed);
        decode_duration.set(dur);
        click_coords.set(Some((x, y)));
        set_has_started.set(true);
        if let Some(cb) = on_decode_complete {
            schedule_callback(dur, cb);
        }
    };

    if let Some(start) = shared_start {
        // Every slab of the cluster decodes from the same page point, translated into its own grid.
        Effect::new(move |_| {
            let Some((page_x, page_y)) = start.get() else {
                return;
            };
            let Some(el) = container_ref.get_untracked() else {
                return;
            };
            let rect = el.get_bounding_client_rect();
            let (sx, sy) = page_scroll();
            start_decode(page_x - sx - rect.left(), page_y - sy - rect.top());
        });
    }

    // Once armed, the WebGL window needs every slab decoded so `scene.js` can re-encode the glyphs
    // outside the viewport. A slab the visitor did not tap starts from its own center. A slab of a
    // tapped cluster is started by the shared tap above, so it is left alone here.
    Effect::new(move |_| {
        if auto_mode(webgl, prefers_reduced_motion(), armed.get()) != AutoMode::Window {
            return;
        }
        let cluster_tapped = shared_start.is_some_and(|s| s.get_untracked().is_some());
        if has_started.get_untracked() || cluster_tapped {
            return;
        }
        start_decode(
            container_width.get_untracked() as f64 / 2.0,
            container_height.get_untracked() as f64 / 2.0,
        );
    });

    view! {
        <button
            type="button"
            class=move || if has_started.get() {
                "poneglyph-overlay poneglyph-overlay-btn decoding"
            } else {
                "poneglyph-overlay poneglyph-overlay-btn"
            }
            aria-label="Decode the poneglyph"
            style=move || {
                let dur = decode_duration.get();
                if dur > 0.0 {
                    format!(
                        "--decode-total: {dur:.2}s; --decode-speed: {};",
                        decode_speed_factor.get(),
                    )
                } else {
                    String::new()
                }
            }
            on:click=move |ev| {
                // Pointer and touch decode from the tap point. A keyboard-synthesised
                // click reports (0, 0), so it decodes from the center instead.
                let mouse_ev: &web_sys::MouseEvent = ev.as_ref();
                let from_center = mouse_ev.client_x() == 0 && mouse_ev.client_y() == 0;
                let origin = container_ref.get_untracked().map(|el| {
                    let rect = el.get_bounding_client_rect();
                    if from_center {
                        (rect.width() / 2.0, rect.height() / 2.0)
                    } else {
                        (
                            mouse_ev.client_x() as f64 - rect.left(),
                            mouse_ev.client_y() as f64 - rect.top(),
                        )
                    }
                });
                if let Some((x, y)) = origin {
                    match shared_start {
                        None => start_decode(x, y),
                        Some(start) => {
                            if start.get_untracked().is_none()
                                && let Some(el) = container_ref.get_untracked()
                            {
                                let rect = el.get_bounding_client_rect();
                                let (sx, sy) = page_scroll();
                                start.set(Some((rect.left() + x + sx, rect.top() + y + sy)));
                            }
                        }
                    }
                }
                armed.set(true);
            }
            on:keydown=move |ev| {
                let key = ev.key();
                if key == "Enter" || key == " " {
                    ev.prevent_default();
                    let (x, y) = (
                        container_width.get_untracked() as f64 / 2.0,
                        container_height.get_untracked() as f64 / 2.0,
                    );
                    match shared_start {
                        None => start_decode(x, y),
                        Some(start) => {
                            if start.get_untracked().is_none()
                                && let Some(el) = container_ref.get_untracked()
                            {
                                let rect = el.get_bounding_client_rect();
                                let (sx, sy) = page_scroll();
                                start.set(Some((rect.left() + x + sx, rect.top() + y + sy)));
                            }
                        }
                    }
                    armed.set(true);
                }
            }
        >
            {move || {
                // The popup lives in the body, fixed to the viewport, so it is visible wherever
                // the slab sits on a tall page. It shows only while this slab is in view.
                hint_visible(show_hint, hint_ready.get(), in_view.get(), has_started.get(), armed.get())
                    .then(|| {
                        view! {
                            <Portal>
                                <div class="poneglyph-hint" aria-hidden="true">
                                    <span class="poneglyph-hint-pointer">"Click the stone to decode it"</span>
                                    <span class="poneglyph-hint-touch">"Tap the stone to decode it"</span>
                                </div>
                            </Portal>
                        }
                    })
            }}
            <div
                node_ref=container_ref
                class="poneglyph-grid poneglyph-grid-full"
                style=move || {
                    format!(
                        "grid-template-columns: repeat({}, minmax(0, 1fr));",
                        responsive_columns.get(),
                    )
                }
                data-grid=move || webgl.then(|| encode_grid(&symbol_grid.get()))
                data-cols=move || webgl.then(|| responsive_columns.get().to_string())
                data-origin=move || {
                    if webgl {
                        click_coords.get().map(|(x, y)| format!("{x:.1},{y:.1}"))
                    } else {
                        None
                    }
                }
            >
                {move || (!webgl).then(|| {
                    let grid = symbol_grid.get();
                    let started = has_started.get();
                    let coords = click_coords.get_untracked();
                    let cols = responsive_columns.get_untracked();
                    let total_rows = grid.len();
                    grid.iter()
                        .enumerate()
                        .flat_map(|(line_index, line)| {
                            line.iter()
                                .enumerate()
                                .map(move |(col_index, symbol_path)| {
                                    let cell_class = if started {
                                        "poneglyph-symbol-cell animating"
                                    } else {
                                        "poneglyph-symbol-cell"
                                    };
                                    let delay = if started {
                                        if let Some((cx, cy)) = coords {
                                            let cell_size = 32.0;
                                            let click_col = cx / cell_size;
                                            let click_row = cy / cell_size;
                                            let dx = col_index as f64 - click_col;
                                            let dy = line_index as f64 - click_row;
                                            (dx * dx + dy * dy).sqrt()
                                        } else {
                                            // Fallback: center origin
                                            let center_col = cols as f64 / 2.0;
                                            let center_row = total_rows as f64 / 2.0;
                                            let dx = col_index as f64 - center_col;
                                            let dy = line_index as f64 - center_row;
                                            (dx * dx + dy * dy).sqrt()
                                        }
                                    } else {
                                        0.0
                                    };
                                    let style =
                                        format!("--decode-delay: {delay:.1};");
                                    let path = *symbol_path;
                                    view! {
                                        <div class={cell_class} style={style}>
                                            {path.map(|p| view! {
                                                            <img
                                                                src={p}
                                                                alt=""

                                                                width="32"
                                                                height="32"
                                                                class="poneglyph-cell-img"
                                                            />
                                                        })}
                                        </div>
                                    }
                                })
                                .collect::<Vec<_>>()
                        })
                        .collect_view()
                })}
            </div>
        </button>
    }
}

/// Serialises the glyph grid for the WebGL layer: file stems, `,` between cells, `;` between rows.
fn encode_grid(grid: &[Vec<Option<&str>>]) -> String {
    grid.iter()
        .map(|row| {
            row.iter()
                .map(|cell| {
                    cell.map(|path| {
                        path.rsplit('/')
                            .next()
                            .and_then(|file| file.strip_suffix(".svg"))
                            .unwrap_or("")
                    })
                    .unwrap_or("")
                })
                .collect::<Vec<_>>()
                .join(",")
        })
        .collect::<Vec<_>>()
        .join(";")
}

#[cfg(test)]
mod tests {
    use super::encode_grid;

    #[test]
    fn encode_grid_joins_rows_and_cells() {
        let grid = vec![
            vec![Some("/symbols/svg/letters/a.svg"), None],
            vec![
                Some("/symbols/svg/numbers/7.svg"),
                Some("/symbols/svg/letters/kqc.svg"),
            ],
        ];
        assert_eq!(encode_grid(&grid), "a,;7,kqc");
    }
}
