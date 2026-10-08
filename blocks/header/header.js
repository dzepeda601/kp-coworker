/*
 * Header block – KP global header
 * Nav fragment sections (flat, author-friendly):
 *   1. utility: skip link, pickers (li text + nested ul; <strong> = current), links,
 *      optional <p> title + second ul = additional resources
 *   2. brand: logo link (first image = wide logo, second = compact logo), then <p> menu open / close labels
 *   3. account: ul of links (last = primary); text before a link (e.g. "New Member?") shows in the mobile menu
 *   4. primary: optional <p> title, ul of nav links, <p> search placeholder, <p><a> search action + button label
 * Links with a title open in a new window; the title describes that to assistive tech.
 * Desktop (≥1200px) uses rows; below that the same nodes move into a push-down menu.
 */

const DESKTOP = window.matchMedia('(min-width: 1200px)');

let uid = 0;
const nextId = (prefix) => {
  uid += 1;
  return `${prefix}-${uid}`;
};

/** Fetch the nav fragment: /content first (local preview), then root (DA/EDS). */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // resolve relative media against the fragment URL, not the page URL
  doc.querySelectorAll('img[src], source[srcset]').forEach((el) => {
    const attr = el.hasAttribute('src') ? 'src' : 'srcset';
    el.setAttribute(attr, new URL(el.getAttribute(attr), resp.url).href);
  });
  return doc.body;
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  node.append(...children);
  return node;
}

function normalizePath(href) {
  const { pathname } = new URL(href, window.location.href);
  return pathname.replace(/^\/content/, '').replace(/(\.plain)?\.html$/, '').replace(/\/$/, '') || '/';
}

function isCurrent(a) {
  return new URL(a.href).origin === window.location.origin
    && normalizePath(a.href) === normalizePath(window.location.href);
}

/** Links with a title open in a new window (the title describes that to assistive tech). */
function decorateLink(a) {
  if (!a.getAttribute('title')) return a;
  a.target = '_blank';
  a.rel = 'noopener';
  a.append(el('span', { class: 'header-external-icon', 'aria-hidden': 'true' }));
  return a;
}

/** A paragraph directly before a list titles it: wrap both in a nav labelled by that title. */
function labelledNav(list, className) {
  const nav = el('nav', { class: className });
  const prev = list.previousElementSibling;
  if (prev?.tagName === 'P' && !prev.querySelector('a')) {
    const title = el('h2', { class: 'header-nav-title', id: nextId('header-nav-title') }, prev.textContent.trim());
    nav.setAttribute('aria-labelledby', title.id);
    nav.append(title);
    prev.remove();
  }
  nav.append(list);
  return nav;
}

function closePickers(scope, except) {
  scope.querySelectorAll('.header-picker-button[aria-expanded="true"]').forEach((btn) => {
    if (btn === except) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.nextElementSibling.hidden = true;
  });
}

/** li with a text label + nested list of links → labelled dropdown picker */
function buildPicker(li) {
  const id = nextId('header-picker');
  const list = li.querySelector(':scope > ul');
  const label = [...li.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE || n.tagName === 'P')
    .map((n) => n.textContent.trim()).join(' ').trim();

  const options = [...list.querySelectorAll(':scope > li')];
  const selected = options.find((o) => o.querySelector('strong')) || options[0];
  options.forEach((o) => {
    const strong = o.querySelector('strong');
    if (strong) strong.replaceWith(...strong.childNodes);
    o.classList.add('header-picker-option');
  });
  selected.classList.add('selected');
  selected.querySelector('a')?.setAttribute('aria-current', 'true');

  const value = el('span', { class: 'header-picker-value', id: `${id}-value` }, selected.textContent.trim());
  const button = el('button', {
    type: 'button',
    class: 'header-picker-button',
    'aria-expanded': 'false',
    'aria-controls': `${id}-list`,
    'aria-labelledby': `${id}-label ${id}-value`,
  }, value, el('span', { class: 'header-chevron', 'aria-hidden': 'true' }));
  list.id = `${id}-list`;
  list.className = 'header-picker-dropdown';
  list.hidden = true;

  button.addEventListener('click', () => {
    const open = list.hidden;
    closePickers(button.closest('header'), button);
    button.setAttribute('aria-expanded', String(open));
    list.hidden = !open;
  });
  button.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown') return;
    e.preventDefault();
    button.setAttribute('aria-expanded', 'true');
    list.hidden = false;
    list.querySelector('a')?.focus();
  });
  list.addEventListener('keydown', (e) => {
    const links = [...list.querySelectorAll('a')];
    const i = links.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = e.key === 'ArrowDown' ? i + 1 : i - 1;
      links[(next + links.length) % links.length].focus();
    }
  });

  const picker = el(
    'div',
    { class: 'header-picker' },
    el('span', { class: 'header-picker-label', id: `${id}-label` }, label),
    button,
    list,
  );
  picker.addEventListener('focusout', (e) => {
    if (e.relatedTarget && !picker.contains(e.relatedTarget)) closePickers(picker);
  });
  return picker;
}

