import { createOptimizedPicture } from '../../scripts/aem.js';
import {
  createTag,
  fetchQueryIndexAll,
  getAuthoredLinks,
  normalizePath,
  resolveArticlesFromIndex,
  unbuttonLinks,
} from '../../scripts/shared.js';

/**
 * Card variants that share one content model: each row is a card with an optional
 * media cell (image, icon or illustration) and a text cell. Options:
 * - eyebrow: text-only paragraphs above the title become a small category line
 * - linkCard: the title link is stretched so the whole card is clickable
 * - iconHeader: the media is an icon shown inline with the title
 * - cta: the last link-only paragraph becomes an outlined button
 * - plainLinks: links stay inline text links, never buttons
 * - mediaLast: the text comes before the media in the card
 * - leadImage: an image-only first paragraph of the text cell is used as media
 * - skipAnimationLinks: cells holding only an animation file link (.json/.lottie) are ignored
 * - textOnly: every cell is text; extra cells merge into one card body
 * - keepSvg: SVG media is kept as-is (no raster renditions)
 * - imageWidth: rendition width for raster media
 */
const VARIANTS = {
  spotlight: { eyebrow: true, linkCard: true, imageWidth: 750 },
  articles: { eyebrow: true, linkCard: true, imageWidth: 750 },
  care: {
    iconHeader: true, cta: true, keepSvg: true, imageWidth: 96,
  },
  news: { plainLinks: true, keepSvg: true, imageWidth: 96 },
  panels: { mediaLast: true, keepSvg: true, imageWidth: 400 },
  pillars: {
    plainLinks: true, leadImage: true, skipAnimationLinks: true, keepSvg: true, imageWidth: 750,
  },
  notices: { plainLinks: true, textOnly: true },
};

const HEADING = ':scope > :is(h1, h2, h3, h4, h5, h6)';

const hasText = (el) => !!el.textContent.trim();
const isMediaCell = (cell) => !!cell.querySelector('picture, img, svg, .icon') && !hasText(cell);
const isAnimationLink = (cell) => {
  const links = cell.querySelectorAll('a[href]');
  return links.length === 1
    && cell.textContent.trim() === links[0].textContent.trim()
    && /\.(json|lottie)($|[?#])/i.test(links[0].getAttribute('href'));
};

/** Replace each image in scope with an optimized picture (SVGs optionally kept as-is). */
function optimizeImages(scope, { keepSvg, imageWidth }) {
  scope.querySelectorAll('img').forEach((img) => {
    const target = img.closest('picture') || img;
    if (keepSvg && /\.svg($|[?#])/i.test(img.getAttribute('src') || '')) {
      img.loading = 'lazy';
      target.replaceWith(img);
      return;
    }
    // Media is decorative unless the author gave it alt text.
    target.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: String(imageWidth) }]));
  });
}

/** Mark text-only paragraphs above the title as the eyebrow (category) line. */
function markEyebrow(body) {
  let lead = body.querySelector(HEADING)?.previousElementSibling;
  while (lead) {
    if (lead.tagName === 'P' && !lead.querySelector('a, picture, img') && hasText(lead)) {
      lead.classList.add('cards-card-eyebrow');
    }
    lead = lead.previousElementSibling;
  }
}

/** Stretch the title link (or first link) across the card. */
function linkCard(li, body) {
  const link = body.querySelector(`${HEADING} a[href]`) || body.querySelector('a[href]');
  if (!link) return;
  link.classList.remove('button', 'primary', 'secondary');
  link.parentElement?.classList.remove('button-container');
  link.classList.add('cards-card-main-link');
  li.classList.add('is-linked');
}

/** Put the icon inline with the title in a shared header row. */
function iconHeader(body, media) {
  const icon = media?.querySelector('picture, img, .icon')
    || body.querySelector(':scope > p > picture, :scope > picture');
  if (!icon) return;
  const iconPara = icon.parentElement?.tagName === 'P' && body.contains(icon) ? icon.parentElement : null;
  const header = createTag('div', { class: 'cards-card-header' }, createTag('span', { class: 'cards-card-icon' }, icon));
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.before(header);
    header.append(heading);
  } else {
    body.prepend(header);
  }
  if (iconPara && !hasText(iconPara) && !iconPara.children.length) iconPara.remove();
}

