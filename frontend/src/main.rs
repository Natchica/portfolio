mod app;
mod components;
mod context;
mod hooks;
mod utils;

use wasm_bindgen::JsCast;

fn main() {
    console_error_panic_hook::set_once();
    let _ = console_log::init_with_level(log::Level::Debug);
    // Decide WebGL or DOM rendering before anything mounts: components and scene.js read the result.
    utils::render::apply();
    leptos::mount::mount_to_body(app::App);
    mount_webgl_notice();
}

/// The notice lives in its own host element so the app component stays untouched.
fn mount_webgl_notice() {
    let Some(document) = web_sys::window().and_then(|w| w.document()) else {
        return;
    };
    let Some(body) = document.body() else {
        return;
    };
    let Ok(host) = document.create_element("div") else {
        return;
    };
    if body.append_child(&host).is_err() {
        return;
    }
    if let Ok(host) = host.dyn_into::<web_sys::HtmlElement>() {
        leptos::mount::mount_to(host, components::webgl_notice::WebglNotice).forget();
    }
}
