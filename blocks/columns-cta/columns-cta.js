import { createTag } from '../../scripts/shared.js';

const squash = (text) => text.replace(/\s+/g, '');

/** True when an element's only text is its link(s). */
const isLinkOnly = (el) => {
  const links = [...el.querySelectorAll('a[href]')];
  return links.length > 0
    && squash(el.textContent) === squash(links.map((a) => a.textContent).join(''));
};

/**
 * Columns (cta): a centered white box with text (heading + paragraph) on the left
 * and a pill call-to-action button on the right.
 * Authored as one row: text cell | link cell. If everything is authored in one cell,
 * the trailing standalone link(s) become the action column.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-cta-row');
    const cells = [...row.children].filter((c) => {
      if (c.textContent.trim() || c.querySelector('picture, img')) return true;
      c.remove();
      return false;
    });

    let actionCell = cells.length > 1 ? cells.find(isLinkOnly) : undefined;
    const textCell = cells.find((c) => c !== actionCell);

    if (!actionCell && textCell) {
      // Single-cell authoring: split the trailing link-only paragraphs out.
      const trailing = [];
      let last = textCell.lastElementChild;
      while (last && last.tagName === 'P' && isLinkOnly(last)) {
        trailing.unshift(last);
        last = last.previousElementSibling;
      }
      if (trailing.length && trailing.length < textCell.children.length) {
        actionCell = createTag('div', {}, trailing);
        row.append(actionCell);
      }
    }

    if (textCell) textCell.className = 'columns-cta-text';
    if (actionCell) {
      actionCell.className = 'columns-cta-action';
      actionCell.querySelectorAll('a[href]').forEach((a) => {
        a.classList.add('button');
        a.parentElement?.classList.add('button-container');
      });
      row.append(actionCell);
    }
  });
}
