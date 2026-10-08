/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Kaiser Permanente section breaks + Section Metadata.
 * Uses payload.template.sections (selectors verified in migration-work/cleaned.html).
 *
 * Breaks (<hr>) are inserted in beforeTransform (before parsers replace elements);
 * Section Metadata blocks are inserted in afterTransform, anchored to a marker <hr>.
 *
 * In-page anchor ids (targets of the "Jump to section" links, from
 * authoring-analysis.json sectionMetadata.id) are preserved as a Section Metadata
 * `id` property alongside `style`.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

// Per template (payload.template.name): template section id -> in-page anchor id.
// health-wellness: #well-being-spotlight, a#managing-your-health, #health-tools,
// #health-articles (targets of its "Jump to section" links).
// northern-california: no section-metadata ids in its authoring-analysis -> none.
const SECTION_ANCHOR_IDS = {
  'health-wellness': {
    3: 'well-being-spotlight',
    5: 'managing-your-health',
    6: 'health-tools',
    7: 'health-articles',
  },
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

export default function transform(hookName, element, payload) {
  const template = (payload && payload.template) || {};
  const sections = template.sections || [];
  const templateName = template.name;
  if (sections.length < 2) return;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const hasMetadata = Object.keys(getMetadataCells(section, templateName)).length > 0;
      if (i === 0 && !hasMetadata) continue;
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue;

      const hr = element.ownerDocument.createElement('hr');
      if (hasMetadata) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const cells = getMetadataCells(section, templateName);
      if (!Object.keys(cells).length) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(element.ownerDocument, {
        name: 'Section Metadata',
        cells,
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }
  }
}
