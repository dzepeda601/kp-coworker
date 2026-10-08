import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * Cards (care): contact/action cards with a small icon inline with the title,
 * a description and a pill call-to-action button.
 * Each row is one card: icon cell | text cell (H3 + description + link).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = createTag('ul', { class: 'cards-care-list' });

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const iconCell = cells.find((c) => c.querySelector('picture, .icon') && !c.textContent.trim());
    const bodyCell = cells.find((c) => c !== iconCell && c.textContent.trim());
    if (!iconCell && !bodyCell) return;

    const li = createTag('li', { class: 'cards-care-card' });
    const body = bodyCell || createTag('div');
    body.className = 'cards-care-card-body';

    // Place the icon inline with the title, in a shared header row.
    // Also accept an icon authored in the same cell as the text.
    const icon = iconCell?.querySelector('picture, .icon')
      || body.querySelector(':scope > p > picture, :scope > picture');
    const iconPara = icon?.parentElement?.tagName === 'P' && icon.parentElement.closest('.cards-care-card-body')
      ? icon.parentElement : null;
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (icon) {
      const iconWrap = createTag('span', { class: 'cards-care-card-icon' }, icon);
      const header = createTag('div', { class: 'cards-care-card-header' }, iconWrap);
      if (heading) {
        heading.before(header);
        header.append(heading);
      } else {
        body.prepend(header);
      }
      if (iconPara && !iconPara.textContent.trim() && !iconPara.children.length) iconPara.remove();
    }

    // The last link-only paragraph is the card's call to action (outlined pill button).
    const ctaPara = [...body.querySelectorAll(':scope > p')].reverse().find((p) => {
      const a = p.querySelector('a[href]');
      return a && p.textContent.trim() === a.textContent.trim();
    });
    if (ctaPara) {
      ctaPara.classList.add('cards-care-card-cta');
      const a = ctaPara.querySelector('a[href]');
      a.classList.remove('primary');
      a.classList.add('button', 'secondary');
    }

    li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    // Imported icons are usually SVG <img>s: vector files need no raster/webp renditions,
    // so keep the original image instead of emitting a mismatched webp <source>.
    if (/\.svg($|[?#])/i.test(img.getAttribute('src') || '')) {
      img.loading = 'lazy';
      img.closest('picture').replaceWith(img);
      return;
    }
    // Icons are decorative next to the title unless the author gave them alt text.
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt || '', false, [{ width: '96' }]),
    );
  });

  block.replaceChildren(ul);
}
