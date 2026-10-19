use leptos::prelude::*;

/// Shown only when the DOM fallback runs because no hardware accelerated WebGL was available.
/// It explains that the 3D design is off and how to switch it on.
#[component]
pub fn WebglNotice() -> impl IntoView {
    let visible = RwSignal::new(crate::utils::render::unsupported());

    view! {
        <Show when=move || visible.get()>
            <aside class="webgl-notice" role="status">
                <p class="webgl-notice-text">
                    <strong>"3D effects are off. "</strong>
                    "Your browser could not start hardware accelerated WebGL, so you see the simplified design. "
                    "To get the full experience, turn on hardware acceleration "
                    "(Chrome or Edge: Settings, System, \"Use graphics acceleration when available\"; "
                    "Firefox: Settings, General, Performance, \"Use hardware acceleration when available\") "
                    "or open the site in an up-to-date browser."
                </p>
                <button
                    type="button"
                    class="webgl-notice-close"
                    aria-label="Dismiss this notice"
                    on:click=move |_| visible.set(false)
                >
                    "\u{d7}"
                </button>
            </aside>
        </Show>
    }
}
