use leptos::prelude::*;
use wasm_bindgen::prelude::*;

pub struct IntersectionObserverOptions {
    pub threshold: f64,
    pub root_margin: &'static str,
    pub once: bool,
}

impl Default for IntersectionObserverOptions {
    fn default() -> Self {
        Self {
            threshold: 0.0,
            root_margin: "0px",
            once: false,
        }
    }
}

pub fn use_intersection_observer(
    node_ref: NodeRef<leptos::html::Div>,
    options: IntersectionObserverOptions,
) -> ReadSignal<bool> {
    let (is_intersecting, set_is_intersecting) = signal(false);

    Effect::new(move |_| {
        let Some(element) = node_ref.get() else {
            return;
        };

        let once = options.once;
        let set_intersecting = set_is_intersecting;

        let closure = Closure::<dyn Fn(js_sys::Array, web_sys::IntersectionObserver)>::new(
            move |entries: js_sys::Array, observer: web_sys::IntersectionObserver| {
                if let Some(entry) = entries
                    .get(0)
                    .dyn_ref::<web_sys::IntersectionObserverEntry>()
                {
                    let intersecting = entry.is_intersecting();
                    set_intersecting.set(intersecting);
                    if intersecting && once {
                        observer.disconnect();
                    }
                }
            },
        );

        let init = web_sys::IntersectionObserverInit::new();
        init.set_threshold(&JsValue::from_f64(options.threshold));
        init.set_root_margin(options.root_margin);

        let observer = web_sys::IntersectionObserver::new_with_options(
            closure.as_ref().unchecked_ref(),
            &init,
        )
        .expect("Failed to create IntersectionObserver");

        let el: &web_sys::Element = &element;
        observer.observe(el);

        closure.forget();
    });

    is_intersecting
}
