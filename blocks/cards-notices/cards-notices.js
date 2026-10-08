import { createTag } from '../../scripts/shared.js';

/**
 * Cards (notices): text-only notice items in a grid, each marked with a blue dot.
 * Each row is one notice: a single cell of rich text (paragraphs, bold, inline links).
 * Extra cells in a row are merged into the same notice.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = createTag('ul', { class: 'cards-notices-list' });

  [...block.children].forEach((row) => {
    const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('picture, img'));
    if (!cells.length) return;

    const body = cells[0];
    cells.slice(1).forEach((c) => body.append(...c.childNodes));
    body.className = 'cards-notices-item-body';

    // Notices use inline text links, never buttons.
    body.querySelectorAll('a.button').forEach((a) => {
      a.classList.remove('button', 'primary', 'secondary');
      a.closest('.button-container')?.classList.remove('button-container');
    });

    ul.append(createTag('li', { class: 'cards-notices-item' }, body));
  });

  block.replaceChildren(ul);
}
