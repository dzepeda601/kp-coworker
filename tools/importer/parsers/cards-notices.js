/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-notices. Base: cards (no images).
 * Source: https://healthy.kaiserpermanente.org/northern-california/front-door
 * Selector: .kp-alerts-bulletin .alerts-container
 * Output: one row per notice, 1 cell of rich text (paragraphs, bold, inline links).
 * The "Important notices" h2.page-heading inside the container is kept as default
 * content placed BEFORE the block (not swallowed into it, not dropped).
 */
export default function parse(element, { document }) {
  const heading = element.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > .page-heading');

  // Notice items: direct child wrappers (div.-column); fallback to any non-heading child block
  let items = [...element.querySelectorAll(':scope > [class*="column"]')];
  if (!items.length) {
    items = [...element.children].filter((c) => c !== heading && !/^H[1-6]$/.test(c.tagName));
  }

  const cells = [];
  items.forEach((item) => {
    const paras = [...item.querySelectorAll('p')].filter((p) => p.textContent.replace(/ /g, ' ').trim());
    let content = paras;
    if (!content.length && item.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...item.childNodes);
      content = [p];
    }
    if (content.length) cells.push([content]);
  });

  let headingEl = null;
  const headingText = heading?.textContent.replace(/\s+/g, ' ').trim();
  if (headingText) {
    headingEl = document.createElement('h2');
    headingEl.textContent = headingText;
  }

  if (!cells.length) {
    if (heading) heading.remove();
    if (headingEl) element.before(headingEl);
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (Notices)', cells });
  if (headingEl) element.before(headingEl);
  element.replaceWith(block);
}
