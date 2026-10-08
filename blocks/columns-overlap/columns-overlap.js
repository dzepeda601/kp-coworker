import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * Columns (overlap): a large photo with a white text card overlapping its opposite side.
 * Authored as one row per feature: image cell | text cell. The cell order sets the side:
 * image first = photo left / card right; text first = card left / photo right.
 * The text cell holds a heading, optional paragraphs and one or more standalone links,
 * which render as a wrapping row of pill buttons.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Only the page's leading photo is the LCP: load it eagerly when this block opens the
  // first section. Later overlap blocks (e.g. the mirrored second feature) load lazily.
  const wrapper = block.parentElement;
  const eager = !block.closest('.section')?.previousElementSibling
    && !wrapper?.previousElementSibling;

  [...block.children].forEach((row) => {
    row.classList.add('columns-overlap-row');
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img') && !c.textContent.trim());
    const textCell = cells.find((c) => c !== imageCell && c.textContent.trim());
    cells.forEach((c) => {
      if (c !== imageCell && c !== textCell) c.remove();
    });

    if (imageCell) {
      imageCell.className = 'columns-overlap-image';
      const img = imageCell.querySelector('img');
      if (img) {
        const pic = createOptimizedPicture(img.src, img.alt || '', eager, [
          { media: '(min-width: 900px)', width: '1600' },
          { width: '900' },
        ]);
        if (eager) pic.querySelector('img')?.setAttribute('fetchpriority', 'high');
        imageCell.replaceChildren(pic);
      }
    }

    if (textCell) {
      textCell.className = 'columns-overlap-text';

      // Group each run of standalone links (pill buttons) into one wrapping row.
      let group = null;
      [...textCell.children].forEach((child) => {
        if (child.matches('p.button-container')) {
          if (!group) {
            group = createTag('div', { class: 'columns-overlap-links' });
            child.before(group);
          }
          group.append(child);
        } else {
          group = null;
        }
      });
    }

    if (!imageCell) row.classList.add('no-image');
    else if (textCell && cells.indexOf(textCell) < cells.indexOf(imageCell)) {
      row.classList.add('image-right');
    } else {
      row.classList.add('image-left');
    }
  });
}
