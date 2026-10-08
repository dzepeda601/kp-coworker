import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * Cards (teaser): resource teaser panels side by side, separated by a vertical rule.
 * Each row is one panel: illustration cell | text cell (heading + link).
 * The text sits on the left and the illustration on the right, whatever the cell order.
 * A missing illustration falls back to a text-only panel.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = createTag('ul', { class: 'cards-teaser-list' });

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img') && !c.textContent.trim());
    const bodyCell = cells.find((c) => c !== imageCell && c.textContent.trim());
    if (!imageCell && !bodyCell) return;

    const li = createTag('li', { class: 'cards-teaser-card' });
    if (bodyCell) {
      bodyCell.className = 'cards-teaser-card-body';
      li.append(bodyCell);
    }
    if (imageCell) {
      imageCell.className = 'cards-teaser-card-image';
      li.append(imageCell);
    } else {
      li.classList.add('no-image');
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img, .cards-teaser-card-image > img').forEach((img) => {
    const target = img.closest('picture') || img;
    // Illustrations are often SVG: keep vector files as-is (no raster renditions).
    if (/\.svg($|[?#])/i.test(img.getAttribute('src') || '')) {
      img.loading = 'lazy';
      target.replaceWith(img);
      return;
    }
    // Illustrations are decorative unless the author gave them alt text.
    target.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '400' }]));
  });

  block.replaceChildren(ul);
}
