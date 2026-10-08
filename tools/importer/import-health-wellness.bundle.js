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

  // tools/importer/import-health-wellness.js
  var import_health_wellness_exports = {};
  __export(import_health_wellness_exports, {
    default: () => import_health_wellness_default
  });

  // tools/importer/parsers/hero-wellness.js
  function parse(element, { document }) {
    const image = element.querySelector("img.ds-hero__background-image") || element.querySelector("img");
    const heading = element.querySelector(".cmp-teaser__title") || element.querySelector("h1, h2");
    const descRoot = element.querySelector(".cmp-teaser__description");
    const paragraphs = descRoot ? [...descRoot.querySelectorAll("p")].filter((p) => p.textContent.trim()) : [...element.querySelectorAll("p")].filter((p) => p.textContent.trim());
    const ctas = [...element.querySelectorAll(".cmp-teaser__action-container a, .cmp-button-container a")].filter((a, i, arr) => arr.indexOf(a) === i && a.textContent.trim());
    if (!heading && !paragraphs.length && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (image && /\.(png|jpe?g|gif|webp|svg)$/i.test((image.getAttribute("alt") || "").trim())) {
      image.setAttribute("alt", "");
    }
    const cells = [];
    if (image) cells.push([image]);
    const contentCell = [];
    if (heading) contentCell.push(heading);
    contentCell.push(...paragraphs);
    ctas.forEach((a) => {
      const p = document.createElement("p");
      p.append(a);
      contentCell.push(p);
    });
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-wellness", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-spotlight.js
  function parseCarouselItems(items, document) {
    const cells = [];
    items.forEach((item) => {
      const card2 = item.querySelector("a[href]");
      const image = item.querySelector("img");
      const href = card2 == null ? void 0 : card2.getAttribute("href");
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
        const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-spotlight", cells: carouselCells });
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
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-spotlight", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-promo.js
  function parse3(element, { document }) {
    const image = element.querySelector(".ds-banner__icon-img img") || element.querySelector("img");
    const headerEl = element.querySelector(".ds-banner__main-header") || element.querySelector("h1, h2, h3, h4");
    let heading = null;
    if (headerEl && headerEl.textContent.trim()) {
      heading = document.createElement(/^H[1-6]$/.test(headerEl.tagName) ? headerEl.tagName.toLowerCase() : "h2");
      heading.textContent = headerEl.textContent.trim();
    }
    const bodyRoot = element.querySelector(".ds-banner__main-body");
    const body = bodyRoot ? [...bodyRoot.querySelectorAll("p")].filter((p) => p.textContent.trim()) : [];
    if (bodyRoot && !body.length && bodyRoot.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = bodyRoot.textContent.trim();
      body.push(p);
    }
    const links = [...element.querySelectorAll(".ds-banner__main-action-button a[href]")].filter((a) => a.textContent.trim()).map((a) => {
      const link = document.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      const p = document.createElement("p");
      p.append(link);
      return p;
    });
    if (!heading && !body.length && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const text = [];
    if (heading) text.push(heading);
    text.push(...body, ...links);
    const cells = [[image || "", text]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-topics.js
  function parse4(element, { document }) {
    const image = element.querySelector(".columns-4 img, .cmp-image img") || element.querySelector("img");
    const headingSrc = element.querySelector(".cmp-text h2, .cmp-text h3") || element.querySelector("h2, h3");
    let heading = null;
    if (headingSrc && headingSrc.textContent.trim()) {
      heading = document.createElement(headingSrc.tagName.toLowerCase());
      heading.textContent = headingSrc.textContent.replace(/\s+/g, " ").trim();
    }
    let items = [...element.querySelectorAll(".show-more-less-item")];
    let anchors = items.map((item) => item.querySelector("a[href]")).filter(Boolean);
    if (!anchors.length) {
      anchors = [...element.querySelectorAll(".show-more-less a[href], .columns-8 a[href]")];
    }
    const ul = document.createElement("ul");
    anchors.forEach((a) => {
      const text2 = a.textContent.replace(/\s+/g, " ").trim();
      if (!text2) return;
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = text2;
      li.append(link);
      ul.append(li);
    });
    const toggle = element.querySelector(".show-more-less-toggle");
    const moreLabel = toggle && toggle.textContent.replace(/\(\s*\d+\s*\)/, "").replace(/\s+/g, " ").trim() || "Show more";
    if (!heading && !ul.children.length && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const text = [];
    if (heading) text.push(heading);
    if (ul.children.length) {
      text.push(ul);
      const label = document.createElement("p");
      label.textContent = moreLabel;
      text.push(label);
    }
    const cells = [[image || "", text]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-topics", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-tools.js
  function parse5(element, { document }) {
    let tiles = [...element.querySelectorAll(".gs-card-outer")];
    if (!tiles.length) tiles = [...element.querySelectorAll(".ds-card__content")];
    const cells = [];
    tiles.forEach((tile) => {
      const titleEl = tile.querySelector(".ds-card__title h2, .ds-card__title h3, .ds-card__title h4") || tile.querySelector(".ds-card__title, h2, h3, h4");
      const summary = [...tile.querySelectorAll(".ds-card__summary p, .ds-card__subtitle p")].filter((p) => p.textContent.trim());
      const linkEls = [...tile.querySelectorAll(".ds-card__links-container a[href]")];
      if (!linkEls.length) {
        const a = tile.querySelector("a[href]");
        if (a) linkEls.push(a);
      }
      const content = [];
      if (titleEl && titleEl.textContent.trim()) {
        const h = document.createElement(/^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : "h3");
        h.textContent = titleEl.textContent.replace(/\s+/g, " ").trim();
        content.push(h);
      }
      content.push(...summary);
      linkEls.forEach((a) => {
        const text = a.textContent.replace(/\s+/g, " ").trim();
        if (!text) return;
        const link = document.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = text;
        const p = document.createElement("p");
        p.append(link);
        content.push(p);
      });
      if (content.length) cells.push([content]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const toggle = element.querySelector(".show-more-less-toggle");
    const label = toggle && toggle.textContent.replace(/\(\s*\d+\s*\)/, "").replace(/\s+/g, " ").trim() || "View all tools for you";
    const labelP = document.createElement("p");
    labelP.textContent = label;
    const lessP = document.createElement("p");
    lessP.textContent = "View less";
    cells.push([[labelP, lessP]]);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-tools", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-articles.js
  var MAX_ARTICLES = 6;
  function slug(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function card(document, { image, eyebrow, title, href }) {
    const text = [];
    if (eyebrow) {
      const p = document.createElement("p");
      p.textContent = eyebrow;
      text.push(p);
    }
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
    if (!image && !text.length) return null;
    return [image || "", text];
  }
  function cellsFromDom(list, document) {
    let items = [...list.querySelectorAll(":scope > .card-container")];
    if (!items.length) items = [...list.querySelectorAll(".slick-slide__card")];
    return items.map((item) => {
      var _a, _b, _c, _d;
      return card(document, {
        image: item.querySelector(".image-section img") || item.querySelector("img"),
        eyebrow: (_a = item.querySelector(".-category")) == null ? void 0 : _a.textContent.replace(/\s+/g, " ").trim(),
        title: (_b = item.querySelector(".-title") || item.querySelector("h2, h3, h4")) == null ? void 0 : _b.textContent.replace(/\s+/g, " ").trim(),
        href: ((_c = item.querySelector("a.card-content[href]")) == null ? void 0 : _c.getAttribute("href")) || ((_d = item.querySelector("a[href]")) == null ? void 0 : _d.getAttribute("href"))
      });
    }).filter(Boolean);
  }
  function cellsFromApi(wrapper, topic, document) {
    if (!(wrapper == null ? void 0 : wrapper.dataset.apiurl) || !wrapper.dataset.apiQuery) return [];
    let items = [];
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", wrapper.dataset.apiurl, false);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(wrapper.dataset.apiQuery);
      if (xhr.status === 200) items = JSON.parse(xhr.responseText);
    } catch (e) {
      console.warn(`cards-articles: could not load articles for "${topic}"`, e);
    }
    const urlPattern = wrapper.dataset.healthArticleUrl || "/health-wellness/healtharticle.{2}";
    return (Array.isArray(items) ? items : []).slice(0, MAX_ARTICLES).map((item) => {
      var _a;
      const imageData = item.primaryImageOfPage || {};
      let image = null;
      if (imageData.value) {
        image = document.createElement("img");
        image.src = imageData.value;
        image.alt = imageData["alt-en"] || "";
      }
      return card(document, {
        image,
        eyebrow: topic,
        title: ((_a = item.headline) == null ? void 0 : _a.value) || item.title,
        href: item.name ? urlPattern.replace("{2}", item.name) : ""
      });
    }).filter(Boolean);
  }
  function viewAllLink(button, document) {
    var _a;
    const source = (button == null ? void 0 : button.querySelector("a[href]")) || button;
    if (!((_a = source == null ? void 0 : source.getAttribute) == null ? void 0 : _a.call(source, "href"))) return null;
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = source.getAttribute("href");
    a.textContent = source.textContent.replace(/\s+/g, " ").trim();
    p.append(a);
    return p;
  }
  function parse6(element, { document }) {
    var _a;
    const container = element.matches(".topics-list-main-container") ? element : element.closest(".topics-list-main-container") || element;
    const list = container.querySelector("#topics-list-group") || container;
    const topics = [...container.querySelectorAll(".topics-filter-category a")].map((a) => (a.dataset.healthtopic || a.textContent).replace(/\s+/g, " ").trim()).filter(Boolean);
    const label = (_a = container.querySelector(".topics-label")) == null ? void 0 : _a.textContent.replace(/\s+/g, " ").trim();
    const buttons = [...container.querySelectorAll(".topicsViewButton")];
    const wrappers = [...container.querySelectorAll("[data-api-query]")];
    if (!topics.length) {
      const cells = cellsFromDom(list, document);
      if (!cells.length) {
        element.replaceWith(...element.childNodes);
        return;
      }
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "cards-articles", cells }));
      return;
    }
    const nodes = [];
    topics.forEach((topic, i) => {
      const selected = container.querySelector(".topics-filter-category a.selected");
      const isSelected = selected ? (selected.dataset.healthtopic || selected.textContent).replace(/\s+/g, " ").trim() === topic : i === 0;
      const wrapper = wrappers.find((w) => w.dataset.healthtopic === topic);
      const cells = isSelected ? cellsFromDom(list, document) : cellsFromApi(wrapper, topic, document);
      if (!cells.length) return;
      const meta = { style: "tabs", "tab-id": slug(topic), "tab-title": topic };
      if (!nodes.length && label) meta["tabs-label"] = label;
      nodes.push(document.createElement("hr"));
      nodes.push(WebImporter.Blocks.createBlock(document, { name: "Section Metadata", cells: meta }));
      nodes.push(WebImporter.Blocks.createBlock(document, { name: "cards-articles", cells }));
      const link = viewAllLink(buttons[i], document);
      if (link) nodes.push(link);
    });
    if (!nodes.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(...nodes);
  }

  // tools/importer/parsers/cards-care.js
  function parse7(element, { document }) {
    let items = [...element.querySelectorAll(':scope > [class*="columns-"]')];
    if (!items.length) items = [...element.querySelectorAll(".ds-icon-with-text")].map((c) => c.parentElement);
    const cells = [];
    items.forEach((item) => {
      const icon = item.querySelector(".cmp-image img") || item.querySelector("img");
      const titleEl = item.querySelector("h1, h2, h3, h4");
      const descriptions = [...item.querySelectorAll(":scope > .text .cmp-text")].filter((t) => t.textContent.replace(/ /g, " ").trim()).map((t) => {
        const p = document.createElement("p");
        p.textContent = t.textContent.replace(/\s+/g, " ").trim();
        return p;
      });
      const links = [...item.querySelectorAll(".gs-button a, a.button")].filter((a, i, arr) => arr.indexOf(a) === i && a.textContent.trim()).map((a) => {
        const link = document.createElement("a");
        link.href = a.getAttribute("href") || "#";
        link.textContent = a.textContent.replace(/\s+/g, " ").trim();
        if (a.title) link.title = a.title;
        const p = document.createElement("p");
        p.append(link);
        return p;
      });
      const text = [];
      if (titleEl && titleEl.textContent.trim()) {
        const h = document.createElement("h3");
        h.textContent = titleEl.textContent.replace(/\s+/g, " ").trim();
        text.push(h);
      }
      text.push(...descriptions, ...links);
      if (!icon && !text.length) return;
      cells.push([icon || "", text]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-care", cells });
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

  // tools/importer/import-health-wellness.js
  var parsers = {
    "hero-wellness": parse,
    "cards-spotlight": parse2,
    "columns-promo": parse3,
    "columns-topics": parse4,
    "cards-tools": parse5,
    "cards-articles": parse6,
    "cards-care": parse7
  };
  var PAGE_TEMPLATE = {
    "name": "health-wellness",
    "urls": [
      "https://healthy.kaiserpermanente.org/health-wellness"
    ],
    "representativeUrl": "https://healthy.kaiserpermanente.org/health-wellness",
    "description": "Kaiser Permanente health & wellness hub: hero, jump links, spotlight cards, promo banner, topic pills, tools tiles, related articles, connecting-to-care module",
    "urlPattern": "/*",
    "blocks": [
      {
        "name": "hero-wellness",
        "instances": [
          ".gs-heroPattern .ds-hero"
        ]
      },
      {
        "name": "cards-spotlight",
        "instances": [
          ".column-control.margin-bottom-4u .gs-card-group .ds-card-group"
        ]
      },
      {
        "name": "columns-promo",
        "instances": [
          ".gs-banner .ds-banner"
        ]
      },
      {
        "name": "columns-topics",
        "instances": [
          ".column-control.blue-5 > .column-control-container"
        ]
      },
      {
        "name": "cards-tools",
        "instances": [
          ".gs-show-more-less .show-more-less:not(.--inline)"
        ]
      },
      {
        "name": "cards-articles",
        "instances": [
          ".topics-list-main-container"
        ]
      },
      {
        "name": "cards-care",
        "instances": [
          ".cmp-dynamicexperiencefragment--get-care-module .aem-Grid > .column-control:nth-of-type(2) .rows"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "Hero",
        "selector": [
          ".gs-heroPattern"
        ],
        "style": null,
        "blocks": [
          "hero-wellness"
        ],
        "defaultContent": []
      },
      {
        "id": "2",
        "name": "Jump to section",
        "selector": [
          ".column-control:has(#well-being-spotlight)"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".column-control:has(#well-being-spotlight) .text.margin-bottom-2u",
          ".column-control:has(#well-being-spotlight) .gs-show-more-less"
        ]
      },
      {
        "id": "3",
        "name": "Healthy living spotlight",
        "selector": [
          ".ds-icon-with-text:has(> #well-being-spotlight)"
        ],
        "style": null,
        "blocks": [
          "cards-spotlight"
        ],
        "defaultContent": [
          "#well-being-spotlight"
        ]
      },
      {
        "id": "4",
        "name": "Flu promo banner",
        "selector": [
          ".column-control:has(.gs-banner)"
        ],
        "style": null,
        "blocks": [
          "columns-promo"
        ],
        "defaultContent": []
      },
      {
        "id": "5",
        "name": "Browse topics",
        "selector": [
          ".column-control.blue-5"
        ],
        "style": "light-blue",
        "blocks": [
          "columns-topics"
        ],
        "defaultContent": []
      },
      {
        "id": "6",
        "name": "Tools for you",
        "selector": [
          ".column-control:has(#health-tools)"
        ],
        "style": null,
        "blocks": [
          "cards-tools"
        ],
        "defaultContent": [
          "#health-tools"
        ]
      },
      {
        "id": "7",
        "name": "Related articles",
        "selector": [
          ".column-control:has(#health-articles)"
        ],
        "style": null,
        "blocks": [
          "cards-articles"
        ],
        "defaultContent": [
          "#health-articles",
          "#explore-library"
        ]
      },
      {
        "id": "8",
        "name": "Connecting to care",
        "selector": [
          ".dynamic-experience-fragment.blue-5"
        ],
        "style": "light-blue",
        "blocks": [
          "cards-care"
        ],
        "defaultContent": [
          ".cmp-dynamicexperiencefragment--get-care-module .aem-Grid > .column-control:nth-of-type(1)"
        ]
      }
    ]
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
  var import_health_wellness_default = {
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
  return __toCommonJS(import_health_wellness_exports);
})();
