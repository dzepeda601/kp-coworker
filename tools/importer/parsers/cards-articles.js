/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-articles. Base: cards.
 * Source: https://healthy.kaiserpermanente.org/health-wellness
 * Selector: .topics-list-main-container (the "View by topic" rail + article grid)
 *
 * Output: one section per topic, rendered as tabs by the site's section-based tabs
 * (Section Metadata: style=tabs, tab-id, tab-title; first topic also tabs-label).
 * Each topic section holds a cards-articles block (image | eyebrow <p> + linked H3)
 * followed by that topic's "View ... articles" link.
 *
 * The selected topic ("All topics") is server-rendered in #topics-list-group. The other
 * topics are loaded client-side on the source, so they are fetched from the same content
 * API the source uses (data-apiurl / data-api-query on each .topics-list-wrapper).
 */
const MAX_ARTICLES = 6;

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function card(document, { image, eyebrow, title, href }) {
  const text = [];
  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow;
    text.push(p);
  }
  if (title) {
    const h = document.createElement('h3');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = title;
      h.append(a);
    } else {
      h.textContent = title;
    }
    text.push(h);
  }
  if (!image && !text.length) return null;
  return [image || '', text];
}

function cellsFromDom(list, document) {
  let items = [...list.querySelectorAll(':scope > .card-container')];
  if (!items.length) items = [...list.querySelectorAll('.slick-slide__card')];
  return items.map((item) => card(document, {
    image: item.querySelector('.image-section img') || item.querySelector('img'),
    eyebrow: item.querySelector('.-category')?.textContent.replace(/\s+/g, ' ').trim(),
    title: (item.querySelector('.-title') || item.querySelector('h2, h3, h4'))?.textContent.replace(/\s+/g, ' ').trim(),
    href: item.querySelector('a.card-content[href]')?.getAttribute('href')
      || item.querySelector('a[href]')?.getAttribute('href'),
  })).filter(Boolean);
}

function cellsFromApi(wrapper, topic, document) {
  if (!wrapper?.dataset.apiurl || !wrapper.dataset.apiQuery) return [];
  let items = [];
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', wrapper.dataset.apiurl, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(wrapper.dataset.apiQuery);
    if (xhr.status === 200) items = JSON.parse(xhr.responseText);
  } catch (e) {
    console.warn(`cards-articles: could not load articles for "${topic}"`, e);
  }
  const urlPattern = wrapper.dataset.healthArticleUrl || '/health-wellness/healtharticle.{2}';
  return (Array.isArray(items) ? items : []).slice(0, MAX_ARTICLES).map((item) => {
    const imageData = item.primaryImageOfPage || {};
    let image = null;
    if (imageData.value) {
      image = document.createElement('img');
      image.src = imageData.value;
      image.alt = imageData['alt-en'] || '';
    }
    return card(document, {
      image,
      eyebrow: topic,
      title: item.headline?.value || item.title,
      href: item.name ? urlPattern.replace('{2}', item.name) : '',
    });
  }).filter(Boolean);
}

function viewAllLink(button, document) {
  const source = button?.querySelector('a[href]') || button;
  if (!source?.getAttribute?.('href')) return null;
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = source.getAttribute('href');
  a.textContent = source.textContent.replace(/\s+/g, ' ').trim();
  p.append(a);
  return p;
}

export default function parse(element, { document }) {
  const container = element.matches('.topics-list-main-container')
    ? element
    : (element.closest('.topics-list-main-container') || element);
  const list = container.querySelector('#topics-list-group') || container;
  const topics = [...container.querySelectorAll('.topics-filter-category a')]
    .map((a) => (a.dataset.healthtopic || a.textContent).replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const label = container.querySelector('.topics-label')?.textContent.replace(/\s+/g, ' ').trim();
  const buttons = [...container.querySelectorAll('.topicsViewButton')];
  const wrappers = [...container.querySelectorAll('[data-api-query]')];

  // No topic rail: a single article grid
  if (!topics.length) {
    const cells = cellsFromDom(list, document);
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-articles', cells }));
    return;
  }

  const nodes = [];
  topics.forEach((topic, i) => {
    const selected = container.querySelector('.topics-filter-category a.selected');
    const isSelected = selected
      ? (selected.dataset.healthtopic || selected.textContent).replace(/\s+/g, ' ').trim() === topic
      : i === 0;
    const wrapper = wrappers.find((w) => w.dataset.healthtopic === topic);
    const cells = isSelected ? cellsFromDom(list, document) : cellsFromApi(wrapper, topic, document);
    if (!cells.length) return;

    const meta = { style: 'tabs', 'tab-id': slug(topic), 'tab-title': topic };
    if (!nodes.length && label) meta['tabs-label'] = label;

    nodes.push(document.createElement('hr'));
    nodes.push(WebImporter.Blocks.createBlock(document, { name: 'Section Metadata', cells: meta }));
    nodes.push(WebImporter.Blocks.createBlock(document, { name: 'cards-articles', cells }));
    const link = viewAllLink(buttons[i], document);
    if (link) nodes.push(link);
  });

  if (!nodes.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  element.replaceWith(...nodes);
}
