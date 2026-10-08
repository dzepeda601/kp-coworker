/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-wellness. Base: hero.
 * Source: https://healthy.kaiserpermanente.org/health-wellness
 * Selector: .gs-heroPattern .ds-hero
 * Output: row 1 = background image; row 2 = H1 + description paragraphs + optional CTAs.
 */
export default function parse(element, { document }) {
  const image = element.querySelector('img.ds-hero__background-image')
    || element.querySelector('img');
  const heading = element.querySelector('.cmp-teaser__title')
    || element.querySelector('h1, h2');

  // Description: only non-empty paragraphs (source has empty spacer <p>s)
  const descRoot = element.querySelector('.cmp-teaser__description');
  const paragraphs = descRoot
    ? [...descRoot.querySelectorAll('p')].filter((p) => p.textContent.trim())
    : [...element.querySelectorAll('p')].filter((p) => p.textContent.trim());

  // Optional CTAs (empty on the current source, kept for other pages)
  const ctas = [...element.querySelectorAll('.cmp-teaser__action-container a, .cmp-button-container a')]
    .filter((a, i, arr) => arr.indexOf(a) === i && a.textContent.trim());

  if (!heading && !paragraphs.length && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Source alt is sometimes just the file name; treat the photo as decorative then
  if (image && /\.(png|jpe?g|gif|webp|svg)$/i.test((image.getAttribute('alt') || '').trim())) {
    image.setAttribute('alt', '');
  }

  const cells = [];
  if (image) cells.push([image]);
  const contentCell = [];
  if (heading) contentCell.push(heading);
  contentCell.push(...paragraphs);
  ctas.forEach((a) => {
    const p = document.createElement('p');
    p.append(a);
    contentCell.push(p);
  });
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-wellness', cells });
  element.replaceWith(block);
}
