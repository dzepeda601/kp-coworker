/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-teaser. Base: cards.
 * Source: https://healthy.kaiserpermanente.org/northern-california/front-door
 * Selector: .fd-teaser .fd-teaser-container
 * Output: one row per panel (.teaser-container), 2 cells:
 *   illustration | H3 title + optional description + standalone CTA link.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .teaser-container')];
  if (!items.length) items = [...element.querySelectorAll('.teaser-text')].map((t) => t.parentElement);

  const cells = [];
  items.forEach((item) => {
    const image = item.querySelector('.teaser-image img') || item.querySelector('img');
    const textRoot = item.querySelector('.teaser-text') || item;

    const text = [];
    const titleEl = textRoot.querySelector('.teaser-title h1, .teaser-title h2, .teaser-title h3, .teaser-title h4')
      || textRoot.querySelector('h2, h3, h4') || textRoot.querySelector('.teaser-title');
    const title = titleEl?.textContent.replace(/\s+/g, ' ').trim();
    if (title) {
      const h = document.createElement('h3');
      h.textContent = title;
      text.push(h);
    }

    const desc = textRoot.querySelector('.teaser-description');
    if (desc && desc.textContent.trim()) {
      const paras = [...desc.querySelectorAll('p')].filter((p) => p.textContent.trim());
      if (paras.length) text.push(...paras);
      else {
        const p = document.createElement('p');
        p.textContent = desc.textContent.replace(/\s+/g, ' ').trim();
        text.push(p);
      }
    }

    let links = [...textRoot.querySelectorAll('.cta a[href]')];
    if (!links.length) links = [...textRoot.querySelectorAll('a[href]')];
    links.forEach((link) => {
      const label = link.textContent.replace(/\s+/g, ' ').trim();
      if (!label) return;
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = label;
      const p = document.createElement('p');
      p.append(a);
      text.push(p);
    });

    if (!image && !text.length) return;
    cells.push([image || '', text]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });
  element.replaceWith(block);
}