/** The last link-only paragraph becomes the card's outlined call-to-action button. */
function markCta(body) {
  const para = [...body.querySelectorAll(':scope > p')].reverse().find((p) => {
    const a = p.querySelector('a[href]');
    return a && p.textContent.trim() === a.textContent.trim();
  });
  if (!para) return;
  para.classList.add('cards-card-cta');
  const a = para.querySelector('a[href]');
  a.classList.remove('primary');
  a.classList.add('button', 'secondary');
}

/** Split a row into its media cell and text cell according to the variant options. */
function splitRow(row, opts) {
  let cells = [...row.children];
  if (opts.skipAnimationLinks) cells = cells.filter((c) => !isAnimationLink(c));
  if (opts.textOnly) {
    cells = cells.filter((c) => hasText(c) || c.querySelector('picture, img'));
    const [body, ...rest] = cells;
    rest.forEach((c) => body.append(...c.childNodes));
    return { body };
  }
  let media = cells.find(isMediaCell);
  const texts = cells.filter((c) => c !== media && hasText(c));
  const [body, ...rest] = texts;
  rest.forEach((c) => body.append(...c.childNodes));
  if (!media && body && opts.leadImage) {
    const lead = body.firstElementChild;
    if (lead?.tagName === 'P' && lead.querySelector('picture, img') && !hasText(lead)) {
      media = createTag('div', {}, [...lead.childNodes]);
      lead.remove();
    }
  }
  return { media, body };
}

/**
 * Decorate a shared-model card variant (spotlight, articles, care, news, panels, pillars, notices).
 * @param {Element} block
 * @param {object} opts variant options from VARIANTS
 */
function decorateVariant(block, opts) {
  const ul = createTag('ul', { class: 'cards-list' });

  [...block.children].forEach((row) => {
    const { media, body } = splitRow(row, opts);
    if (!media && !body) return;

    const li = createTag('li', { class: 'cards-card' });
    if (body) {
      body.className = 'cards-card-body';
      if (opts.plainLinks) unbuttonLinks(body);
      if (opts.eyebrow) markEyebrow(body);
      if (opts.linkCard) linkCard(li, body);
      if (opts.cta) markCta(body);
    }

    if (opts.iconHeader) {
      if (body) iconHeader(body, media);
      optimizeImages(li.appendChild(body || createTag('div', { class: 'cards-card-body' })), opts);
      ul.append(li);
      return;
    }

    if (media) {
      media.className = 'cards-card-image';
      optimizeImages(media, opts);
    } else if (!opts.textOnly) {
      li.classList.add('no-image');
    }
    const parts = opts.mediaLast ? [body, media] : [media, body];
    li.append(...parts.filter(Boolean));
    ul.append(li);
  });

  block.replaceChildren(ul);
}

function buildLinksCard(article) {
  const href = normalizePath(article.path);
  const li = createTag('li');
  const link = createTag('a', { href, class: 'cards-card-link' });

  if (article.image) {
    const imageDiv = createTag('div', { class: 'cards-card-image' });
    imageDiv.append(createOptimizedPicture(article.image, article.title || '', false, [{ width: '750' }]));
    link.append(imageDiv);
  }

  const body = createTag('div', { class: 'cards-card-body' });
  body.append(createTag('p', {}, createTag('strong', {}, article.title || href)));
  if (article.description) {
    body.append(createTag('p', {}, article.description));
  }
  link.append(body);
  li.append(link);

  return li;
}

/**
 * Decorate "cards links" variant: fetch index, match paths, render cards.
 */
async function decorateLinks(block) {
  const authoredLinks = getAuthoredLinks(block);
  if (!authoredLinks.length) {
    block.textContent = '';
    block.append(createTag('p', { class: 'cards-links-empty' }, 'No links provided.'));
    return;
  }

  let indexRows = [];
  try {
    indexRows = await fetchQueryIndexAll();
  } catch {
    indexRows = [];
  }

  const articles = resolveArticlesFromIndex(authoredLinks, indexRows);

  const ul = createTag('ul');
  articles.forEach((article) => ul.append(buildLinksCard(article)));
  block.replaceChildren(ul);
}

/**
 * Decorate bento-grid cards variant.
 * Each authored row becomes a card. The first <p> in each card is treated
 * as a tag/label (e.g. "// Knowledge Base v1.0"), and the first card is
 * marked as the featured (primary) card.
 */
