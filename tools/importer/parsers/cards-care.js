/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-care. Base: cards.
 * Source: https://healthy.kaiserpermanente.org/health-wellness
 * Selector: .cmp-dynamicexperiencefragment--get-care-module .aem-Grid > .column-control:nth-of-type(2) .rows
 * Output: one row per card, 2 cells: icon image | H3 + description + link.
 * Iterates the div.columns-4 column wrappers.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > [class*="columns-"]')];
  if (!items.length) items = [...element.querySelectorAll('.ds-icon-with-text')].map((c) => c.parentElement);

  const cells = [];
  items.forEach((item) => {
    const icon = item.querySelector('.cmp-image img') || item.querySelector('img');
    const titleEl = item.querySelector('h1, h2, h3, h4');

    // Description: text components outside the icon/title container, skipping spacer-only ones
    const descriptions = [...item.querySelectorAll(':scope > .text .cmp-text')]
      .filter((t) => t.textContent.replace(/ /g, ' ').trim())
      .map((t) => {
        const p = document.createElement('p');
        p.textContent = t.textContent.replace(/\s+/g, ' ').trim();
        return p;
      });

    const links = [...item.querySelectorAll('.gs-button a, a.button')]
      .filter((a, i, arr) => arr.indexOf(a) === i && a.textContent.trim())
      .map((a) => {
        const link = document.createElement('a');
        link.href = a.getAttribute('href') || '#';
        link.textContent = a.textContent.replace(/\s+/g, ' ').trim();
        if (a.title) link.title = a.title;
        const p = document.createElement('p');
        p.append(link);
        return p;
      });

    const text = [];
    if (titleEl && titleEl.textContent.trim()) {
      const h = document.createElement('h3');
      h.textContent = titleEl.textContent.replace(/\s+/g, ' ').trim();
      text.push(h);
    }
    text.push(...descriptions, ...links);
    if (!icon && !text.length) return;
    cells.push([icon || '', text]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (Care)', cells });
  element.replaceWith(block);
}
