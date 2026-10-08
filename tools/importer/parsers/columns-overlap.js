/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-overlap. Base: columns.
 * Source: https://healthy.kaiserpermanente.org/northern-california/front-door
 * Selectors: .gs-text-image .welcome-hero, .gs-text-image .welcome-story
 * Output: 1 row, 2 cells. Cell order sets the image side (block JS):
 *   image | text  -> photo left  (.welcome-hero--image-left)
 *   text  | image -> photo right (.welcome-story--image-right)
 * Text cell: heading (welcome-hero title -> H1, the source page has no H1;
 * other instances -> H2), description paragraphs, then each pill link
 * (.fd-button a) as a standalone link in its own paragraph.
 */
export default function parse(element, { document }) {
  // Image: .welcome-hero__image / .welcome-story__image (fallback: any img not inside the content)
  const image = element.querySelector('[class*="__image"] img')
    || [...element.querySelectorAll('img')].find((img) => !img.closest('[class*="__content"]'));

  const content = element.querySelector(':scope > [class*="__content"]') || element;

  // Title is a styled div inside <header> (no heading tag in source)
  const titleEl = content.querySelector('[class*="__content-title"]')
    || content.querySelector('h1, h2, h3, h4');
  const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';

  const isHero = element.matches('[class*="welcome-hero"]') && !element.matches('[class*="welcome-story"]');

  const text = [];
  if (titleText) {
    const h = document.createElement(isHero ? 'h1' : 'h2');
    h.textContent = titleText;
    text.push(h);
  }

  // Description paragraphs (welcome-story__content-description; the hero's button-list wrapper is empty)
  content.querySelectorAll('[class*="__content-description"] p').forEach((p) => {
    if (p.textContent.trim()) text.push(p);
  });

  // Pill links: one standalone link per paragraph. Drop the inline external-link icon.
  let links = [...content.querySelectorAll('.fd-button a[href]')];
  if (!links.length) links = [...content.querySelectorAll('[class*="__content-action"] a[href]')];
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

  if (!image && !text.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Preserve the visual image side: --image-right means text cell first.
  const imageRight = /--image-right\b/.test(element.className || '');
  const imageCell = image || '';
  const cells = [imageRight ? [text, imageCell] : [imageCell, text]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-overlap', cells });
  element.replaceWith(block);
}
