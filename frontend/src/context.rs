use leptos::prelude::*;

#[derive(Clone, Copy, Debug)]
pub struct EasterEggState {
    pub alphabet_unlocked: RwSignal<bool>,
    pub decoder_open: RwSignal<bool>,
}
