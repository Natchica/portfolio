use leptos::prelude::*;
use wasm_bindgen::prelude::*;

use crate::utils::poneglyph_converter::text_to_centered_symbol_grid;

#[component]
pub fn PoneglyphOverlay(
    author: &'static str,
    quote: &'static str,
    #[prop(default = 15)] columns: usize,
) -> impl IntoView {
    let (has_started, set_has_started) = signal(false);
    let (is_hovered, set_is_hovered) = signal(false);
    let (container_width, set_container_width) = signal(0u32);
    let (container_height, set_container_height) = signal(0u32);
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
            class="poneglyph-overlay poneglyph-overlay-btn"
            on:mouseenter=move |_| set_is_hovered.set(true)
            on:mouseleave=move |_| set_is_hovered.set(false)
            on:click=move |_| {
                if is_hovered.get() && !has_started.get() {
                    set_has_started.set(true);
                }
            }
            on:keydown=move |ev| {
                let key = ev.key();
                if (key == "Enter" || key == " ") && !has_started.get() {
                    ev.prevent_default();
                    set_has_started.set(true);
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
                    grid.iter()
                        .enumerate()
                        .flat_map(|(line_index, line)| {
                            line.iter()
                                .enumerate()
                                .map(move |(_, symbol_path)| {
                                    let cell_class = if started {
                                        "poneglyph-symbol-cell animating"
                                    } else {
                                        "poneglyph-symbol-cell"
                                    };
                                    let style =
                                        format!("--line-index: {};", line_index);
                                    let path = *symbol_path;
                                    view! {
                                        <div class={cell_class} style={style}>
                                            {match path {
                                                Some(p) => {
                                                    Some(
                                                        view! {
                                                            <img
                                                                src={p}
                                                                alt=""
                                                                loading="lazy"
                                                                decoding="async"
                                                                width="32"
                                                                height="32"
                                                                class="poneglyph-cell-img"
                                                            />
                                                        },
                                                    )
                                                }
                                                None => None,
                                            }}
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
