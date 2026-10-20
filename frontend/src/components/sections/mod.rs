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
    use crate::utils::quote_split::split_quote;

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

    #[test]
    fn cluster_quotes_split_into_mappable_fragments() {
        assert_eq!(
            split_quote(experience::PONEGLYPH_QUOTE),
            ["I left", "everything I own", "in that place"]
        );
        assert_eq!(
            split_quote(projects::PONEGLYPH_QUOTE),
            ["I am going", "to be the", "Pirate King"]
        );
        for quote in [experience::PONEGLYPH_QUOTE, projects::PONEGLYPH_QUOTE] {
            for fragment in split_quote(quote) {
                assert!(!fragment.is_empty(), "empty fragment in {quote:?}");
                for c in fragment.chars() {
                    assert!(
                        c == ' ' || char_to_symbol(c).is_some(),
                        "{c:?} in {fragment:?} has no poneglyph glyph"
                    );
                }
            }
        }
    }
}
