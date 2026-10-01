(() => {
  'use strict';
  function init() {
    const root = document.getElementById('ap-page');
    if (!root || root.dataset.apReady) return;
    root.dataset.apReady = 'true';
    // Calendar intentionally omitted at your request. Add a verified HTTPS URL later.
    const CALENDAR_URL = '';
    const form = root.querySelector('#ap-form');
    const error = root.querySelector('#ap-form-error');
    const hiddenFields = root.querySelector('#ap-hidden-fields');
    const intentNote = root.querySelector('#ap-intent-note');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const storageKey = 'away-pods-apollo-attribution-v1';
    const params = new URLSearchParams(location.search);
    const utmKey = /^utm_[a-z0-9_]{1,50}$/i;
    let attribution = {};
    let started = false;

    // Latest tagged visit wins as a complete set. Untagged navigation keeps the
    // current session's campaign. No names, email addresses or briefs enter analytics.
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        for (const [key, value] of Object.entries(saved)) {
          if (utmKey.test(key) && typeof value === 'string') attribution[key] = value.slice(0, 500);
        }
      }
    } catch (_) { /* Storage can be unavailable in private browsing. */ }
    const incoming = {};
    params.forEach((value, key) => {
      if (utmKey.test(key)) incoming[key.toLowerCase()] = value.slice(0, 500);
    });
    if (Object.keys(incoming).length) {
      attribution = incoming;
      try { sessionStorage.setItem(storageKey, JSON.stringify(attribution)); } catch (_) {}
    }
    function hidden(name, value) {
      let input = Array.from(hiddenFields.children).find(el => el.name === name);
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.dataset.name = name;
        hiddenFields.appendChild(input);
      }
      input.value = value;
      input.setAttribute('value', value);
    }
    Object.entries(attribution).forEach(([key, value]) => hidden(key, value));
    hidden('landing_page', location.origin + location.pathname);
    hidden('lead_source', 'Apollo landing page');
    hidden('requested_samples', '');
    hidden('founder_call_requested', '');

    // GTM custom-event source only. Connect these to GA4 in GTM, respecting your
    // existing consent settings. Do not also call gtag for the same events.
    function track(event, details = {}) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event, page_type: 'away_pods_start', ...details});
    }
    track('apollo_lp_view');
    function markStarted() {
      if (started) return;
      started = true;
      track('apollo_form_start');
    }
    form.addEventListener('input', markStarted);
    form.addEventListener('change', markStarted);
    root.querySelectorAll('[data-ap-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

    function scrollToForm() {
      root.querySelector('#ap-start').scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'});
      root.querySelector('#ap-email').focus({preventScroll: true});
    }
    root.querySelectorAll('[data-ap-cta]').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        track('apollo_primary_cta_click', {cta_location: link.dataset.apCta});
        scrollToForm();
      });
    });
    const samples = new Set();
    root.querySelectorAll('[data-ap-sample]').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        samples.add(link.dataset.apSample);
        hidden('requested_samples', Array.from(samples).join(', '));
        intentNote.textContent = 'Sample requested: ' + Array.from(samples).join(', ') + '. Add your work brief below.';
        intentNote.hidden = false;
        scrollToForm();
      });
    });
    root.querySelectorAll('[data-ap-calendar]').forEach(link => {
      if (CALENDAR_URL) {
        link.href = CALENDAR_URL;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.addEventListener('click', () => track('apollo_calendar_click', {cta_location: link.dataset.apCalendar}));
      } else if (link.dataset.apCalendar === 'success') {
        link.hidden = true;
        root.querySelector('[data-ap-calendar-fallback]').hidden = false;
      } else {
        link.innerHTML = 'Request a founder call <span aria-hidden="true">↗</span>';
        link.addEventListener('click', event => {
          event.preventDefault();
          hidden('founder_call_requested', 'Yes');
          intentNote.textContent = 'Leave your details and we’ll follow up to arrange a founder call.';
          intentNote.hidden = false;
          scrollToForm();
        });
      }
    });

    // Endpoint placeholder lives on #ap-form (data-endpoint). Wire the provider
    // and enable the submit button once its request/response format is known.
    form.addEventListener('submit', event => {
      event.preventDefault();
      error.hidden = false;
    });

    const sticky = root.querySelector('.ap-mobile-cta');
    let heroVisible = true;
    let formVisible = false;
    function updateSticky() { sticky.hidden = heroVisible || formVisible; }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.target.classList.contains('ap-hero')) heroVisible = entry.isIntersecting;
          else formVisible = entry.isIntersecting;
        });
        updateSticky();
      }, {threshold: 0});
      observer.observe(root.querySelector('.ap-hero'));
      observer.observe(root.querySelector('#ap-start'));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