/** Utility section → picker items, plain link items, and the titled additional-resources nav. */
function buildUtility(section) {
  const [mainList, crossList] = [...section.querySelectorAll(':scope > ul')];
  const pickers = [];
  const links = [];
  [...(mainList?.children || [])].forEach((li) => {
    const item = el('li');
    if (li.querySelector(':scope > ul')) {
      item.append(buildPicker(li));
      pickers.push(item);
    } else {
      item.append(...[...li.querySelectorAll('a')].map(decorateLink));
      item.classList.add('header-utility-link');
      links.push(item);
    }
  });
  let crossNav = null;
  if (crossList) {
    crossList.querySelectorAll('a').forEach(decorateLink);
    crossList.className = 'header-cross-links';
    crossNav = labelledNav(crossList, 'header-cross-nav');
  }
  return { pickers, links, crossNav };
}

/** Account list → links; text before a link becomes a note shown only in the mobile menu. */
function buildAccount(section) {
  const list = section?.querySelector('ul');
  if (!list) return null;
  list.className = 'header-account';
  const links = [...list.querySelectorAll('a')];
  links.forEach((a, i) => {
    decorateLink(a);
    a.classList.add('header-account-link', i === links.length - 1 ? 'primary' : 'secondary');
    const li = a.closest('li');
    const note = [...li.childNodes].filter((n) => n !== a && n.textContent.trim());
    if (note.length) {
      const span = el('span', { class: 'header-account-note' });
      note.forEach((n) => span.append(n));
      li.prepend(span, ' ');
    }
  });
  return list;
}

function buildSearch(section) {
  const paras = [...section.querySelectorAll(':scope > p')];
  const actionLink = paras.map((p) => p.querySelector('a')).find(Boolean);
  if (!actionLink) return null;
  const placeholder = paras.find((p) => !p.querySelector('a'))?.textContent.trim() || '';
  const buttonLabel = actionLink.textContent.trim();
  const action = new URL(actionLink.href);

  const form = el('form', {
    class: 'header-search', role: 'search', method: 'get', action: `${action.origin}${action.pathname}`,
  });
  const inputId = nextId('header-search-input');
  form.append(
    el('label', { class: 'header-sr-only', for: inputId }, buttonLabel),
    el('input', {
      id: inputId, type: 'search', name: 'query', placeholder, autocomplete: 'off',
    }),
  );
  // query params on the authored link become hidden fields (e.g. region, language)
  action.searchParams.forEach((v, k) => form.append(el('input', { type: 'hidden', name: k, value: v })));
  form.append(el('button', { type: 'submit', class: 'header-search-button' }, buttonLabel));
  return form;
}

/** Hamburger toggle; labels come from the brand section paragraphs (open, close). */
function buildMenuButton(labels, menuId) {
  const [openLabel = '', closeLabel = openLabel] = labels;
  const text = el('span', { class: 'header-menu-label' }, openLabel);
  const button = el('button', {
    type: 'button', class: 'header-hamburger', 'aria-expanded': 'false', 'aria-controls': menuId,
  }, el('span', { class: 'header-menu-icon', 'aria-hidden': 'true' }), text);
  button.setLabel = (open) => { text.textContent = open ? closeLabel : openLabel; };
  return button;
}

