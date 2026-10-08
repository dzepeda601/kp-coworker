import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

const isAnimationLink = (cell) => {
  const links = cell.querySelectorAll('a[href]');
  return links.length === 1
    && cell.textContent.trim() === links[0].textContent.trim()
    && /\.(json|lottie)($|[?#])/i.test(links[0].getAttribute('href'));
};

/**
 * Cards (pillars): centered value propositions without card chrome.
 * Each row is one pillar: optional illustration cell | text cell (heading + paragraphs).
 * The illustration is optional - a pillar with no image (or only an unsupported
 * animation link, e.g. a Lottie .json) renders as heading + text only.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = createTag('ul', { class: 'cards-pillars-list' });

  [...block.children].forEach((row) => {
    const cells = [...row.children].filter((c) => !isAnimationLink(c));
    let imageCell = cells.find((c) => c.querySelector('picture, img, svg') && !c.textContent.trim());
    const bodyCell = cells.find((c) => c !== imageCell && c.textContent.trim());
    if (!imageCell && !bodyCell) return;

    // Also accept an illustration authored as the first paragraph of the text cell.
    const leadPic = !imageCell && bodyCell.firstElementChild;
    if (leadPic?.tagName === 'P' && leadPic.querySelector('picture, img') && !leadPic.textContent.trim()) {
      imageCell = createTag('div', {}, [...leadPic.childNodes]);
      leadPic.remove();
    }

    const li = createTag('li', { class: 'cards-pillars-card' });
    if (imageCell) {
      imageCell.className = 'cards-pillars-card-image';
      li.append(imageCell);
    } else {
      li.classList.add('no-image');
    }
    if (bodyCell) {
      bodyCell.className = 'cards-pillars-card-body';
      // Pillar links read as inline text links, not buttons.
      bodyCell.querySelectorAll('a.button').forEach((a) => {
        a.classList.remove('button', 'primary', 'secondary');
        a.closest('.button-container')?.classList.remove('button-container');
      });
      li.append(bodyCell);
    }
    ul.append(li);
  });

  ul.querySelectorAll('.cards-pillars-card-image img').forEach((img) => {
    const target = img.closest('picture') || img;
    if (/\.svg($|[?#])/i.test(img.getAttribute('src') || '')) {
      img.loading = 'lazy';
      target.replaceWith(img);
      return;
    }
    // Illustrations are decorative unless the author gave them alt text.
    target.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
}
