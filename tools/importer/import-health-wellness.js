/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroWellnessParser from './parsers/hero-wellness.js';
import cardsSpotlightParser from './parsers/cards-spotlight.js';
import columnsPromoParser from './parsers/columns-promo.js';
import columnsTopicsParser from './parsers/columns-topics.js';
import cardsToolsParser from './parsers/cards-tools.js';
import cardsArticlesParser from './parsers/cards-articles.js';
import cardsCareParser from './parsers/cards-care.js';

// TRANSFORMER IMPORTS
import kpCleanupTransformer from './transformers/kp-cleanup.js';
import kpSectionsTransformer from './transformers/kp-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-wellness': heroWellnessParser,
  'cards-spotlight': cardsSpotlightParser,
  'columns-promo': columnsPromoParser,
  'columns-topics': columnsTopicsParser,
  'cards-tools': cardsToolsParser,
  'cards-articles': cardsArticlesParser,
  'cards-care': cardsCareParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
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
    // Page metadata + Template (scopes the KP design system to these pages)
    const meta = WebImporter.Blocks.getMetadata(document);
    meta.Template = 'health-wellness';
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
