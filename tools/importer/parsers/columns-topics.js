/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-topics. Base: columns.
 * Source: https://healthy.kaiserpermanente.org/health-wellness
 * Selector: .column-control.blue-5 > .column-control-container
 * Output: 1 row, 2 cells: image | H2 + <ul> of topic links + plain "Show more"
 * toggle label paragraph (count stripped). Topics are iterated on the
 * .show-more-less-item wrappers, not on the <a> elements.
 */
export default function parse(element, { document }) {
  const image = element.querySelector('.columns-4 img, .cmp-image img') || element.querySelector('img');

  const headingSrc = element.querySelector('.cmp-text h2, .cmp-text h3') || element.querySelector('h2, h3');
  let heading = null;
  if (headingSrc && headingSrc.textContent.trim()) {
    heading = document.createElement(headingSrc.tagName.toLowerCase());
    heading.textContent = headingSrc.textContent.replace(/\s+/g, ' ').trim();
  }

  // Topic links (visible + hidden group), iterated on their item wrappers
  let items = [...element.querySelectorAll('.show-more-less-item')];
  let anchors = items.map((item) => item.querySelector('a[href]')).filter(Boolean);
  if (!anchors.length) {
    anchors = [...element.querySelectorAll('.show-more-less a[href], .columns-8 a[href]')];
  }
  const ul = document.createElement('ul');
  anchors.forEach((a) => {
    const text = a.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = text;
    li.append(link);
    ul.append(li);
  });

  // Toggle label from source (e.g. "Show more (12)") without the count
  const toggle = element.querySelector('.show-more-less-toggle');
  const moreLabel = (toggle && toggle.textContent.replace(/\(\s*\d+\s*\)/, '').replace(/\s+/g, ' ').trim()) || 'Show more';

  if (!heading && !ul.children.length && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const text = [];
  if (heading) text.push(heading);
  if (ul.children.length) {
    text.push(ul);
    const label = document.createElement('p');
    label.textContent = moreLabel;
    text.push(label);
  }

  const cells = [[image || '', text]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-topics', cells });
  element.replaceWith(block);
}
