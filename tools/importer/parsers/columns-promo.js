/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-promo. Base: columns.
 * Source: https://healthy.kaiserpermanente.org/health-wellness
 * Selector: .gs-banner .ds-banner
 * Output: 1 row, 2 cells: image | heading (H2) + body paragraph(s) + link.
 * The source header is a styled <div>; it is promoted to an H2.
 */
export default function parse(element, { document }) {
  const image = element.querySelector('.ds-banner__icon-img img') || element.querySelector('img');

  const headerEl = element.querySelector('.ds-banner__main-header')
    || element.querySelector('h1, h2, h3, h4');
  let heading = null;
  if (headerEl && headerEl.textContent.trim()) {
    heading = document.createElement(/^H[1-6]$/.test(headerEl.tagName) ? headerEl.tagName.toLowerCase() : 'h2');
    heading.textContent = headerEl.textContent.trim();
  }

  const bodyRoot = element.querySelector('.ds-banner__main-body');
  const body = bodyRoot
    ? [...bodyRoot.querySelectorAll('p')].filter((p) => p.textContent.trim())
    : [];
  if (bodyRoot && !body.length && bodyRoot.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = bodyRoot.textContent.trim();
    body.push(p);
  }

  const links = [...element.querySelectorAll('.ds-banner__main-action-button a[href]')]
    .filter((a) => a.textContent.trim())
    .map((a) => {
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.trim();
      const p = document.createElement('p');
      p.append(link);
      return p;
    });

  if (!heading && !body.length && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const text = [];
  if (heading) text.push(heading);
  text.push(...body, ...links);

  const cells = [[image || '', text]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
