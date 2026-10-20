pub mod about;
pub mod alphabet;
pub mod contact;
pub mod experience;
pub mod projects;
pub mod skills;

#[cfg(test)]
mod tests {
    use super::{about, contact, experience, projects, skills};
    use crate::utils::poneglyph_converter::char_to_symbol;

    #[test]
    fn every_section_quote_and_author_maps_to_glyphs() {
        let quotes = [
            ("about", about::QUOTE_AUTHOR, about::PONEGLYPH_QUOTE),
            ("skills", skills::QUOTE_AUTHOR, skills::PONEGLYPH_QUOTE),
            (
                "experience",
                experience::QUOTE_AUTHOR,
                experience::PONEGLYPH_QUOTE,
            ),
            (
                "projects",
                projects::QUOTE_AUTHOR,
                projects::PONEGLYPH_QUOTE,
            ),
            ("contact", contact::QUOTE_AUTHOR, contact::PONEGLYPH_QUOTE),
        ];

        for (section, author, quote) in quotes {
            for text in [author, quote] {
                assert!(!text.trim().is_empty(), "{section}: empty quote or author");
                for c in text.chars() {
                    assert!(
                        c.is_whitespace() || char_to_symbol(c).is_some(),
                        "{section}: {c:?} in {text:?} has no poneglyph glyph"
                    );
                }
            }
        }
    }
}
