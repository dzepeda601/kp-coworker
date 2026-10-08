/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-tools. Base: cards.
 * Source: https://healthy.kaiserpermanente.org/health-wellness
 * Selector: .gs-show-more-less .show-more-less:not(.--inline)
 * Output: one 1-cell row per tool tile (H3 + summary + link), across all
 * visible and hidden (.show-more-less-group) card groups, then a final
 * plain-text row with the toggle label (count stripped), e.g. "View all tools for you".
 */
export default function parse(element, { document }) {
  // Iterate the tile wrappers (div), never the links
  let tiles = [...element.querySelectorAll('.gs-card-outer')];
  if (!tiles.length) tiles = [...element.querySelectorAll('.ds-card__content')];

  const cells = [];
  tiles.forEach((tile) => {
    const titleEl = tile.querySelector('.ds-card__title h2, .ds-card__title h3, .ds-card__title h4')
      || tile.querySelector('.ds-card__title, h2, h3, h4');
    const summary = [...tile.querySelectorAll('.ds-card__summary p, .ds-card__subtitle p')]
      .filter((p) => p.textContent.trim());
    const linkEls = [...tile.querySelectorAll('.ds-card__links-container a[href]')];
    if (!linkEls.length) {
      const a = tile.querySelector('a[href]');
      if (a) linkEls.push(a);
    }

    const content = [];
    if (titleEl && titleEl.textContent.trim()) {
      const h = document.createElement(/^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : 'h3');
      h.textContent = titleEl.textContent.replace(/\s+/g, ' ').trim();
      content.push(h);
    }
    content.push(...summary);
    linkEls.forEach((a) => {
      const text = a.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return;
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = text;
      const p = document.createElement('p');
      p.append(link);
      content.push(p);
    });
    if (content.length) cells.push([content]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Final label row: toggle text from source without the "(N)" count
  const toggle = element.querySelector('.show-more-less-toggle');
  const label = (toggle && toggle.textContent.replace(/\(\s*\d+\s*\)/, '').replace(/\s+/g, ' ').trim())
    || 'View all tools for you';
  const labelP = document.createElement('p');
  labelP.textContent = label;
  // Collapse label used by the source once expanded
  const lessP = document.createElement('p');
  lessP.textContent = 'View less';
  cells.push([[labelP, lessP]]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tools', cells });
  element.replaceWith(block);
}
