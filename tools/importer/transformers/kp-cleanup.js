/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Kaiser Permanente (healthy.kaiserpermanente.org) site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / widgets that can interfere with parsing
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk', // OneTrust cookie banner + preference center
      '#sda-autocomplete-overlay-container', // search autocomplete overlay
      '#ZN_a4M7d69TmslUjze', // Qualtrics feedback intercept
      '.QSIFeedbackButton', // Qualtrics feedback button
      '.kp-modals-container', // hidden modals (gs-modal-pattern-ext)
      '.hub-footer', // hidden "leave new member step list" modal (inside main)
    ]);

    // Show more / less toggles and their hidden dividers (cards-tools, columns-topics)
    WebImporter.DOMUtils.remove(element, [
      '.show-more-less-toggle',
      'hr.show-more-less-divider',
    ]);

    // Related articles: the topic rail, per-topic API wrappers and "View ... articles"
    // buttons are kept for the cards-articles parser (it turns each topic into a tab);
    // only the client-side API error notification is dropped
    WebImporter.DOMUtils.remove(element, ['#topics-list-api-error']);

    // White KP logo rendered outside the header (ends up above the hero otherwise)
    element.querySelectorAll('img[src*="kp-logo-horizontal-white"]').forEach((img) => {
      if (!img.closest('header, footer')) (img.closest('picture') || img).remove();
    });

    // Empty AEM text components (e.g. div.text.margin-bottom-4u with only comments)
    element.querySelectorAll('div.text').forEach((el) => {
      if (!el.querySelector('img, a, picture') && !el.textContent.trim()) el.remove();
    });

    // AEM core lazy images: the <img> holds a 1x1 placeholder until scrolled into view;
    // the real asset path is on the wrapper's data-cmp-src
    element.querySelectorAll('[data-cmp-src] > img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src && !/^(data|blob):/.test(src)) return;
      img.setAttribute('src', new URL(img.parentElement.dataset.cmpSrc, element.ownerDocument.baseURI).href);
      img.removeAttribute('width');
      img.removeAttribute('height');
    });

    // ---- Front-door (/{region}/front-door) components. None of these classes
    // exist on /health-wellness, so its output is unaffected. ----

    // "Your health. Our cause." heads its own section: promote the source H3 to H2
    element.querySelectorAll('.why-kp .kp-title h3').forEach((h3) => {
      const h2 = element.ownerDocument.createElement('h2');
      h2.innerHTML = h3.innerHTML;
      h3.replaceWith(h2);
    });

    // Empty personalized greeting + geo city/region picker link (div.fd-greeting),
    // empty script-injection component. (The div.print-only logo is already
    // handled by the kp-logo-horizontal-white rule above.)
    WebImporter.DOMUtils.remove(element, [
      '.fd-greeting',
      '.dynamic-script-injection',
    ]);

    // Empty image components (div.fd-image with no image or text)
    element.querySelectorAll('.fd-image').forEach((el) => {
      if (!el.querySelector('img, picture') && !el.textContent.trim()) el.remove();
    });

    // Doctors & locations: source is geo-personalized. Swap the geo heading
    // ("Locations near Ashburn, VA") for the static fallback heading from
    // #find-locations-error ("Doctors & locations"), then drop the geo tiles,
    // the JS-only service labels and the fallback block itself. Icon, paragraph
    // and "Find a doctor or location" link (.find-locations__footer) are kept.
    const doctors = element.querySelector('.fd-doctors-locations');
    if (doctors) {
      const geoHeading = doctors.querySelector('#find-locations-success .find-locations__title .section-title__title');
      const fallbackTitle = doctors.querySelector('#find-locations-error .welcome-hero__content-title');
      const fallbackText = fallbackTitle && fallbackTitle.textContent.trim();
      if (geoHeading && fallbackText) geoHeading.textContent = fallbackText;
      WebImporter.DOMUtils.remove(doctors, [
        '.find-locations__location-list',
        '#eServicesLabel',
        '#pServicesLabel',
        '#uServicesLabel',
        '#aServicesLabel',
        '#availableLabel',
        '#find-locations-error',
      ]);
    }

    // More resources carousel (cards-spotlight): the empty template card and the
    // hidden prev/next nav + paging ("Showing 1-4 of 4", hidden "View all" link)
    // sit outside the block selector (.carousel-thumbstrip-no-conflict) and would
    // otherwise leak into the section as default content
    WebImporter.DOMUtils.remove(element, [
      '.dynamic-content-carousel .hidden-card',
      '.dynamic-content-carousel .carousel__buttons',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome: header/nav, alert bar, footer
    WebImporter.DOMUtils.remove(element, [
      '.cmp-dynamicexperiencefragment--global-header',
      'header#kp-header',
      '.cmp-dynamicexperiencefragment--alerts', // scam alert carousel
      '.alertsPlaceHolder',
      '.cmp-dynamicexperiencefragment--global-footer',
      '.gs-footer',
      'footer.kp-global-footer',
    ]);

    // Non-content elements
    WebImporter.DOMUtils.remove(element, ['link', 'iframe', 'noscript', 'script', 'style']);
  }
}
