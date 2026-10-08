/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base: cards.
 * Source: https://healthy.kaiserpermanente.org/northern-california/front-door
 * Selector: .column-control:has(.gs-icon-link-text) > .column-control-container
 * Output: one row per item (.icon-link), 2 cells: icon | [H3 title + link paragraph].
 * Iterates the .icon-link div wrappers; the inline external-link icon and the
 * &nbsp; spacer paragraphs are dropped.
 */
export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.icon-link')]
    .filter((el) => el.querySelector('.icon-link-content, .icon-link-title'));

  const cells = [];
  items.forEach((item) => {
    const icon = item.querySelector('.icon-link-icon img') || item.querySelector(':scope > img');

    const text = [];
    const titleEl = item.querySelector('.icon-link-title') || item.querySelector('h2, h3, h4');
    const title = titleEl?.textContent.replace(/\s+/g, ' ').trim();
    if (title) {
      const h = document.createElement('h3');
      h.textContent = title;
      text.push(h);
    }

    const sub = item.querySelector('.icon-link-alt-subtitle, .icon-link-subtitle, .icon-link-content');
    if (sub) {
      // Inline external-link icons (data: svg) are decoration
      sub.querySelectorAll('.link-icon-wrapper').forEach((w) => w.remove());
      // "Opens in a new window, external" is an a11y hint for the source's new-window behaviour
      sub.querySelectorAll('a[title*="new window" i]').forEach((a) => a.removeAttribute('title'));
      sub.querySelectorAll('p').forEach((p) => {
        if (p.textContent.replace(/ /g, ' ').trim() && !p.closest('.icon-link-title')) text.push(p);
      });
    }

    if (!icon && !text.length) return;
    cells.push([icon || '', text]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
