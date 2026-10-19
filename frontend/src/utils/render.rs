use wasm_bindgen::JsCast;

/// Which renderer draws slabs, glyphs and helix links.
#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum RenderMode {
    /// The Three.js canvas draws them; the DOM keeps layout and text.
    Webgl,
    /// The DOM and CSS draw everything, for visitors without usable WebGL.
    Dom(DomReason),
}

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum DomReason {
    /// `?webgl=off`, chosen on purpose for comparison and debugging.
    Disabled,
    /// No hardware accelerated WebGL context could be created.
    Unsupported,
}

/// Pure decision, kept apart from the browser calls so it is unit tested natively.
/// `?webgl=off` is the manual switch, `?webgl=failed` is set by `scene.js` when the context
/// could not start after all, and counts as unsupported so the notice shows.
pub fn decide(search: &str, hardware_webgl: bool) -> RenderMode {
    let has = |wanted: &str| {
        search
            .trim_start_matches('?')
            .split('&')
            .any(|pair| pair == wanted)
    };
    if has("webgl=off") {
        RenderMode::Dom(DomReason::Disabled)
    } else if hardware_webgl && !has("webgl=failed") {
        RenderMode::Webgl
    } else {
        RenderMode::Dom(DomReason::Unsupported)
    }
}

/// Decides the mode once and publishes it on `<html>` as `data-render` (`webgl` or `dom`) and,
/// for the DOM mode, `data-render-reason` (`disabled` or `unsupported`). CSS, `scene.js` and the
/// components all read these attributes, so every layer agrees on one answer.
pub fn apply() {
    let Some(window) = web_sys::window() else {
        return;
    };
    let search = window.location().search().unwrap_or_default();
    let mode = decide(&search, hardware_webgl());

    let Some(root) = window.document().and_then(|d| d.document_element()) else {
        return;
    };
    let _ = match mode {
        RenderMode::Webgl => root.set_attribute("data-render", "webgl"),
        RenderMode::Dom(reason) => {
            let _ = root.set_attribute("data-render", "dom");
            root.set_attribute(
                "data-render-reason",
                match reason {
                    DomReason::Disabled => "disabled",
                    DomReason::Unsupported => "unsupported",
                },
            )
        }
    };
}

/// True when the WebGL layer is drawing (read during component construction).
pub fn webgl() -> bool {
    attribute("data-render").as_deref() == Some("webgl")
}

/// True when the DOM fallback runs because WebGL is unusable, so the notice should show.
pub fn unsupported() -> bool {
    attribute("data-render-reason").as_deref() == Some("unsupported")
}

fn attribute(name: &str) -> Option<String> {
    web_sys::window()
        .and_then(|w| w.document())
        .and_then(|d| d.document_element())
        .and_then(|root| root.get_attribute(name))
}

/// A throwaway canvas context, created with `failIfMajorPerformanceCaveat` so software
/// rendering (hardware acceleration switched off) counts as unsupported.
fn hardware_webgl() -> bool {
    let Some(document) = web_sys::window().and_then(|w| w.document()) else {
        return false;
    };
    let Ok(element) = document.create_element("canvas") else {
        return false;
    };
    let Ok(canvas) = element.dyn_into::<web_sys::HtmlCanvasElement>() else {
        return false;
    };

    let options = js_sys::Object::new();
    let _ = js_sys::Reflect::set(
        &options,
        &"failIfMajorPerformanceCaveat".into(),
        &true.into(),
    );
    ["webgl2", "webgl"].iter().any(|kind| {
        matches!(
            canvas.get_context_with_context_options(kind, &options),
            Ok(Some(_))
        )
    })
}

#[cfg(test)]
mod tests {
    use super::{DomReason, RenderMode, decide};

    #[test]
    fn decide_picks_webgl_when_hardware_is_available() {
        assert_eq!(decide("", true), RenderMode::Webgl);
        assert_eq!(decide("?debug", true), RenderMode::Webgl);
    }

    #[test]
    fn decide_falls_back_when_hardware_webgl_is_missing() {
        assert_eq!(decide("", false), RenderMode::Dom(DomReason::Unsupported));
    }

    #[test]
    fn decide_treats_a_failed_context_as_unsupported() {
        assert_eq!(
            decide("?webgl=failed", true),
            RenderMode::Dom(DomReason::Unsupported)
        );
    }

    #[test]
    fn decide_honors_the_off_switch_even_with_hardware() {
        assert_eq!(
            decide("?a=1&webgl=off", true),
            RenderMode::Dom(DomReason::Disabled)
        );
        assert_eq!(decide("?webgl=offline", true), RenderMode::Webgl);
    }
}
