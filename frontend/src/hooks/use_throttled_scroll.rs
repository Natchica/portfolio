use std::cell::Cell;
use std::rc::Rc;
use wasm_bindgen::prelude::*;

pub fn use_throttled_scroll(callback: impl Fn() + 'static) {
    let callback = Rc::new(callback);
    let raf_id: Rc<Cell<Option<i32>>> = Rc::new(Cell::new(None));

    let raf_id_clone = raf_id.clone();
    let callback_clone = callback.clone();

    let handler = Closure::<dyn Fn()>::new(move || {
        if let Some(id) = raf_id_clone.get() {
            let _ = web_sys::window().unwrap().cancel_animation_frame(id);
        }

        let raf_id_inner = raf_id_clone.clone();
        let cb = callback_clone.clone();

        let raf_closure = Closure::<dyn FnMut()>::once(move || {
            cb();
            raf_id_inner.set(None);
        });

        let id = web_sys::window()
            .unwrap()
            .request_animation_frame(raf_closure.as_ref().unchecked_ref())
            .unwrap();
        raf_id_clone.set(Some(id));

        raf_closure.forget();
    });

    let window = web_sys::window().unwrap();
    let opts = web_sys::AddEventListenerOptions::new();
    opts.set_passive(true);

    window
        .add_event_listener_with_callback_and_add_event_listener_options(
            "scroll",
            handler.as_ref().unchecked_ref(),
            &opts,
        )
        .unwrap();

    handler.forget();
}
