import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * Cards (articles): article teasers with a top image, an eyebrow (category) line and a
 * linked title. Each row is one card: image cell | text cell (eyebrow paragraph + title).
 * The title link is stretched so the whole card is clickable.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = createTag('ul', { class: 'cards-articles-list' });

  [...block.children].forEach((row) => {
    const li = createTag('li', { class: 'cards-articles-card' });

    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'cards-articles-card-image';
        li.append(cell);
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-articles-card-body';
        li.append(cell);
      }
    });

    const body = li.querySelector('.cards-articles-card-body');
    if (!body) {
      if (li.children.length) ul.append(li);
      return;
    }

    // A plain-text paragraph before the title is the eyebrow/category line.
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    const children = [...body.children];
    const firstPara = body.querySelector(':scope > p');
    const beforeHeading = !heading || children.indexOf(firstPara) < children.indexOf(heading);
    if (firstPara && !firstPara.querySelector('a') && beforeHeading) {
      firstPara.classList.add('cards-articles-card-eyebrow');
    }

    const link = (heading && heading.querySelector('a[href]')) || body.querySelector('a[href]');
    if (link) {
      link.classList.remove('button', 'primary', 'secondary');
      link.parentElement?.classList.remove('button-container');
      link.classList.add('cards-articles-card-link');
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
