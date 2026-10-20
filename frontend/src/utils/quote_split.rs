//! Splits a section quote across the slabs of a cluster so the 3 grids read as one inscription.

pub const CLUSTER_SLABS: usize = 3;

/// Whole-word runs of `quote` balanced by glyph count, borrowed from `quote`.
pub fn split_quote(quote: &str) -> [&str; CLUSTER_SLABS] {
    let words: Vec<(usize, usize)> = quote
        .split_whitespace()
        .map(|word| {
            let start = word.as_ptr() as usize - quote.as_ptr() as usize;
            (start, start + word.len())
        })
        .collect();
    let weights: Vec<usize> = quote
        .split_whitespace()
        .map(|w| w.chars().count())
        .collect();
    let n = words.len();
    let mut out = [""; CLUSTER_SLABS];
    if n < CLUSTER_SLABS {
        for (slot, &(start, end)) in out.iter_mut().zip(&words) {
            *slot = &quote[start..end];
        }
        return out;
    }
    let mut best: Option<(usize, usize, usize, usize, usize)> = None;
    for i in 1..n - 1 {
        for j in i + 1..n {
            let counts = [
                weights[..i].iter().sum::<usize>(),
                weights[i..j].iter().sum::<usize>(),
                weights[j..].iter().sum::<usize>(),
            ];
            let max = counts.iter().copied().max().unwrap_or(0);
            let min = counts.iter().copied().min().unwrap_or(0);
            let score = (max, max - min, counts[2], i, j);
            if best.is_none_or(|b| score < b) {
                best = Some(score);
            }
        }
    }
    if let Some((_, _, _, i, j)) = best {
        out[0] = &quote[words[0].0..words[i - 1].1];
        out[1] = &quote[words[i].0..words[j - 1].1];
        out[2] = &quote[words[j].0..words[n - 1].1];
    }
    out
}

/// `(author, fragment)` for slab `index`: the author goes on the last slab only.
pub fn slab_inscription<'a>(author: &'a str, quote: &'a str, index: usize) -> (&'a str, &'a str) {
    let author = if index == CLUSTER_SLABS - 1 {
        author
    } else {
        ""
    };
    (author, split_quote(quote).get(index).copied().unwrap_or(""))
}

#[cfg(test)]
mod tests {
    use super::{slab_inscription, split_quote};

    const SAMPLES: [&str; 2] = [
        "one two three four five six seven",
        "a bb ccc dddd eeeee ffffff",
    ];

    fn spread(counts: [usize; 3]) -> usize {
        counts.iter().max().unwrap() - counts.iter().min().unwrap()
    }

    #[test]
    fn keeps_every_word_once_in_order() {
        for quote in SAMPLES {
            let joined = split_quote(quote)
                .iter()
                .filter(|f| !f.is_empty())
                .copied()
                .collect::<Vec<_>>()
                .join(" ");
            assert_eq!(
                joined,
                quote.split_whitespace().collect::<Vec<_>>().join(" ")
            );
        }
    }

    #[test]
    fn balances_fragments_within_one_word() {
        assert_eq!(
            split_quote("one two three four five six seven"),
            ["one two three", "four five", "six seven"]
        );
        assert_eq!(
            split_quote("a bb ccc dddd eeeee ffffff"),
            ["a bb ccc", "dddd eeeee", "ffffff"]
        );
        for quote in SAMPLES {
            let weights: Vec<usize> = quote
                .split_whitespace()
                .map(|w| w.chars().count())
                .collect();
            let n = weights.len();
            let fragments = split_quote(quote);
            let mut cuts = [0usize; 2];
            let mut seen = 0;
            for (k, f) in fragments.iter().take(2).enumerate() {
                seen += f.split_whitespace().count();
                cuts[k] = seen;
            }
            let counts_for = |i: usize, j: usize| {
                [
                    weights[..i].iter().sum::<usize>(),
                    weights[i..j].iter().sum::<usize>(),
                    weights[j..].iter().sum::<usize>(),
                ]
            };
            let best = spread(counts_for(cuts[0], cuts[1]));
            for (di, dj) in [(-1i32, 0i32), (1, 0), (0, -1), (0, 1)] {
                let i = cuts[0] as i32 + di;
                let j = cuts[1] as i32 + dj;
                if i < 1 || j <= i || j as usize >= n {
                    continue;
                }
                assert!(spread(counts_for(i as usize, j as usize)) >= best);
            }
        }
    }

    #[test]
    fn pads_quotes_shorter_than_three_words() {
        assert_eq!(split_quote("one two"), ["one", "two", ""]);
        assert_eq!(split_quote(""), ["", "", ""]);
    }

    #[test]
    fn puts_the_author_on_the_last_slab_only() {
        assert_eq!(slab_inscription("Gol D Roger", "a b c", 0), ("", "a"));
        assert_eq!(slab_inscription("Gol D Roger", "a b c", 1), ("", "b"));
        assert_eq!(
            slab_inscription("Gol D Roger", "a b c", 2),
            ("Gol D Roger", "c")
        );
        assert_eq!(slab_inscription("Gol D Roger", "a b c", 3), ("", ""));
    }
}