export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const [utilitySection, brandSection, accountSection, primarySection] = [...fragment.querySelectorAll(':scope > div')];

  // skip link
  const skip = utilitySection?.querySelector(':scope > p > a[href^="#"]');
  if (skip) {
    skip.className = 'header-skip-link';
    // the skip target is the page's main landmark; give it the authored anchor id
    const mainEl = document.querySelector('main');
    if (mainEl && !mainEl.id) mainEl.id = skip.hash.slice(1);
    skip.addEventListener('click', (e) => {
      const main = document.querySelector('main');
      if (!main) return;
      e.preventDefault();
      main.tabIndex = -1;
      main.focus();
      main.scrollIntoView();
    });
    block.append(skip);
  }

  const { pickers, links: utilityLinks, crossNav } = utilitySection
    ? buildUtility(utilitySection) : { pickers: [], links: [], crossNav: null };

  // brand: logo (+ compact logo) and menu button labels
  const brandLink = brandSection?.querySelector('a');
  const brand = el('div', { class: 'header-brand' });
  if (brandLink) {
    const logos = brandLink.querySelectorAll('img');
    logos[0]?.classList.add('header-logo-wide');
    logos[1]?.classList.add('header-logo-compact');
    brand.append(brandLink);
  }
  const menuLabels = [...(brandSection?.querySelectorAll(':scope > p') || [])]
    .filter((p) => !p.querySelector('a')).map((p) => p.textContent.trim()).filter(Boolean);

  const account = buildAccount(accountSection);

  const primaryList = primarySection?.querySelector(':scope > ul');
  let primaryNav = null;
  if (primaryList) {
    primaryList.className = 'header-primary-list';
    primaryList.querySelectorAll('a').forEach((a) => {
      decorateLink(a);
      if (isCurrent(a)) {
        a.setAttribute('aria-current', 'page');
        a.parentElement.classList.add('active');
      }
    });
    primaryNav = labelledNav(primaryList, 'header-primary');
  }
  const search = primarySection ? buildSearch(primarySection) : null;

  // mobile bar tools: compact sign-in (copy of the primary account link) + menu button
  const menuId = nextId('header-menu');
  const tools = el('div', { class: 'header-tools' });
  const primaryAccount = account?.querySelector('.header-account-link.primary');
  if (primaryAccount) {
    const compact = primaryAccount.cloneNode(true);
    compact.className = 'header-tools-link';
    tools.append(compact);
  }
  const menuButton = buildMenuButton(menuLabels, menuId);
  tools.append(menuButton);

  // containers
  const utilityLeft = el('ul', { class: 'header-utility-links' });
  const utilityInner = el('div', { class: 'header-inner' });
  const utility = el('div', { class: 'header-utility' }, utilityInner);
  const mainInner = el('div', { class: 'header-inner' });
  const mainBar = el('div', { class: 'header-main' }, mainInner);
  const menuPickers = el('ul', { class: 'header-menu-pickers' });
  const menu = el('div', { class: 'header-menu', id: menuId });
  block.append(utility, mainBar);

  const setMenu = (open) => {
    block.classList.toggle('menu-open', open);
    block.closest('header')?.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setLabel(open);
    if (!open) closePickers(block);
  };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));

  // place the same nodes for the current layout
  const place = () => {
    const crossList = crossNav?.querySelector('ul');
    if (DESKTOP.matches) {
      setMenu(false);
      utilityLeft.append(...pickers, ...utilityLinks);
      utilityInner.replaceChildren(utilityLeft, ...(crossNav ? [crossNav] : []));
      mainInner.replaceChildren(brand, ...[account, primaryNav, search].filter(Boolean));
      menu.remove();
    } else {
      // utility links (e.g. Support Center) join the additional resources list on mobile
      if (crossList) crossList.append(...utilityLinks);
      menuPickers.append(...pickers);
      menu.replaceChildren(...[primaryNav, account, crossNav, menuPickers].filter(Boolean));
      utilityInner.replaceChildren();
      mainInner.replaceChildren(brand, tools, ...(search ? [search] : []));
      mainBar.after(menu);
    }
    closePickers(block);
  };
  place();
  DESKTOP.addEventListener('change', place);

  // close pickers / menu on outside click and Escape
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-picker')) closePickers(block);
  });
  block.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openPicker = block.querySelector('.header-picker-button[aria-expanded="true"]');
    if (openPicker) {
      closePickers(block);
      openPicker.focus();
    } else if (menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });
}
