use leptos::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen::prelude::Closure;

use crate::components::navigation::{Navigation, ScrollProgress};
use crate::components::sections::about::AboutSection;
use crate::components::sections::alphabet::PoneglyphAlphabetSection;
use crate::components::sections::contact::ContactSection;
use crate::components::sections::experience::ExperienceSection;
use crate::components::sections::projects::ProjectsSection;
use crate::components::sections::skills::SkillsSection;
use crate::components::transition_section::TransitionSection;
use crate::hooks::use_throttled_scroll::use_throttled_scroll;

const SECTIONS: &[&str] = &[
    "about",
    "skills",
    "experience",
    "projects",
    "alphabet",
    "contact",
];

#[derive(Clone, Debug)]
struct SectionPosition {
    top: f64,
    bottom: f64,
    height: f64,
}

impl Default for SectionPosition {
    fn default() -> Self {
        Self {
            top: 0.0,
            bottom: 0.0,
            height: 0.0,
        }
    }
}

#[derive(Clone, Debug, Default)]
struct TransitionPositions {
    top1: Option<SectionPosition>,
    #[allow(dead_code)]
    top2: Option<SectionPosition>,
    #[allow(dead_code)]
    bottom1: Option<SectionPosition>,
    bottom2: Option<SectionPosition>,
}

fn get_element_position(id: &str) -> Option<SectionPosition> {
    let window = web_sys::window()?;
    let document = window.document()?;
    let element = document.get_element_by_id(id)?;
    let rect = element.get_bounding_client_rect();
    let scroll_y = window.scroll_y().unwrap_or(0.0);
    Some(SectionPosition {
        top: rect.top() + scroll_y,
        bottom: rect.bottom() + scroll_y,
        height: rect.height(),
    })
}

