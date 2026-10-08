/*
 * Footer block – KP global footer
 * Fragment sections (flat, author-friendly):
 *   1. link columns: repeated <h2> heading + <ul> of links (accordions below 1200px)
 *   2. legal: logo image paragraph, then <ul> lists of legal links (one list per desktop column)
 *   3. social: intro paragraph + <ul> of icon links
 *   4. fine print: paragraphs (addresses, disclaimers, copyright)
 * Links with a title open in a new window (the title describes that to assistive tech).
 */

const DESKTOP = window.matchMedia('(min-width: 1200px)');

let uid = 0;

/** Fetch the footer fragment: /content first (local preview), then root (DA/EDS). */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
  // resolve relative media against the fragment URL, not the page URL
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.setAttribute('src', new URL(img.getAttribute('src'), resp.url).href);
    img.loading = 'lazy';
  });
  return doc.body;
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  node.append(...children);
  return node;
}

/** Titled links open in a new window; text links get the external icon. */
function decorateLinks(scope) {
  scope.querySelectorAll('a[title]').forEach((a) => {
    a.target = '_blank';
    a.rel = 'noopener';
    if (a.querySelector('img')) return;
    // keep the icon on the same line as the last word
    const text = a.lastChild?.nodeType === Node.TEXT_NODE ? a.lastChild : null;
    const icon = el('span', { class: 'footer-external-icon', 'aria-hidden': 'true' });
    const words = text?.textContent.trimEnd().split(' ') || [];
    if (words.length > 1) {
      text.textContent = `${words.slice(0, -1).join(' ')} `;
      a.append(el('span', { class: 'footer-nowrap' }, words.at(-1), icon));
    } else a.append(icon);
  });
}

/** Section 1: heading + list pairs → columns that become accordions on mobile. */
function buildColumns(section) {
  const columns = el('div', { class: 'footer-columns' });
  section.querySelectorAll(':scope > h2, :scope > h3').forEach((heading) => {
    const list = heading.nextElementSibling?.tagName === 'UL' ? heading.nextElementSibling : null;
    uid += 1;
    const id = `footer-column-${uid}`;
    heading.className = 'footer-column-heading';
    const label = el('span', { class: 'footer-column-label' }, ...heading.childNodes);
    const toggle = el('button', {
      type: 'button', class: 'footer-column-toggle', 'aria-expanded': 'false', 'aria-controls': id,
    });
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      if (list) list.hidden = !open;
    });
    const column = el('div', { class: 'footer-column' }, heading);
    if (list) {
      list.id = id;
      list.className = 'footer-column-links';
      column.append(list);
    }
    column.layout = (desktop) => {
      // desktop: static heading; mobile: heading text inside a disclosure button
      if (desktop) heading.replaceChildren(label);
      else {
        toggle.replaceChildren(el('span', { class: 'footer-toggle-icon', 'aria-hidden': 'true' }), label);
        heading.replaceChildren(toggle);
      }
      if (list) list.hidden = !desktop && toggle.getAttribute('aria-expanded') !== 'true';
    };
    columns.append(column);
  });
  return columns;
}

export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;
  decorateLinks(fragment);

  const [columnsSection, legalSection, socialSection, finePrintSection] = [...fragment.querySelectorAll(':scope > div')];

  // band 1: link columns
  const columns = columnsSection ? buildColumns(columnsSection) : null;
  if (columns) block.append(el('div', { class: 'footer-links' }, el('div', { class: 'footer-inner' }, columns)));

  // band 2: logo, legal links, social, fine print
  const inner = el('div', { class: 'footer-inner' });
  if (legalSection) {
    const logo = legalSection.querySelector(':scope > p img');
    if (logo) inner.append(el('p', { class: 'footer-logo' }, logo));
    const legalLinks = el('div', { class: 'footer-legal-links' });
    legalSection.querySelectorAll(':scope > ul').forEach((ul) => legalLinks.append(ul));
    inner.append(legalLinks);
  }
  if (socialSection) {
    const social = el('div', { class: 'footer-social' }, ...socialSection.childNodes);
    social.querySelector('ul')?.classList.add('footer-social-list');
    social.querySelectorAll('li a').forEach((a) => {
      const img = a.querySelector('img');
      if (img && !a.getAttribute('aria-label')) a.setAttribute('aria-label', img.alt);
      img?.setAttribute('alt', '');
    });
    inner.append(social);
  }
  if (finePrintSection) inner.append(el('div', { class: 'footer-fineprint' }, ...finePrintSection.childNodes));
  block.append(el('div', { class: 'footer-legal' }, inner));

  const layout = () => columns?.querySelectorAll('.footer-column').forEach((c) => c.layout(DESKTOP.matches));
  layout();
  DESKTOP.addEventListener('change', layout);
}
