use leptos::prelude::*;

#[derive(Clone, Copy, Debug)]
pub struct EasterEggState {
    pub alphabet_unlocked: RwSignal<bool>,
    pub decoder_open: RwSignal<bool>,
}

/// How long a "Get in Touch" click keeps asking for the Final Poneglyph to decode itself.
/// It covers the smooth scroll to the slab and no more, so scrolling away never leaves a stale request.
const CONTACT_DECODE_WINDOW_MS: f64 = 4_000.0;

/// Set by the "Get in Touch" button with the click time, consumed by the contact section
/// once the Final Poneglyph is in view.
#[derive(Clone, Copy, Debug)]
pub struct ContactDecodeRequest {
    pub requested_at: RwSignal<Option<f64>>,
}

/// Set once a visitor has decoded a block by hand (tap or Enter). Lives for the page visit only,
/// a reload starts the discovery over. The Get in Touch decode never sets it.
#[derive(Clone, Copy, Debug)]
pub struct AutoDecode {
    pub armed: RwSignal<bool>,
}

/// The decode hint shows only while a slab waits to be discovered: never once the visitor
/// has armed auto decode, and never on a slab that already started.
pub fn hint_visible(
    show_hint: bool,
    hint_ready: bool,
    in_view: bool,
    has_started: bool,
    armed: bool,
) -> bool {
    show_hint && hint_ready && in_view && !has_started && !armed
}

/// How armed auto decode drives a slab. `Window` is the WebGL per-glyph viewport window,
/// `WholeSlab` the fade-only fallback of the DOM look and of reduced motion.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AutoMode {
    Off,
    Window,
    WholeSlab,
}

pub fn auto_mode(webgl: bool, reduced_motion: bool, armed: bool) -> AutoMode {
    match (armed, webgl && !reduced_motion) {
        (false, _) => AutoMode::Off,
        (true, true) => AutoMode::Window,
        (true, false) => AutoMode::WholeSlab,
    }
}

/// Where a slab stands in the whole-slab fallback. A slab never leaves `Decoding` by itself: its own
/// completion timer moves it to `Decoded`, so a re-encode can never race a pending completion.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SlabState {
    Encoded,
    Decoding,
    Decoded,
}

/// The next state of a slab in whole-slab mode, or `None` when nothing changes.
/// `in_middle`: the slab crosses the middle band of the viewport. `in_viewport`: any part is on screen.
pub fn whole_slab_next(state: SlabState, in_middle: bool, in_viewport: bool) -> Option<SlabState> {
    match state {
        SlabState::Encoded if in_middle => Some(SlabState::Decoding),
        SlabState::Decoded if !in_viewport => Some(SlabState::Encoded),
        _ => None,
    }
}

/// Whether a cluster slab shows its content. Before the first tap and during the shared first wave the
/// whole cluster reveals together. After that each slab follows its own state.
pub fn cluster_slab_shows(
    armed: bool,
    wave_running: bool,
    cluster_decoded: bool,
    slab_decoded: bool,
) -> bool {
    if !armed || wave_running {
        cluster_decoded
    } else {
        slab_decoded
    }
}

pub fn contact_decode_requested(requested_at: Option<f64>, now: f64) -> bool {
    requested_at.is_some_and(|at| (0.0..=CONTACT_DECODE_WINDOW_MS).contains(&(now - at)))
}

#[cfg(test)]
mod tests {
    use super::{
        AutoMode, SlabState, auto_mode, cluster_slab_shows, contact_decode_requested, hint_visible,
        whole_slab_next,
    };

    #[test]
    fn encoded_slab_decodes_in_the_middle() {
        assert_eq!(
            whole_slab_next(SlabState::Encoded, true, true),
            Some(SlabState::Decoding)
        );
    }

    #[test]
    fn encoded_slab_waits_outside_the_middle() {
        assert_eq!(whole_slab_next(SlabState::Encoded, false, true), None);
    }

    #[test]
    fn decoded_slab_encodes_once_fully_out() {
        assert_eq!(
            whole_slab_next(SlabState::Decoded, false, false),
            Some(SlabState::Encoded)
        );
    }

    #[test]
    fn decoded_slab_stays_while_any_part_is_on_screen() {
        assert_eq!(whole_slab_next(SlabState::Decoded, false, true), None);
    }

    #[test]
    fn decoding_slab_never_changes_state_by_itself() {
        assert_eq!(whole_slab_next(SlabState::Decoding, true, true), None);
        assert_eq!(whole_slab_next(SlabState::Decoding, false, false), None);
    }

    #[test]
    fn unarmed_cluster_follows_the_cluster() {
        assert!(cluster_slab_shows(false, false, true, false));
        assert!(!cluster_slab_shows(false, false, false, true));
    }

    #[test]
    fn running_first_wave_follows_the_cluster() {
        assert!(!cluster_slab_shows(true, true, false, true));
    }

    #[test]
    fn armed_cluster_slab_follows_itself() {
        assert!(cluster_slab_shows(true, false, true, true));
        assert!(!cluster_slab_shows(true, false, true, false));
    }

    #[test]
    fn unarmed_is_always_off() {
        assert_eq!(auto_mode(true, false, false), AutoMode::Off);
        assert_eq!(auto_mode(false, true, false), AutoMode::Off);
    }

    #[test]
    fn armed_webgl_with_motion_uses_the_window() {
        assert_eq!(auto_mode(true, false, true), AutoMode::Window);
    }

    #[test]
    fn armed_reduced_motion_uses_whole_slab() {
        assert_eq!(auto_mode(true, true, true), AutoMode::WholeSlab);
    }

    #[test]
    fn armed_dom_look_uses_whole_slab() {
        assert_eq!(auto_mode(false, false, true), AutoMode::WholeSlab);
    }

    #[test]
    fn hint_shows_when_ready_in_view_and_unarmed() {
        assert!(hint_visible(true, true, true, false, false));
    }

    #[test]
    fn hint_hidden_once_armed() {
        assert!(!hint_visible(true, true, true, false, true));
    }

    #[test]
    fn hint_hidden_after_start() {
        assert!(!hint_visible(true, true, true, true, false));
    }

    #[test]
    fn hint_hidden_without_show_hint() {
        assert!(!hint_visible(false, true, true, false, false));
    }

    #[test]
    fn no_request_never_decodes() {
        assert!(!contact_decode_requested(None, 10_000.0));
    }

    #[test]
    fn fresh_request_decodes() {
        assert!(contact_decode_requested(Some(1_000.0), 1_500.0));
    }

    #[test]
    fn request_expires_after_the_window() {
        assert!(contact_decode_requested(Some(1_000.0), 5_000.0));
        assert!(!contact_decode_requested(Some(1_000.0), 5_001.0));
    }

    #[test]
    fn request_from_the_future_is_ignored() {
        assert!(!contact_decode_requested(Some(2_000.0), 1_000.0));
    }
}
