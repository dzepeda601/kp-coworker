# Cards

Each row of the block is one card.

| Variant | Authoring | Row content |
|---|---|---|
| `Cards` (default) | Image cell + text cell (title, description, optional link) | Bordered cards in an auto-fill grid |
| `Cards (Links)` | One link per row | Cards built from the query index (image, title, description) |
| `Cards (Bento)` | Optional image, tag paragraph, heading, text | Feature grid; first card is featured |
| `Cards (Spotlight)` | Image cell + text cell: optional category line, linked title, description | Whole card clickable; with category lines it becomes the scrolling resources row |
| `Cards (Articles)` | Image cell + text cell: category line, linked title | Article teasers, whole card clickable |
| `Cards (Care)` | Icon cell + text cell: title, description, link | Icon inline with the title; last link becomes an outlined button |
| `Cards (News)` | Icon cell + text cell: title, link | Round icon beside the title; links stay text links |
| `Cards (Panels)` | Illustration cell + text cell: title, link | Side-by-side panels, illustration on the right |
| `Cards (Pillars)` | Optional illustration cell + text cell: title, text | Centered value propositions; animation-file links are ignored |
| `Cards (Notices)` | One rich-text cell | Text-only notices with a dot marker |

Spotlight, Articles, Care, News, Panels, Pillars and Notices share one decorator (`decorateVariant`)
configured by the `VARIANTS` table in `cards.js`, and one stylesheet with shared rules followed by
per-variant sections. `Cards (Tools)` is a separate block because it adds a "view all" toggle and a
label row for its button text.
