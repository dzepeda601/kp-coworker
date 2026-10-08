/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-northern-california.js
  var import_northern_california_exports = {};
  __export(import_northern_california_exports, {
    default: () => import_northern_california_default
  });

  // tools/importer/parsers/columns-overlap.js
  function parse(element, { document }) {
    const image = element.querySelector('[class*="__image"] img') || [...element.querySelectorAll("img")].find((img) => !img.closest('[class*="__content"]'));
    const content = element.querySelector(':scope > [class*="__content"]') || element;
    const titleEl = content.querySelector('[class*="__content-title"]') || content.querySelector("h1, h2, h3, h4");
    const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
    const isHero = element.matches('[class*="welcome-hero"]') && !element.matches('[class*="welcome-story"]');
    const text = [];
    if (titleText) {
      const h = document.createElement(isHero ? "h1" : "h2");
      h.textContent = titleText;
      text.push(h);
    }
    content.querySelectorAll('[class*="__content-description"] p').forEach((p) => {
      if (p.textContent.trim()) text.push(p);
    });
    let links = [...content.querySelectorAll(".fd-button a[href]")];
    if (!links.length) links = [...content.querySelectorAll('[class*="__content-action"] a[href]')];
    links.forEach((link) => {
      const label = link.textContent.replace(/\s+/g, " ").trim();
      if (!label) return;
      const a = document.createElement("a");
      a.href = link.getAttribute("href");
      a.textContent = label;
      const p = document.createElement("p");
      p.append(a);
      text.push(p);
    });
    if (!image && !text.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const imageRight = /--image-right\b/.test(element.className || "");
    const imageCell = image || "";
    const cells = [imageRight ? [text, imageCell] : [imageCell, text]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-overlap", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-spotlight.js
  function parseCarouselItems(items, document) {
    const cells = [];
    items.forEach((item) => {
      const card = item.querySelector("a[href]");
      const image = item.querySelector("img");
      const href = card == null ? void 0 : card.getAttribute("href");
      const categoryEl = item.querySelector('[class*="category"]');
      const titleEl = item.querySelector('[class*="title"]') || item.querySelector("h2, h3, h4");
      const bodyEl = item.querySelector('[class*="body"]');
      const text = [];
      const category = categoryEl == null ? void 0 : categoryEl.textContent.replace(/\s+/g, " ").trim();
      if (category) {
        const p = document.createElement("p");
        p.textContent = category;
        text.push(p);
      }
      const title = titleEl == null ? void 0 : titleEl.textContent.replace(/\s+/g, " ").trim();
      if (title) {
        const h = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = title;
          h.append(a);
        } else {
          h.textContent = title;
        }
        text.push(h);
      }
      if (bodyEl) {
        const paras = [...bodyEl.querySelectorAll("p")].filter((p) => p.textContent.trim());
        if (paras.length) {
          text.push(...paras);
        } else if (bodyEl.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = bodyEl.textContent.replace(/\s+/g, " ").trim();
          text.push(p);
        }
      }
      if (!image && !text.length) return;
      cells.push([image || "", text]);
    });
    return cells;
  }
  function parse2(element, { document }) {
    let items = [...element.querySelectorAll(":scope > .gs-card-outer")];
    if (!items.length) {
      const carouselItems = [...element.querySelectorAll(".carousel__item")].filter((item) => !item.closest(".hidden-card") && !item.matches(".hidden-card"));
      if (carouselItems.length) {
        const carouselCells = parseCarouselItems(carouselItems, document);
        if (!carouselCells.length) {
          element.replaceWith(...element.childNodes);
          return;
        }
        const block2 = WebImporter.Blocks.createBlock(document, { name: "Cards (Spotlight)", cells: carouselCells });
        element.replaceWith(block2);
        return;
      }
    }
    if (!items.length) items = [...element.querySelectorAll(".ds-card__content")].map((c) => c.closest(".gs-card-outer") || c.parentElement);
    const cells = [];
    items.forEach((item) => {
      var _a, _b;
      const image = item.querySelector(".ds-card__image img, img");
      const titleEl = item.querySelector(".ds-card__title h1, .ds-card__title h2, .ds-card__title h3, .ds-card__title h4") || item.querySelector("h2, h3, h4");
      const href = ((_a = item.querySelector("a.ds-card[href]")) == null ? void 0 : _a.getAttribute("href")) || ((_b = item.querySelector("a[href]")) == null ? void 0 : _b.getAttribute("href"));
      const summary = [...item.querySelectorAll(".ds-card__summary p, .ds-card__subtitle p")].filter((p) => p.textContent.trim());
      const text = [];
      if (titleEl) {
        const h = document.createElement(/^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : "h3");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = titleEl.textContent.trim();
          h.append(a);
        } else {
          h.textContent = titleEl.textContent.trim();
        }
        text.push(h);
      }
      text.push(...summary);
      if (!image && !text.length) return;
      cells.push([image || "", text]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (Spotlight)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-teaser.js
  function parse3(element, { document }) {
    let items = [...element.querySelectorAll(":scope > .teaser-container")];
    if (!items.length) items = [...element.querySelectorAll(".teaser-text")].map((t) => t.parentElement);
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector(".teaser-image img") || item.querySelector("img");
      const textRoot = item.querySelector(".teaser-text") || item;
      const text = [];
      const titleEl = textRoot.querySelector(".teaser-title h1, .teaser-title h2, .teaser-title h3, .teaser-title h4") || textRoot.querySelector("h2, h3, h4") || textRoot.querySelector(".teaser-title");
      const title = titleEl == null ? void 0 : titleEl.textContent.replace(/\s+/g, " ").trim();
      if (title) {
        const h = document.createElement("h3");
        h.textContent = title;
        text.push(h);
      }
      const desc = textRoot.querySelector(".teaser-description");
      if (desc && desc.textContent.trim()) {
        const paras = [...desc.querySelectorAll("p")].filter((p) => p.textContent.trim());
        if (paras.length) text.push(...paras);
        else {
          const p = document.createElement("p");
          p.textContent = desc.textContent.replace(/\s+/g, " ").trim();
          text.push(p);
        }
      }
      let links = [...textRoot.querySelectorAll(".cta a[href]")];
      if (!links.length) links = [...textRoot.querySelectorAll("a[href]")];
      links.forEach((link) => {
        const label = link.textContent.replace(/\s+/g, " ").trim();
        if (!label) return;
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = label;
        const p = document.createElement("p");
        p.append(a);
        text.push(p);
      });
      if (!image && !text.length) return;
      cells.push([image || "", text]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (Panels)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-pillars.js
  function parse4(element, { document }) {
    let items = [...element.querySelectorAll(":scope > .kp-section")];
    if (!items.length) items = [...element.querySelectorAll(".image-content")].map((c) => c.closest(".kp-section") || c.parentElement);
    const rows = [];
    items.forEach((item) => {
      const content = item.querySelector(".image-content") || item;
      const image = item.querySelector(".kp-section__image img, img");
      const text = [];
      const titleEl = content.querySelector("h1, h2, h3, h4, h5, .header");
      const title = titleEl == null ? void 0 : titleEl.textContent.replace(/\s+/g, " ").trim();
      if (title) {
        const h = document.createElement("h3");
        h.textContent = title;
        text.push(h);
      }
      content.querySelectorAll("p").forEach((p) => {
        if (p.textContent.replace(/ /g, " ").trim()) text.push(p);
      });
      if (!text.length && !image) return;
      rows.push({ image, text });
    });
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const hasImages = rows.some((r) => r.image);
    const cells = rows.map((r) => hasImages ? [r.image || "", r.text] : [r.text]);
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (Pillars)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse5(element, { document }) {
    const titleEl = element.querySelector("h1, h2, h3, h4, h5, .header");
    const title = titleEl == null ? void 0 : titleEl.textContent.replace(/\s+/g, " ").trim();
    const textCell = [];
    if (title) {
      const h = document.createElement("h3");
      h.textContent = title;
      textCell.push(h);
    }
    element.querySelectorAll("p").forEach((p) => {
      if (!p.closest(".fd-button") && p.textContent.replace(/ /g, " ").trim()) textCell.push(p);
    });
    let links = [...element.querySelectorAll(".fd-button a[href]")];
    if (!links.length) links = [...element.querySelectorAll("a[href]")].filter((a) => !a.closest("p"));
    const actionCell = [];
    links.forEach((link) => {
      const label = link.textContent.replace(/\s+/g, " ").trim();
      if (!label) return;
      const a = document.createElement("a");
      a.href = link.getAttribute("href");
      a.textContent = label;
      const p = document.createElement("p");
      p.append(a);
      actionCell.push(p);
    });
    if (!textCell.length && !actionCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[textCell, actionCell.length ? actionCell : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  function parse6(element, { document }) {
    const items = [...element.querySelectorAll(".icon-link")].filter((el) => el.querySelector(".icon-link-content, .icon-link-title"));
    const cells = [];
    items.forEach((item) => {
      const icon = item.querySelector(".icon-link-icon img") || item.querySelector(":scope > img");
      const text = [];
      const titleEl = item.querySelector(".icon-link-title") || item.querySelector("h2, h3, h4");
      const title = titleEl == null ? void 0 : titleEl.textContent.replace(/\s+/g, " ").trim();
      if (title) {
        const h = document.createElement("h3");
        h.textContent = title;
        text.push(h);
      }
      const sub = item.querySelector(".icon-link-alt-subtitle, .icon-link-subtitle, .icon-link-content");
      if (sub) {
        sub.querySelectorAll(".link-icon-wrapper").forEach((w) => w.remove());
        sub.querySelectorAll('a[title*="new window" i]').forEach((a) => a.removeAttribute("title"));
        sub.querySelectorAll("p").forEach((p) => {
          if (p.textContent.replace(/ /g, " ").trim() && !p.closest(".icon-link-title")) text.push(p);
        });
      }
      if (!icon && !text.length) return;
      cells.push([icon || "", text]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (News)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-notices.js
  function parse7(element, { document }) {
    const heading = element.querySelector(":scope > h1, :scope > h2, :scope > h3, :scope > .page-heading");
    let items = [...element.querySelectorAll(':scope > [class*="column"]')];
    if (!items.length) {
      items = [...element.children].filter((c) => c !== heading && !/^H[1-6]$/.test(c.tagName));
    }
    const cells = [];
    items.forEach((item) => {
      const paras = [...item.querySelectorAll("p")].filter((p) => p.textContent.replace(/ /g, " ").trim());
      let content = paras;
      if (!content.length && item.textContent.trim()) {
        const p = document.createElement("p");
        p.append(...item.childNodes);
        content = [p];
      }
      if (content.length) cells.push([content]);
    });
    let headingEl = null;
    const headingText = heading == null ? void 0 : heading.textContent.replace(/\s+/g, " ").trim();
    if (headingText) {
      headingEl = document.createElement("h2");
      headingEl.textContent = headingText;
    }
    if (!cells.length) {
      if (heading) heading.remove();
      if (headingEl) element.before(headingEl);
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (Notices)", cells });
    if (headingEl) element.before(headingEl);
    element.replaceWith(block);
  }

  // tools/importer/transformers/kp-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        // OneTrust cookie banner + preference center
        "#sda-autocomplete-overlay-container",
        // search autocomplete overlay
        "#ZN_a4M7d69TmslUjze",
        // Qualtrics feedback intercept
        ".QSIFeedbackButton",
        // Qualtrics feedback button
        ".kp-modals-container",
        // hidden modals (gs-modal-pattern-ext)
        ".hub-footer"
        // hidden "leave new member step list" modal (inside main)
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".show-more-less-toggle",
        "hr.show-more-less-divider"
      ]);
      WebImporter.DOMUtils.remove(element, ["#topics-list-api-error"]);
      element.querySelectorAll('img[src*="kp-logo-horizontal-white"]').forEach((img) => {
        if (!img.closest("header, footer")) (img.closest("picture") || img).remove();
      });
      element.querySelectorAll("div.text").forEach((el) => {
        if (!el.querySelector("img, a, picture") && !el.textContent.trim()) el.remove();
      });
      element.querySelectorAll("[data-cmp-src] > img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (src && !/^(data|blob):/.test(src)) return;
        img.setAttribute("src", new URL(img.parentElement.dataset.cmpSrc, element.ownerDocument.baseURI).href);
        img.removeAttribute("width");
        img.removeAttribute("height");
      });
      element.querySelectorAll(".why-kp .kp-title h3").forEach((h3) => {
        const h2 = element.ownerDocument.createElement("h2");
        h2.innerHTML = h3.innerHTML;
        h3.replaceWith(h2);
      });
      WebImporter.DOMUtils.remove(element, [
        ".fd-greeting",
        ".dynamic-script-injection"
      ]);
      element.querySelectorAll(".fd-image").forEach((el) => {
        if (!el.querySelector("img, picture") && !el.textContent.trim()) el.remove();
      });
      const doctors = element.querySelector(".fd-doctors-locations");
      if (doctors) {
        const geoHeading = doctors.querySelector("#find-locations-success .find-locations__title .section-title__title");
        const fallbackTitle = doctors.querySelector("#find-locations-error .welcome-hero__content-title");
        const fallbackText = fallbackTitle && fallbackTitle.textContent.trim();
        if (geoHeading && fallbackText) geoHeading.textContent = fallbackText;
        WebImporter.DOMUtils.remove(doctors, [
          ".find-locations__location-list",
          "#eServicesLabel",
          "#pServicesLabel",
          "#uServicesLabel",
          "#aServicesLabel",
          "#availableLabel",
          "#find-locations-error"
        ]);
      }
      WebImporter.DOMUtils.remove(element, [
        ".dynamic-content-carousel .hidden-card",
        ".dynamic-content-carousel .carousel__buttons"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-dynamicexperiencefragment--global-header",
        "header#kp-header",
        ".cmp-dynamicexperiencefragment--alerts",
        // scam alert carousel
        ".alertsPlaceHolder",
        ".cmp-dynamicexperiencefragment--global-footer",
        ".gs-footer",
        "footer.kp-global-footer"
      ]);
      WebImporter.DOMUtils.remove(element, ["link", "iframe", "noscript", "script", "style"]);
    }
  }

  // tools/importer/transformers/kp-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  var SECTION_ANCHOR_IDS = {
    "health-wellness": {
      3: "well-being-spotlight",
      5: "managing-your-health",
      6: "health-tools",
      7: "health-articles"
    }
  };
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function getMetadataCells(section, templateName) {
    const cells = {};
    if (section.style) cells.style = section.style;
    const anchorId = (SECTION_ANCHOR_IDS[templateName] || {})[section.id];
    if (anchorId) cells.id = anchorId;
    return cells;
  }
  function transform2(hookName, element, payload) {
    const template = payload && payload.template || {};
    const sections = template.sections || [];
    const templateName = template.name;
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const hasMetadata = Object.keys(getMetadataCells(section, templateName)).length > 0;
        if (i === 0 && !hasMetadata) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = element.ownerDocument.createElement("hr");
        if (hasMetadata) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const cells = getMetadataCells(section, templateName);
        if (!Object.keys(cells).length) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(element.ownerDocument, {
          name: "Section Metadata",
          cells
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-northern-california.js
  var parsers = {
    "columns-overlap": parse,
    "cards-spotlight": parse2,
    "cards-teaser": parse3,
    "cards-pillars": parse4,
    "columns-cta": parse5,
    "cards-news": parse6,
    "cards-notices": parse7
  };
  var PAGE_TEMPLATE = {
    "name": "northern-california",
    "urls": [
      "https://healthy.kaiserpermanente.org/northern-california/front-door"
    ],
    "representativeUrl": "https://healthy.kaiserpermanente.org/northern-california/front-door",
    "description": "To be named in naming step",
    "blocks": [
      {
        "name": "columns-overlap",
        "instances": [
          ".gs-text-image .welcome-hero",
          ".gs-text-image .welcome-story"
        ]
      },
      {
        "name": "cards-spotlight",
        "instances": [
          ".dynamic-content-carousel .carousel-thumbstrip-no-conflict"
        ]
      },
      {
        "name": "cards-teaser",
        "instances": [
          ".fd-teaser .fd-teaser-container"
        ]
      },
      {
        "name": "cards-pillars",
        "instances": [
          ".why-kp .kp-section-container"
        ]
      },
      {
        "name": "columns-cta",
        "instances": [
          ".why-kp .kp-care"
        ]
      },
      {
        "name": "cards-news",
        "instances": [
          ".column-control:has(.gs-icon-link-text) > .column-control-container"
        ]
      },
      {
        "name": "cards-notices",
        "instances": [
          ".kp-alerts-bulletin .alerts-container"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "Today's suggestions + virtual care",
        "selector": [
          ".experiencefragment:has(.gs-text-image .welcome-hero)"
        ],
        "style": "grey",
        "blocks": [
          "columns-overlap"
        ],
        "defaultContent": []
      },
      {
        "id": "2",
        "name": "Doctors & locations",
        "selector": [
          ".fd-doctors-locations"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "#find-locations-success .find-locations__title",
          "#find-locations-success .find-locations__footer"
        ]
      },
      {
        "id": "3",
        "name": "More resources intro",
        "selector": [
          ".fd-title:has(> .fd-title > .section-title--bg-gray)"
        ],
        "style": "grey",
        "blocks": [],
        "defaultContent": [
          ".section-title--bg-gray"
        ]
      },
      {
        "id": "4",
        "name": "More resources cards",
        "selector": [
          ".dynamic-content-carousel"
        ],
        "style": null,
        "blocks": [
          "cards-spotlight"
        ],
        "defaultContent": []
      },
      {
        "id": "5",
        "name": "Encyclopedia teasers",
        "selector": [
          ".fd-teaser"
        ],
        "style": null,
        "blocks": [
          "cards-teaser"
        ],
        "defaultContent": []
      },
      {
        "id": "6",
        "name": "Your health. Our cause.",
        "selector": [
          ".experiencefragment:has(.why-kp)"
        ],
        "style": "grey",
        "blocks": [
          "cards-pillars",
          "columns-cta"
        ],
        "defaultContent": [
          ".why-kp .kp-title"
        ]
      },
      {
        "id": "7",
        "name": "News & perspectives",
        "selector": [
          ".fd-title:has(> .fd-title > .news-pers__title)"
        ],
        "style": null,
        "blocks": [
          "cards-news"
        ],
        "defaultContent": [
          ".news-pers__title"
        ]
      },
      {
        "id": "8",
        "name": "Important notices",
        "selector": [
          ".alertBulletin"
        ],
        "style": null,
        "blocks": [
          "cards-notices"
        ],
        "defaultContent": [
          ".kp-alerts-bulletin .page-heading"
        ]
      }
    ],
    "urlPattern": "/northern-california/*"
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_northern_california_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      const meta = WebImporter.Blocks.getMetadata(document);
      meta.Template = "health-wellness";
      meta.Theme = "front-door";
      main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_northern_california_exports);
})();
