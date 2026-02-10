use leptos::prelude::*;

#[component]
pub fn TransitionSection(#[prop(optional)] id: Option<&'static str>) -> impl IntoView {
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
}
