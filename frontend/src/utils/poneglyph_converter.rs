/// Maps a character to its Poneglyph SVG symbol path.
pub fn char_to_symbol(c: char) -> Option<&'static str> {
    match c.to_ascii_lowercase() {
        'a' => Some("/symbols/svg/letters/a.svg"),
        'd' => Some("/symbols/svg/letters/d.svg"),
        'e' => Some("/symbols/svg/letters/e.svg"),
        'f' => Some("/symbols/svg/letters/f.svg"),
        'g' => Some("/symbols/svg/letters/g.svg"),
        'i' => Some("/symbols/svg/letters/i.svg"),
        'j' => Some("/symbols/svg/letters/j.svg"),
        'l' => Some("/symbols/svg/letters/l.svg"),
        'm' => Some("/symbols/svg/letters/m.svg"),
        'n' => Some("/symbols/svg/letters/n.svg"),
        'o' => Some("/symbols/svg/letters/o.svg"),
        'p' => Some("/symbols/svg/letters/p.svg"),
        'r' => Some("/symbols/svg/letters/r.svg"),
        't' => Some("/symbols/svg/letters/t.svg"),
        'u' => Some("/symbols/svg/letters/u.svg"),
        'x' => Some("/symbols/svg/letters/x.svg"),
        'b' | 'v' => Some("/symbols/svg/letters/bv.svg"),
        'k' | 'q' | 'c' => Some("/symbols/svg/letters/kqc.svg"),
        's' | 'z' => Some("/symbols/svg/letters/szc.svg"),
        'y' => Some("/symbols/svg/letters/yll.svg"),
        'h' => Some("/symbols/svg/letters/g.svg"),
        'w' => Some("/symbols/svg/letters/u.svg"),
        '0' => Some("/symbols/svg/numbers/0.svg"),
        '1' => Some("/symbols/svg/numbers/1.svg"),
        '2' => Some("/symbols/svg/numbers/2.svg"),
        '3' => Some("/symbols/svg/numbers/3.svg"),
        '4' => Some("/symbols/svg/numbers/4.svg"),
        '5' => Some("/symbols/svg/numbers/5.svg"),
        '6' => Some("/symbols/svg/numbers/6.svg"),
        '7' => Some("/symbols/svg/numbers/7.svg"),
        '8' => Some("/symbols/svg/numbers/8.svg"),
        '9' => Some("/symbols/svg/numbers/9.svg"),
        _ => None,
    }
}

const AVAILABLE_CHARS: &[char] = &[
    'a', 'd', 'e', 'f', 'g', 'i', 'j', 'l', 'm', 'n', 'o', 'p', 'r', 't', 'u', 'x', 'b', 'v',
    'k', 'q', 'c', 's', 'z', 'y', 'h', 'w', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
];

/// Converts text to an array of Poneglyph symbol paths.
/// Spaces become None (rendered as empty space).
pub fn text_to_symbols(text: &str) -> Vec<Option<&'static str>> {
    text.chars()
        .map(|c| if c == ' ' { None } else { char_to_symbol(c) })
        .collect()
}

fn generate_random_symbols(count: usize) -> String {
    (0..count)
        .map(|_| AVAILABLE_CHARS[fastrand::usize(..AVAILABLE_CHARS.len())])
        .collect()
}

