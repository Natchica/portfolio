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

pub fn contact_decode_requested(requested_at: Option<f64>, now: f64) -> bool {
    requested_at.is_some_and(|at| (0.0..=CONTACT_DECODE_WINDOW_MS).contains(&(now - at)))
}

#[cfg(test)]
mod tests {
    use super::contact_decode_requested;

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
