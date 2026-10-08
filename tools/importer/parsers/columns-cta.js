/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-cta. Base: columns.
 * Source: https://healthy.kaiserpermanente.org/northern-california/front-door
 * Selector: .why-kp .kp-care
 * Output: 1 row, 2 cells: [H3 heading + paragraph] | [standalone CTA link].
 * Source H4 heading is promoted to H3 (section intro heading is H2).
 */
export default function parse(element, { document }) {
  const titleEl = element.querySelector('h1, h2, h3, h4, h5, .header');
  const title = titleEl?.textContent.replace(/\s+/g, ' ').trim();

  const textCell = [];
  if (title) {
    const h = document.createElement('h3');
    h.textContent = title;
    textCell.push(h);
  }
  element.querySelectorAll('p').forEach((p) => {
    if (!p.closest('.fd-button') && p.textContent.replace(/ /g, ' ').trim()) textCell.push(p);
  });

  let links = [...element.querySelectorAll('.fd-button a[href]')];
  if (!links.length) links = [...element.querySelectorAll('a[href]')].filter((a) => !a.closest('p'));
  const actionCell = [];
  links.forEach((link) => {
    const label = link.textContent.replace(/\s+/g, ' ').trim();
    if (!label) return;
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.textContent = label;
    const p = document.createElement('p');
    p.append(a);
    actionCell.push(p);
  });

  if (!textCell.length && !actionCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell, actionCell.length ? actionCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
  element.replaceWith(block);
}
