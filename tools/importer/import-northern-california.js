/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsOverlapParser from './parsers/columns-overlap.js';
import cardsSpotlightParser from './parsers/cards-spotlight.js';
import cardsTeaserParser from './parsers/cards-teaser.js';
import cardsPillarsParser from './parsers/cards-pillars.js';
import columnsCtaParser from './parsers/columns-cta.js';
import cardsNewsParser from './parsers/cards-news.js';
import cardsNoticesParser from './parsers/cards-notices.js';

// TRANSFORMER IMPORTS
import kpCleanupTransformer from './transformers/kp-cleanup.js';
import kpSectionsTransformer from './transformers/kp-sections.js';

// PARSER REGISTRY
const parsers = {
  'columns-overlap': columnsOverlapParser,
  'cards-spotlight': cardsSpotlightParser,
  'cards-teaser': cardsTeaserParser,
  'cards-pillars': cardsPillarsParser,
  'columns-cta': columnsCtaParser,
  'cards-news': cardsNewsParser,
  'cards-notices': cardsNoticesParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
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

// TRANSFORMER REGISTRY - cleanup first, then sections (sections runs in both hooks)
const transformers = [
  kpCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [kpSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
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
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (cleanup + section breaks)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
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

    // 4. afterTransform (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    // Page metadata + Template (KP design system shared with /health-wellness)
    const meta = WebImporter.Blocks.getMetadata(document);
    meta.Template = 'health-wellness';
    meta.Theme = 'front-door';
    main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (root URL maps to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
