import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Columns (promo): a compact boxed banner with an image beside text
 * (heading + paragraph + link). Authored as one row: image cell | text cell.
 * Extra rows render as additional banners; a missing image falls back to text-only.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-promo-row');
    let hasImage = false;

    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && !col.textContent.trim()) {
        col.classList.add('columns-promo-img-col');
        hasImage = true;
        const img = pic.querySelector('img');
        if (img) {
          pic.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '600' }]));
        }
      } else if (col.textContent.trim()) {
        col.classList.add('columns-promo-text-col');
        // Promo links render as plain text links, not buttons.
        col.querySelectorAll('a.button').forEach((a) => {
          a.classList.remove('button', 'primary', 'secondary');
          a.parentElement?.classList.remove('button-container');
        });
      } else {
        col.remove();
      }
    });

    if (!hasImage) row.classList.add('no-image');
  });
}
