/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-pillars. Base: cards.
 * Source: https://healthy.kaiserpermanente.org/northern-california/front-door
 * Selector: .why-kp .kp-section-container
 * Output: one row per pillar (.kp-section), text-only (1 cell): H3 title + paragraphs.
 * Illustrations are Lottie animations (<lottie-player src="*.json">) with no static
 * image, so no image cell and no link to the .json file is emitted. A real <img>
 * illustration, if present on another page, is kept as a leading image cell.
 * Source H4 titles are promoted to H3 (section intro heading is H2).
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .kp-section')];
  if (!items.length) items = [...element.querySelectorAll('.image-content')].map((c) => c.closest('.kp-section') || c.parentElement);

  const rows = [];
  items.forEach((item) => {
    const content = item.querySelector('.image-content') || item;
    const image = item.querySelector('.kp-section__image img, img');

    const text = [];
    const titleEl = content.querySelector('h1, h2, h3, h4, h5, .header');
    const title = titleEl?.textContent.replace(/\s+/g, ' ').trim();
    if (title) {
      const h = document.createElement('h3');
      h.textContent = title;
      text.push(h);
    }
    // Paragraphs; skip &nbsp; spacer paragraphs
    content.querySelectorAll('p').forEach((p) => {
      if (p.textContent.replace(/ /g, ' ').trim()) text.push(p);
    });

    if (!text.length && !image) return;
    rows.push({ image, text });
  });

  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Keep every row the same width: 2 cells only when at least one pillar has a real image.
  const hasImages = rows.some((r) => r.image);
  const cells = rows.map((r) => (hasImages ? [r.image || '', r.text] : [r.text]));

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (Pillars)', cells });
  element.replaceWith(block);
}