function decorateBento(block) {
  const ul = createTag('ul');

  [...block.children].forEach((row, idx) => {
    const li = createTag('li');
    if (idx === 0) li.classList.add('cards-card-featured');
    while (row.firstElementChild) li.append(row.firstElementChild);

    // Unwrap the single wrapper div if present
    const wrapper = li.firstElementChild;
    if (wrapper && wrapper.tagName === 'DIV' && li.children.length === 1) {
      while (wrapper.firstChild) li.append(wrapper.firstChild);
      wrapper.remove();
    }

    // Separate image into its own wrapper (consistent with default cards)
    const picture = li.querySelector('picture');
    if (picture) {
      const imageDiv = createTag('div', { class: 'cards-card-image' });
      const pictureParent = picture.parentElement;
      imageDiv.append(picture);
      li.prepend(imageDiv);
      if (pictureParent && pictureParent.tagName === 'A' && !pictureParent.children.length) {
        pictureParent.remove();
      }
    } else {
      li.classList.add('cards-card-text-only');
    }

    // Find and mark the tag/label (first <p> that looks like a category tag)
    const firstP = li.querySelector('p');
    if (firstP && !firstP.querySelector('picture') && !firstP.classList.contains('button-container')) {
      firstP.classList.add('cards-card-tag');
    }

    // Wrap remaining non-image content in a body div
    const body = createTag('div', { class: 'cards-card-body' });
    [...li.children].forEach((child) => {
      if (!child.classList.contains('cards-card-image')) body.append(child);
    });
    li.append(body);

    ul.append(li);
  });

  block.replaceChildren(ul);
}

/**
 * Decorate regular cards (authored rows with image + body).
 */
function decorateDefault(block) {
  const ul = createTag('ul');

  [...block.children].forEach((row) => {
    const li = createTag('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    const content = li.firstElementChild;
    if (content?.children?.length > 1) {
      const imageEl = [...content.children].find((el) => el.querySelector('picture'));
      if (imageEl) {
        const picture = imageEl.querySelector('picture');
        const imageDiv = createTag('div', { class: 'cards-card-image' });
        if (picture) imageDiv.append(picture);
        const bodyDiv = createTag('div', { class: 'cards-card-body' });
        [...content.children].forEach((el) => { if (el !== imageEl) bodyDiv.append(el); });
        li.replaceChildren(imageDiv, bodyDiv);
      } else {
        content.className = 'cards-card-body';
      }
    } else {
      [...li.children].forEach((div) => {
        div.className = (div.children.length === 1 && div.querySelector('picture'))
          ? 'cards-card-image' : 'cards-card-body';
      });
    }

    const linkEl = li.querySelector('.cards-card-image a[href]') || li.querySelector('.cards-card-body a[href]');
    if (linkEl) {
      const wrapper = createTag('div', { class: 'cards-card-link' });
      while (li.firstChild) wrapper.append(li.firstChild);
      li.append(wrapper);
      const parent = linkEl.parentElement;
      if (parent) {
        parent.classList.remove('button-container');
      }
      linkEl.classList.remove('button');
    }

    // Image links with decorative images (alt="") have no accessible name: when the body links to
    // the same place, take the duplicate out of the tab order; otherwise name it after the title.
    li.querySelectorAll('.cards-card-image a[href]').forEach((a) => {
      if (a.textContent.trim() || a.getAttribute('aria-label') || a.querySelector('img:not([alt=""])')) return;
      const bodyLink = [...li.querySelectorAll('.cards-card-body a[href]')].find((b) => b.href === a.href);
      if (bodyLink) {
        a.setAttribute('aria-hidden', 'true');
        a.tabIndex = -1;
      } else {
        const title = li.querySelector('.cards-card-body :is(h2, h3, h4, strong, p)')?.textContent.trim();
        if (title) a.setAttribute('aria-label', title);
      }
    });

    const article = createTag('article');
    while (li.firstChild) article.append(li.firstChild);
    li.append(article);

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const picture = img.closest('picture');
    if (picture) {
      picture.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]));
    }
  });

  block.replaceChildren(ul);
}

export default async function decorate(block) {
  const variant = Object.keys(VARIANTS).find((v) => block.classList.contains(v));
  if (variant) {
    decorateVariant(block, VARIANTS[variant]);
  } else if (block.classList.contains('links')) {
    await decorateLinks(block);
  } else if (block.classList.contains('bento')) {
    decorateBento(block);
  } else {
    decorateDefault(block);
  }
}