/// Converts text to a grid of symbol paths with author and quote integrated.
/// Layout: random -> blank -> author -> blank -> random -> blank -> quote -> blank -> random
pub fn text_to_centered_symbol_grid(
    author: &str,
    quote: &str,
    columns: usize,
    rows: usize,
) -> Vec<Vec<Option<&'static str>>> {
    let author_no_spaces: String = author.chars().filter(|c| !c.is_whitespace()).collect();
    let quote_no_spaces: String = quote.chars().filter(|c| !c.is_whitespace()).collect();
    let author_symbols = text_to_symbols(&author_no_spaces);
    let quote_symbols = text_to_symbols(&quote_no_spaces);

    let total_space = columns * rows;
    let fixed_content_length = author_symbols.len() + quote_symbols.len() + 4;
    let available_for_random = total_space.saturating_sub(fixed_content_length);
    let random_suite_length = available_for_random / 3;

    let random_suite_text = generate_random_symbols(random_suite_length);
    let random_suite = text_to_symbols(&random_suite_text);

    let mut content_array: Vec<Option<&'static str>> = Vec::new();
    content_array.extend_from_slice(&random_suite);
    content_array.push(None);
    content_array.extend_from_slice(&author_symbols);
    content_array.push(None);
    content_array.extend_from_slice(&random_suite);
    content_array.push(None);
    content_array.extend_from_slice(&quote_symbols);
    content_array.push(None);
    content_array.extend_from_slice(&random_suite);

    let mut content_lines: Vec<Vec<Option<&'static str>>> = Vec::new();
    let mut current_line: Vec<Option<&'static str>> = Vec::new();
    let mut content_index = 0;

    while content_index < content_array.len() {
        let remaining_in_line = columns - current_line.len();
        let remaining_content = content_array.len() - content_index;

        if remaining_in_line >= remaining_content {
            current_line.extend_from_slice(&content_array[content_index..]);
            content_index = content_array.len();
        } else {
            let end = content_index + remaining_in_line;
            current_line.extend_from_slice(&content_array[content_index..end]);
            content_index = end;
        }

        if current_line.len() >= columns || content_index >= content_array.len() {
            if current_line.len() < columns {
                let remaining = columns - current_line.len();
                let extra = generate_random_symbols(remaining);
                current_line.extend(text_to_symbols(&extra));
            } else if current_line.len() > columns {
                current_line.truncate(columns);
            }
            content_lines.push(current_line.clone());
            current_line.clear();
        }
    }

    let actual_rows = rows.max(content_lines.len());
    let content_start_row = (actual_rows.saturating_sub(content_lines.len())) / 2;
    let mut grid: Vec<Vec<Option<&'static str>>> = Vec::with_capacity(actual_rows);

    for row in 0..actual_rows {
        let content_line_index = row as isize - content_start_row as isize;
        if content_line_index >= 0 && (content_line_index as usize) < content_lines.len() {
            grid.push(content_lines[content_line_index as usize].clone());
        } else {
            let random_text = generate_random_symbols(columns);
            grid.push(text_to_symbols(&random_text));
        }
    }

    grid
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_char_to_symbol_letters() {
        assert_eq!(char_to_symbol('a'), Some("/symbols/svg/letters/a.svg"));
        assert_eq!(char_to_symbol('A'), Some("/symbols/svg/letters/a.svg"));
        assert_eq!(char_to_symbol('b'), Some("/symbols/svg/letters/bv.svg"));
        assert_eq!(char_to_symbol('v'), Some("/symbols/svg/letters/bv.svg"));
    }

    #[test]
    fn test_char_to_symbol_numbers() {
        assert_eq!(char_to_symbol('0'), Some("/symbols/svg/numbers/0.svg"));
        assert_eq!(char_to_symbol('9'), Some("/symbols/svg/numbers/9.svg"));
    }

    #[test]
    fn test_char_to_symbol_unknown() {
        assert_eq!(char_to_symbol('!'), None);
        assert_eq!(char_to_symbol('@'), None);
    }

    #[test]
    fn test_text_to_symbols_with_spaces() {
        let result = text_to_symbols("a b");
        assert_eq!(result.len(), 3);
        assert!(result[0].is_some());
        assert!(result[1].is_none());
        assert!(result[2].is_some());
    }

    #[test]
    fn test_grid_dimensions() {
        let grid = text_to_centered_symbol_grid("test", "hello", 10, 5);
        assert!(grid.len() >= 5);
        for row in &grid {
            assert_eq!(row.len(), 10);
        }
    }
}
