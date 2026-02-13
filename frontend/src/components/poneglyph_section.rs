use leptos::prelude::*;

use crate::hooks::use_intersection_observer::{
    IntersectionObserverOptions, use_intersection_observer,
};

#[component]
pub fn PoneglyphSection(
    id: &'static str,
    #[prop(optional)] show_connection_line: Option<bool>,
    children: Children,
) -> impl IntoView {
    let show_line = show_connection_line.unwrap_or(false);
    let node_ref = NodeRef::<leptos::html::Div>::new();
    let is_in_view = use_intersection_observer(
        node_ref,
        IntersectionObserverOptions {
            once: false,
            root_margin: "-50%",
            ..Default::default()
        },
    );

    view! {
        <div id={id} node_ref=node_ref class="poneglyph-section">
            <div class="poneglyph-bg">
                <div class="poneglyph-bg-gradient" />
            </div>
            {children()}
            {move || {
                if show_line {
                    let visible_class = if is_in_view.get() { " visible" } else { "" };
                    Some(
                        view! {
                            <div class={format!("connection-line-wrapper connection-line{}", visible_class)}>
                            </div>
                            <div
                                class={format!("connection-dot-wrapper connection-dot{}", visible_class)}
                                style="box-shadow: 0 0 20px #00bfff;"
                            />
                        },
                    )
                } else {
                    None
                }
            }}
        </div>
    }
}
