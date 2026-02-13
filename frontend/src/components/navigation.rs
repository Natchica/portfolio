use leptos::prelude::*;

#[derive(Clone, Debug)]
pub struct ScrollProgress {
    pub section: usize,
    pub dot_index: i32,
}

impl Default for ScrollProgress {
    fn default() -> Self {
        Self {
            section: 0,
            dot_index: -1,
        }
    }
}

#[component]
pub fn Navigation(
    sections: &'static [&'static str],
    current_section: ReadSignal<usize>,
    scroll_progress: ReadSignal<ScrollProgress>,
    on_navigate: impl Fn(String) + 'static + Clone,
) -> impl IntoView {
    view! {
        <nav class="nav-wrapper">
            <div class="nav-panel nav-container">
                <div class="nav-items">
                    {sections
                        .iter()
                        .enumerate()
                        .map(|(index, section)| {
                            let section_str = (*section).to_string();
                            let nav_section = section_str.clone();
                            let on_nav = on_navigate.clone();
                            let title = {
                                let mut chars = section.chars();
                                match chars.next() {
                                    None => String::new(),
                                    Some(c) => {
                                        c.to_uppercase().to_string() + chars.as_str()
                                    }
                                }
                            };
                            view! {
                                <div class="nav-section-group">
                                    <button
                                        class={move || {
                                            let is_active = current_section.get() == index
                                                && scroll_progress.get().dot_index == -1;
                                            if is_active {
                                                "nav-button nav-button-active active"
                                            } else {
                                                "nav-button nav-button-inactive"
                                            }
                                        }}
                                        title={title.clone()}
                                        aria-label={format!("Navigate to {}", title)}
                                        on:click={
                                            let nav_section = nav_section.clone();
                                            move |_| on_nav(nav_section.clone())
                                        }
                                    />
                                    {if index < sections.len() - 1 {
                                        Some(
                                            view! {
                                                <div class="nav-dots-group">
                                                    {(0..1)
                                                        .map(|dot_index| {
                                                            view! {
                                                                <div class={move || {
                                                                    let progress = scroll_progress.get();
                                                                    let is_active = progress.section == index
                                                                        && progress.dot_index == dot_index;
                                                                    if is_active {
                                                                        "nav-dot active"
                                                                    } else {
                                                                        "nav-dot"
                                                                    }
                                                                }} />
                                                            }
                                                        })
                                                        .collect_view()}
                                                </div>
                                            },
                                        )
                                    } else {
                                        None
                                    }}
                                </div>
                            }
                        })
                        .collect_view()}
                </div>
            </div>
        </nav>
    }
}
