import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * Cards (spotlight): image-topped cards with a linked title and description.
 * Each row is one card: image cell | text cell (H3 title link + description).
 * The title link is stretched so the whole card is clickable.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = createTag('ul', { class: 'cards-spotlight-list' });

  [...block.children].forEach((row) => {
    const li = createTag('li', { class: 'cards-spotlight-card' });

    [...row.children].forEach((cell) => {
      const isImage = cell.querySelector('picture') && !cell.textContent.trim();
      if (isImage) {
        cell.className = 'cards-spotlight-card-image';
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-spotlight-card-body';
      } else {
        return; // skip empty cells
      }
      li.append(cell);
    });

    if (!li.children.length) return;

    // Optional category eyebrow: text-only paragraph(s) authored above the title heading.
    const body = li.querySelector('.cards-spotlight-card-body');
    const heading = body?.querySelector(':scope > :is(h2, h3, h4, h5, h6)');
    let lead = heading?.previousElementSibling;
    while (lead) {
      if (lead.tagName === 'P' && !lead.querySelector('a, picture, img') && lead.textContent.trim()) {
        lead.classList.add('cards-spotlight-card-eyebrow');
      }
      lead = lead.previousElementSibling;
    }

    // Stretch the first link (the title link) across the card.
    const link = li.querySelector('.cards-spotlight-card-body a[href]')
      || li.querySelector('a[href]');
    if (link) {
      link.classList.add('cards-spotlight-card-link');
      link.classList.remove('button');
      link.parentElement?.classList.remove('button-container');
      li.classList.add('is-linked');
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]),
    );
  });

  block.replaceChildren(ul);
}
