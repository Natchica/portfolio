use leptos::prelude::*;
use wasm_bindgen::prelude::*;

use crate::utils::poneglyph_converter::text_to_centered_symbol_grid;

fn schedule_callback(duration_secs: f64, cb: Callback<()>) {
    let millis = ((duration_secs * 0.7) * 1000.0) as i32;
    let closure = Closure::<dyn Fn()>::new(move || {
        cb.run(());
    });
    let window = web_sys::window().expect("no window");
    let _ = window.set_timeout_with_callback_and_timeout_and_arguments_0(
        closure.as_ref().unchecked_ref(),
        millis,
    );
    closure.forget();
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

#[component]
pub fn PoneglyphOverlay(
    author: &'static str,
    quote: &'static str,
    #[prop(default = 15)] columns: usize,
    #[prop(optional)] on_decode_complete: Option<Callback<()>>,
) -> impl IntoView {
    let (has_started, set_has_started) = signal(false);
    let (is_hovered, set_is_hovered) = signal(false);
    let (container_width, set_container_width) = signal(0u32);
    let (container_height, set_container_height) = signal(0u32);
    let click_coords: RwSignal<Option<(f64, f64)>> = RwSignal::new(None);
    let decode_duration: RwSignal<f64> = RwSignal::new(0.0);
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

    view! {
        <button
            type="button"
            class=move || if has_started.get() {
                "poneglyph-overlay poneglyph-overlay-btn decoding"
            } else {
                "poneglyph-overlay poneglyph-overlay-btn"
            }
            style=move || {
                let dur = decode_duration.get();
                if dur > 0.0 {
                    format!("--decode-total: {dur:.2}s;")
                } else {
                    String::new()
                }
            }
            on:mouseenter=move |_| set_is_hovered.set(true)
            on:mouseleave=move |_| set_is_hovered.set(false)
            on:click=move |ev| {
                if is_hovered.get() && !has_started.get()
                    && let Some(el) = container_ref.get_untracked() {
                        let mouse_ev: &web_sys::MouseEvent = ev.as_ref();
                        let rect = el.get_bounding_client_rect();
                        let x = mouse_ev.client_x() as f64 - rect.left();
                        let y = mouse_ev.client_y() as f64 - rect.top();
                        let cell_size = 32.0;
                        let click_col = x / cell_size;
                        let click_row = y / cell_size;
                        let cols = responsive_columns.get_untracked() as f64;
                        let rows = symbol_grid.get_untracked().len() as f64;
                        let max_dist = max_corner_distance(click_col, click_row, cols, rows);
                        let dur = max_dist * 0.04 + 0.6;
                        decode_duration.set(dur);
                        click_coords.set(Some((x, y)));
                        set_has_started.set(true);
                        if let Some(cb) = on_decode_complete {
                            schedule_callback(dur, cb);
                        }
                    }
            }
            on:keydown=move |ev| {
                let key = ev.key();
                if (key == "Enter" || key == " ") && !has_started.get() {
                    ev.prevent_default();
                    let cw = container_width.get_untracked() as f64;
                    let ch = container_height.get_untracked() as f64;
                    let cols = responsive_columns.get_untracked() as f64;
                    let rows = symbol_grid.get_untracked().len() as f64;
                    let max_dist = max_corner_distance(cols / 2.0, rows / 2.0, cols, rows);
                    let dur = max_dist * 0.04 + 0.6;
                    decode_duration.set(dur);
                    click_coords.set(Some((cw / 2.0, ch / 2.0)));
                    set_has_started.set(true);
                    if let Some(cb) = on_decode_complete {
                        schedule_callback(dur, cb);
                    }
                }
            }
        >
            <div
                node_ref=container_ref
                class="poneglyph-grid poneglyph-grid-full"
                style=move || {
                    format!(
                        "grid-template-columns: repeat({}, minmax(0, 1fr));",
                        responsive_columns.get(),
                    )
                }
            >
                {move || {
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
                                                                loading="lazy"
                                                                decoding="async"
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
                }}
            </div>
        </button>
    }
}
