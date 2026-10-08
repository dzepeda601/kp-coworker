import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * Hero (wellness): full-bleed background image with a text card (H1 + intro)
 * overlaid on the left. Authored as rows: image row, then text row.
 * Tolerates the image and text in the same row, or no image at all.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const media = createTag('div', { class: 'hero-wellness-media' });
  const content = createTag('div', { class: 'hero-wellness-content' });
  const card = createTag('div', { class: 'hero-wellness-card' });
  content.append(card);

  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt || '', true, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ])
      : picture;
    // the hero photo is the page's LCP image
    optimized.querySelector('img')?.setAttribute('fetchpriority', 'high');
    media.append(optimized);
  } else {
    block.classList.add('no-image');
  }

  // Collect all non-image content from every authored cell, preserving order.
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      // A single-line cell may hold a bare text node instead of a <p>.
      if (!cell.children.length && cell.textContent.trim()) {
        card.append(createTag('p', {}, cell.textContent.trim()));
        return;
      }
      [...cell.children].forEach((el) => {
        const isImageOnly = el.tagName === 'PICTURE'
          || (el.querySelector('picture') && !el.textContent.trim());
        if (!isImageOnly) card.append(el);
      });
    });
  });

  block.replaceChildren(...(picture ? [media] : []), content);
}