#[component]
pub fn App() -> impl IntoView {
    let (current_section, set_current_section) = signal(0usize);
    let (loop_count, set_loop_count) = signal(0usize);
    let (scroll_progress, set_scroll_progress) = signal(ScrollProgress::default());

    let is_scrolling = RwSignal::new(false);
    let last_scroll_y = RwSignal::new(0.0f64);
    let section_positions = RwSignal::new(Vec::<SectionPosition>::new());
    let transition_positions = RwSignal::new(TransitionPositions::default());

    let recalculate_positions = move || {
        let positions: Vec<SectionPosition> = SECTIONS
            .iter()
            .map(|id| get_element_position(id).unwrap_or_default())
            .collect();
        section_positions.set(positions);

        transition_positions.set(TransitionPositions {
            top1: get_element_position("transition-loop-top-1"),
            top2: get_element_position("transition-loop-top-2"),
            bottom1: get_element_position("transition-loop-bottom-1"),
            bottom2: get_element_position("transition-loop-bottom-2"),
        });
    };

    // Initial scroll to about section + position calculation
    let recalc = recalculate_positions;
    Effect::new(move |_| {
        let window = web_sys::window().unwrap();
        if let Some(about) = window.document().and_then(|d| d.get_element_by_id("about")) {
            let el: &web_sys::HtmlElement = about.unchecked_ref();
            let opts = web_sys::ScrollToOptions::new();
            opts.set_top(el.offset_top() as f64);
            opts.set_behavior(web_sys::ScrollBehavior::Instant);
            window.scroll_to_with_scroll_to_options(&opts);
        }

        let recalc_inner = recalc;
        let recalc_inner2 = recalc;
        let closure = Closure::<dyn FnMut()>::once(move || {
            recalc_inner();
            let closure2 = Closure::<dyn FnMut()>::once(move || {
                recalc_inner2();
            });
            web_sys::window()
                .unwrap()
                .set_timeout_with_callback_and_timeout_and_arguments_0(
                    closure2.as_ref().unchecked_ref(),
                    200,
                )
                .unwrap();
            closure2.forget();
        });
        window
            .set_timeout_with_callback_and_timeout_and_arguments_0(
                closure.as_ref().unchecked_ref(),
                200,
            )
            .unwrap();
        closure.forget();
    });

    // Resize listener
    Effect::new(move |_| {
        let closure = Closure::<dyn Fn()>::new(move || {
            recalculate_positions();
        });
        let window = web_sys::window().unwrap();
        let opts = web_sys::AddEventListenerOptions::new();
        opts.set_passive(true);
        window
            .add_event_listener_with_callback_and_add_event_listener_options(
                "resize",
                closure.as_ref().unchecked_ref(),
                &opts,
            )
            .unwrap();
        closure.forget();
    });

    // Scroll handler
    let handle_scroll = move || {
        if is_scrolling.get_untracked() {
            return;
        }

        let window = web_sys::window().unwrap();
        let scroll_position = window.scroll_y().unwrap_or(0.0);
        let viewport_height = window.inner_height().unwrap().as_f64().unwrap_or(0.0);
        let viewport_middle = scroll_position + viewport_height / 2.0;

        let current_scroll_y = scroll_position;
        let prev_scroll_y = last_scroll_y.get_untracked();
        let scroll_down = current_scroll_y > prev_scroll_y;
        last_scroll_y.set(current_scroll_y);

        let cached = section_positions.get_untracked();
        let mut active_section_index = 0usize;
        let mut active_dot_index: i32 = -1;

        for i in (0..cached.len()).rev() {
            if cached[i].top <= viewport_middle {
                active_section_index = i;
                break;
            }
        }

        if active_section_index < cached.len() - 1 {
            let current_bottom = cached[active_section_index].bottom;
            let next_top = cached[active_section_index + 1].top;
            if viewport_middle >= current_bottom && viewport_middle <= next_top {
                let zone_height = next_top - current_bottom;
                let progress = (viewport_middle - current_bottom) / zone_height;
                active_dot_index = if progress < 0.5 {
                    0
                } else {
                    -1
                };
            }
        }

        // positions already read via get_untracked, no need to put back
        set_current_section.set(active_section_index);
        set_scroll_progress.set(ScrollProgress {
            section: active_section_index,
            dot_index: active_dot_index,
        });

        let mut transitions = transition_positions.get_untracked();
        if transitions.bottom2.is_none() || transitions.top1.is_none() {
            recalculate_positions();
            transitions = transition_positions.get_untracked();
            if transitions.bottom2.is_none() || transitions.top1.is_none() {
                // transitions already read via get_untracked
                return;
            }
        }

        // Scroll down: bottom transition teleport to top
        if scroll_down
            && let Some(ref bottom2) = transitions.bottom2
            && viewport_middle >= bottom2.top
            && viewport_middle <= bottom2.bottom
        {
            let progress = (viewport_middle - bottom2.top) / bottom2.height;
            if (0.5..=0.7).contains(&progress)
                && let Some(ref top1) = transitions.top1
            {
                is_scrolling.set(true);
                set_loop_count.update(|c| *c += 1);

                let offset = viewport_middle - bottom2.top;
                let new_scroll = top1.top + offset;

                let opts = web_sys::ScrollToOptions::new();
                opts.set_top(new_scroll);
                opts.set_behavior(web_sys::ScrollBehavior::Instant);
                window.scroll_to_with_scroll_to_options(&opts);

                let closure = Closure::<dyn FnMut()>::once(move || {
                    is_scrolling.set(false);
                });
                window
                    .set_timeout_with_callback_and_timeout_and_arguments_0(
                        closure.as_ref().unchecked_ref(),
                        50,
                    )
                    .unwrap();
                closure.forget();
            }
        }

        // Scroll up: top transition teleport to bottom
        if !scroll_down
            && loop_count.get_untracked() > 0
            && let Some(ref top1) = transitions.top1
            && viewport_middle >= top1.top
            && viewport_middle <= top1.bottom
        {
            let progress = (viewport_middle - top1.top) / top1.height;
            if (0.3..=0.5).contains(&progress)
                && let Some(ref bottom2) = transitions.bottom2
            {
                is_scrolling.set(true);
                set_loop_count.update(|c| *c = c.saturating_sub(1));

                let offset = viewport_middle - top1.top;
                let new_scroll = bottom2.top + offset;

                let opts = web_sys::ScrollToOptions::new();
                opts.set_top(new_scroll);
                opts.set_behavior(web_sys::ScrollBehavior::Instant);
                window.scroll_to_with_scroll_to_options(&opts);

                let closure = Closure::<dyn FnMut()>::once(move || {
                    is_scrolling.set(false);
                });
                window
                    .set_timeout_with_callback_and_timeout_and_arguments_0(
                        closure.as_ref().unchecked_ref(),
                        50,
                    )
                    .unwrap();
                closure.forget();
            }
        }

        // Prevent scrolling above top transition when loop_count == 0
        if loop_count.get_untracked() == 0
            && !scroll_down
            && let Some(ref top1) = transitions.top1
            && scroll_position < top1.top
        {
            let opts = web_sys::ScrollToOptions::new();
            opts.set_top(top1.top);
            opts.set_behavior(web_sys::ScrollBehavior::Instant);
            window.scroll_to_with_scroll_to_options(&opts);
        }

        // transitions already read via get_untracked
    };

    use_throttled_scroll(handle_scroll);

    let scroll_to_section = move |section_id: String| {
        let index = SECTIONS.iter().position(|s| *s == section_id);
        if let Some(idx) = index {
            set_current_section.set(idx);
        }
        is_scrolling.set(true);

        if let Some(window) = web_sys::window()
            && let Some(doc) = window.document()
            && let Some(el) = doc.get_element_by_id(&section_id)
        {
            let opts = web_sys::ScrollIntoViewOptions::new();
            opts.set_behavior(web_sys::ScrollBehavior::Smooth);
            el.scroll_into_view_with_scroll_into_view_options(&opts);
        }

        let closure = Closure::<dyn FnMut()>::once(move || {
            is_scrolling.set(false);
        });
        web_sys::window()
            .unwrap()
            .set_timeout_with_callback_and_timeout_and_arguments_0(
                closure.as_ref().unchecked_ref(),
                1000,
            )
            .unwrap();
        closure.forget();
    };

    let scroll_to_top = move |_| {
        is_scrolling.set(true);
        set_loop_count.set(0);

        if let Some(window) = web_sys::window()
            && let Some(doc) = window.document()
            && let Some(about) = doc.get_element_by_id("about")
        {
            let el: &web_sys::HtmlElement = about.unchecked_ref();
            let opts = web_sys::ScrollToOptions::new();
            opts.set_top(el.offset_top() as f64);
            opts.set_behavior(web_sys::ScrollBehavior::Smooth);
            window.scroll_to_with_scroll_to_options(&opts);
        }

        let closure = Closure::<dyn FnMut()>::once(move || {
            is_scrolling.set(false);
        });
        web_sys::window()
            .unwrap()
            .set_timeout_with_callback_and_timeout_and_arguments_0(
                closure.as_ref().unchecked_ref(),
                1000,
            )
            .unwrap();
        closure.forget();
    };

    let nav_scroll = scroll_to_section;
    let about_scroll = scroll_to_section;
    let contact_scroll = scroll_to_section;

    view! {
        <div class="portfolio-container">
            <Navigation
                sections=SECTIONS
                current_section=current_section
                scroll_progress=scroll_progress
                on_navigate=nav_scroll
            />

            {move || {
                let count = loop_count.get();
                if count > 0 {
                    Some(
                        view! {
                            <div class="loop-counter">
                                <div class="loop-counter-badge">
                                    {format!("\u{1f3f4}\u{200d}\u{2620}\u{fe0f} Loops sailed: {}", count)}
                                </div>
                                <button class="loop-counter-btn" on:click=scroll_to_top>
                                    "\u{2693} Return to origin"
                                </button>
                            </div>
                        },
                    )
                } else {
                    None
                }
            }}

            <TransitionSection id="transition-loop-top-1" />
            <TransitionSection id="transition-loop-top-2" />

            <div id="about">
                <AboutSection on_navigate=about_scroll />
            </div>
            <TransitionSection chain=true />

            <div id="skills">
                <SkillsSection />
            </div>
            <TransitionSection chain=true />

            <div id="experience">
                <ExperienceSection />
            </div>
            <TransitionSection chain=true />

            <div id="projects">
                <ProjectsSection />
            </div>
            <TransitionSection chain=true />

            <div id="alphabet">
                <PoneglyphAlphabetSection />
            </div>
            <TransitionSection chain=true />

            <div id="contact">
                <ContactSection on_navigate=contact_scroll />
            </div>
            <TransitionSection chain=true fade=true />

            <TransitionSection id="transition-loop-bottom-1" />
            <TransitionSection id="transition-loop-bottom-2" />
        </div>
    }
}
