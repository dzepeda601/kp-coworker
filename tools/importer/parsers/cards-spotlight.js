/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-spotlight. Base: cards.
 * Sources / selectors:
 *  - https://healthy.kaiserpermanente.org/health-wellness
 *    .column-control.margin-bottom-4u .gs-card-group .ds-card-group
 *    (cards: .gs-card-outer > a.ds-card)
 *  - https://healthy.kaiserpermanente.org/northern-california/front-door
 *    .dynamic-content-carousel .carousel-thumbstrip-no-conflict
 *    (cards: .carousel__item > a.dcc-carousel__card with -category / -title / -body)
 * Output: one row per card, 2 cells: image | [eyebrow p (carousel only)] + linked H3 title + summary.
 * Iterates the div wrappers (.gs-card-outer / .carousel__item), never the clickable
 * anchors, so html2md inline-merging of sibling anchors cannot collapse the cards.
 */

// Front-door dynamic content carousel cards.
function parseCarouselItems(items, document) {
  const cells = [];
  items.forEach((item) => {
    const card = item.querySelector('a[href]');
    const image = item.querySelector('img');
    const href = card?.getAttribute('href');
    const categoryEl = item.querySelector('[class*="category"]');
    const titleEl = item.querySelector('[class*="title"]') || item.querySelector('h2, h3, h4');
    const bodyEl = item.querySelector('[class*="body"]');

    const text = [];
    const category = categoryEl?.textContent.replace(/\s+/g, ' ').trim();
    if (category) {
      const p = document.createElement('p');
      p.textContent = category;
      text.push(p);
    }
    const title = titleEl?.textContent.replace(/\s+/g, ' ').trim();
    if (title) {
      const h = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        h.append(a);
      } else {
        h.textContent = title;
      }
      text.push(h);
    }
    if (bodyEl) {
      const paras = [...bodyEl.querySelectorAll('p')].filter((p) => p.textContent.trim());
      if (paras.length) {
        text.push(...paras);
      } else if (bodyEl.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = bodyEl.textContent.replace(/\s+/g, ' ').trim();
        text.push(p);
      }
    }
    if (!image && !text.length) return;
    cells.push([image || '', text]);
  });
  return cells;
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .gs-card-outer')];

  // Front-door carousel: no .gs-card-outer wrappers, cards live in .carousel__item
  if (!items.length) {
    const carouselItems = [...element.querySelectorAll('.carousel__item')]
      .filter((item) => !item.closest('.hidden-card') && !item.matches('.hidden-card'));
    if (carouselItems.length) {
      const carouselCells = parseCarouselItems(carouselItems, document);
      if (!carouselCells.length) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const block = WebImporter.Blocks.createBlock(document, { name: 'cards-spotlight', cells: carouselCells });
      element.replaceWith(block);
      return;
    }
  }

  if (!items.length) items = [...element.querySelectorAll('.ds-card__content')].map((c) => c.closest('.gs-card-outer') || c.parentElement);

  const cells = [];
  items.forEach((item) => {
    const image = item.querySelector('.ds-card__image img, img');
    const titleEl = item.querySelector('.ds-card__title h1, .ds-card__title h2, .ds-card__title h3, .ds-card__title h4')
      || item.querySelector('h2, h3, h4');
    const href = item.querySelector('a.ds-card[href]')?.getAttribute('href')
      || item.querySelector('a[href]')?.getAttribute('href');
    const summary = [...item.querySelectorAll('.ds-card__summary p, .ds-card__subtitle p')]
      .filter((p) => p.textContent.trim());

    const text = [];
    if (titleEl) {
      const h = document.createElement(/^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : 'h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = titleEl.textContent.trim();
        h.append(a);
      } else {
        h.textContent = titleEl.textContent.trim();
      }
      text.push(h);
    }
    text.push(...summary);
    if (!image && !text.length) return;
    cells.push([image || '', text]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-spotlight', cells });
  element.replaceWith(block);
}
