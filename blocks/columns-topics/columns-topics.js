import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/** Number of topic links visible before the "show more" toggle. */
const VISIBLE_COUNT = 10;

/**
 * Fallback toggle labels, used only when the author supplies none.
 * Authors localize by adding one or two plain-text paragraphs after the topic list:
 * the first is the "show more" label, the optional second the "show less" label.
 */
const FALLBACK_LABELS = { more: 'Show more', less: 'Show less' };

let instanceCount = 0;

/**
 * Collect topic links from the content cell (an authored list, or paragraphs that only hold
 * a link) plus the plain-text paragraphs that follow them, which are the toggle labels.
 * Both are removed from the cell.
 * @param {Element} cell
 * @returns {{ links: HTMLAnchorElement[], labels: string[] }}
 */
function collectLinksAndLabels(cell) {
  const children = [...cell.children];
  const isLinkPara = (el) => el.tagName === 'P'
    && el.querySelector('a[href]')
    && el.textContent.trim() === el.querySelector('a[href]').textContent.trim();

  const list = children.find((el) => el.tagName === 'UL' || el.tagName === 'OL');
  const linkEls = list ? [list] : children.filter(isLinkPara);
  if (!linkEls.length) return { links: [], labels: [] };

  const links = list
    ? [...list.querySelectorAll('li a[href]')]
    : linkEls.map((p) => p.querySelector('a[href]'));

  const lastIndex = children.indexOf(linkEls[linkEls.length - 1]);
  const labelParas = children.slice(lastIndex + 1)
    .filter((el) => el.tagName === 'P' && !el.querySelector('a, picture') && el.textContent.trim())
    .slice(0, 2);

  [...linkEls, ...labelParas].forEach((el) => el.remove());
  return { links, labels: labelParas.map((p) => p.textContent.trim()) };
}

/**
 * Columns (topics): image beside a heading and a list of topic links rendered as pills,
 * with a "show more" toggle after the first VISIBLE_COUNT links.
 * Authored as one row: image cell | heading + bulleted list of links (+ optional toggle labels).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  instanceCount += 1;
  const row = block.firstElementChild;
  if (!row) return;
  row.classList.add('columns-topics-row');

  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture') && !c.textContent.trim());
  const contentCell = cells.find((c) => c !== imageCell && c.textContent.trim());

  if (imageCell) {
    imageCell.classList.add('columns-topics-img-col');
    const img = imageCell.querySelector('picture img');
    if (img) {
      imageCell.querySelector('picture').replaceWith(
        createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]),
      );
    }
  } else {
    block.classList.add('no-image');
  }
  cells.filter((c) => c !== imageCell && c !== contentCell).forEach((c) => c.remove());
  if (!contentCell) return;
  contentCell.classList.add('columns-topics-text-col');

  const { links, labels: authoredLabels } = collectLinksAndLabels(contentCell);
  const labels = {
    more: authoredLabels[0] || FALLBACK_LABELS.more,
    less: authoredLabels[1] || FALLBACK_LABELS.less,
  };

  const listId = `columns-topics-list-${instanceCount}`;
  const ul = createTag('ul', { class: 'columns-topics-list', id: listId });
  links.forEach((a, i) => {
    a.classList.remove('button', 'primary', 'secondary');
    a.classList.add('columns-topics-pill');
    const li = createTag('li', {}, a);
    if (i >= VISIBLE_COUNT) {
      li.classList.add('columns-topics-extra');
      li.hidden = true;
    }
    ul.append(li);
  });
  contentCell.append(ul);

  const hiddenCount = links.length - VISIBLE_COUNT;
  if (hiddenCount <= 0) return;

  const label = createTag('span', { class: 'columns-topics-toggle-label' }, labels.more);
  const count = createTag('span', { class: 'columns-topics-toggle-count' }, ` (${hiddenCount})`);
  const toggle = createTag('button', {
    type: 'button',
    class: 'columns-topics-toggle',
    'aria-expanded': 'false',
    'aria-controls': listId,
  }, [label, count]);

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    ul.querySelectorAll('.columns-topics-extra').forEach((li) => { li.hidden = expanded; });
    label.textContent = expanded ? labels.more : labels.less;
    count.hidden = !expanded;
    if (!expanded) ul.querySelector('.columns-topics-extra a')?.focus();
  });

  contentCell.append(createTag('div', { class: 'columns-topics-toggle-wrapper' }, toggle));
}
