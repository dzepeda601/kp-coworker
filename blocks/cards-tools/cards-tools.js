import { createTag, unbuttonLinks } from '../../scripts/shared.js';

/** Number of tiles visible before the "view all" toggle. */
const VISIBLE_COUNT = 6;

/**
 * Fallback toggle labels, used only when the author supplies none.
 * Authors localize by adding a final row containing only plain text (no heading, no link):
 * its first paragraph is the "view all" label, the optional second the "show fewer" label.
 */
const FALLBACK_LABELS = { more: 'View all', less: 'Show fewer' };

let instanceCount = 0;

/**
 * A row with text but no heading, link, or image is a label row, not a tile.
 * @param {Element} row
 * @returns {boolean}
 */
function isLabelRow(row) {
  return !!row.textContent.trim() && !row.querySelector('h1, h2, h3, h4, h5, h6, a, picture');
}

/**
 * Text lines of a label row: its paragraphs, or the bare text of each cell.
 * @param {Element} row
 * @returns {string[]}
 */
function labelLines(row) {
  const paras = [...row.querySelectorAll('p')].map((p) => p.textContent.trim()).filter(Boolean);
  if (paras.length) return paras;
  return [...row.children].map((cell) => cell.textContent.trim()).filter(Boolean);
}

/**
 * Cards (tools): text-only tiles (title + description + link) in a 3-up grid,
 * with a "view all" toggle after the first VISIBLE_COUNT tiles.
 * Each row is one tile; an optional final plain-text row supplies the toggle labels.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  instanceCount += 1;
  const rows = [...block.children];
  const lastRow = rows[rows.length - 1];
  const authoredLabels = lastRow && rows.length > 1 && isLabelRow(lastRow) ? labelLines(lastRow) : [];
  if (authoredLabels.length) rows.pop();
  const labels = {
    more: authoredLabels[0] || FALLBACK_LABELS.more,
    less: authoredLabels[1] || FALLBACK_LABELS.less,
  };

  const listId = `cards-tools-list-${instanceCount}`;
  const ul = createTag('ul', { class: 'cards-tools-list', id: listId });

  rows.filter((row) => row.textContent.trim()).forEach((row) => {
    const li = createTag('li', { class: 'cards-tools-card' });
    const body = createTag('div', { class: 'cards-tools-card-body' });
    [...row.children].forEach((cell) => {
      if (!cell.children.length && cell.textContent.trim()) {
        body.append(createTag('p', {}, cell.textContent.trim()));
      } else {
        body.append(...cell.children);
      }
    });

    // Tool links render as text links, not buttons.
    unbuttonLinks(body);
    const lastLink = [...body.querySelectorAll(':scope > p')].pop();
    if (lastLink?.querySelector('a') && lastLink.textContent.trim() === lastLink.querySelector('a').textContent.trim()) {
      lastLink.classList.add('cards-tools-card-cta');
    }

    li.append(body);
    if (ul.children.length >= VISIBLE_COUNT) {
      li.classList.add('cards-tools-extra');
      li.hidden = true;
    }
    ul.append(li);
  });

  block.replaceChildren(ul);

  const total = ul.children.length;
  if (total <= VISIBLE_COUNT) return;

  const label = createTag('span', { class: 'cards-tools-toggle-label' }, labels.more);
  const count = createTag('span', { class: 'cards-tools-toggle-count' }, ` (${total})`);
  const toggle = createTag('button', {
    type: 'button',
    class: 'cards-tools-toggle',
    'aria-expanded': 'false',
    'aria-controls': listId,
  }, [label, count]);

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    ul.querySelectorAll('.cards-tools-extra').forEach((li) => { li.hidden = expanded; });
    label.textContent = expanded ? labels.more : labels.less;
    count.hidden = !expanded;
    if (!expanded) ul.querySelector('.cards-tools-extra a')?.focus();
  });

  block.append(createTag('div', { class: 'cards-tools-toggle-wrapper' }, toggle));
}
