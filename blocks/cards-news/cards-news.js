import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * Cards (news): compact news items - a circular icon beside a bold title and a
 * small underlined link. No card chrome.
 * Each row is one item: icon cell | text cell (heading + link).
 * A missing icon falls back to a text-only item.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = createTag('ul', { class: 'cards-news-list' });

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const iconCell = cells.find((c) => c.querySelector('picture, img, .icon') && !c.textContent.trim());
    const bodyCell = cells.find((c) => c !== iconCell && c.textContent.trim());
    if (!iconCell && !bodyCell) return;

    const li = createTag('li', { class: 'cards-news-item' });
    if (iconCell) {
      iconCell.className = 'cards-news-item-icon';
      li.append(iconCell);
    } else {
      li.classList.add('no-icon');
    }
    if (bodyCell) {
      bodyCell.className = 'cards-news-item-body';
      // News links are small inline text links, not buttons.
      bodyCell.querySelectorAll('a.button').forEach((a) => {
        a.classList.remove('button', 'primary', 'secondary');
        a.closest('.button-container')?.classList.remove('button-container');
      });
      li.append(bodyCell);
    }
    ul.append(li);
  });

  ul.querySelectorAll('.cards-news-item-icon img').forEach((img) => {
    const target = img.closest('picture') || img;
    if (/\.svg($|[?#])/i.test(img.getAttribute('src') || '')) {
      img.loading = 'lazy';
      target.replaceWith(img);
      return;
    }
    // Icons are decorative next to the title unless the author gave them alt text.
    target.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '96' }]));
  });

  block.replaceChildren(ul);
}
