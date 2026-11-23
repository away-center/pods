(() => {
  'use strict';
  function init() {
    const root = document.getElementById('ap-page');
    if (!root || root.dataset.apReady) return;
    root.dataset.apReady = 'true';
    const form = root.querySelector('#ap-form');
    const error = root.querySelector('#ap-form-error');
    const hiddenFields = root.querySelector('#ap-hidden-fields');
    const intentNote = root.querySelector('#ap-intent-note');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let started = false;
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
      root.querySelector('#ap-first-name').focus({preventScroll: true});
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
        intentNote.textContent = 'Sample requested: ' + Array.from(samples).join(', ') + '. You can add context in the message field.';
        intentNote.hidden = false;
        scrollToForm();
      });
    });
    const country = root.querySelector('#ap-country');
    const regions = new Intl.DisplayNames('en', {type: 'region'});
    const countryCodes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
    const countryNames = countryCodes.map(code => regions.of(code)).sort((a, b) => a.localeCompare(b));
    for (const name of countryNames) country.add(new Option(name, name));

    podsEnquiry.bind(form, {
      status: error,
      success: root.querySelector('.ap-success'),
      context: {page: 'start'},
      onSuccess: () => track('apollo_form_submit')
    });

    const sticky = root.querySelector('.ap-mobile-cta');
    let heroVisible = true;
    let formVisible = false;
    function updateSticky() { sticky.hidden = heroVisible || formVisible; }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.target.classList.contains('hero')) heroVisible = entry.isIntersecting;
          else formVisible = entry.isIntersecting;
        });
        updateSticky();
      }, {threshold: 0});
      observer.observe(root.querySelector('.hero'));
      observer.observe(root.querySelector('#ap-start'));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
