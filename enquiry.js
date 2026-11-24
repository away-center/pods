(() => {
  'use strict';
  const pending = new WeakMap();
  const storageKey = 'pods-attribution-v2';
  const read = key => { try { return JSON.parse(sessionStorage.getItem(key) || '{}'); } catch { return {}; } };
  const write = (key, data) => { try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {} };
  const saved = read(storageKey);
  let attribution = {};
  for (const [key, value] of Object.entries(saved || {})) {
    if ((/^utm_[a-z0-9_]{1,50}$/.test(key) || ['landing_page','cta_source'].includes(key)) && typeof value === 'string')
      attribution[key] = value.slice(0, key === 'landing_page' ? 2000 : 500);
  }
  const incoming = {};
  for (const [key, value] of new URLSearchParams(location.search)) {
    if (/^utm_[a-z0-9_]{1,50}$/i.test(key)) incoming[key.toLowerCase()] = value.slice(0,500);
  }
  const savedCampaign = Object.keys(attribution).filter(key => /^utm_/.test(key));
  const sameCampaign = savedCampaign.length === Object.keys(incoming).length && savedCampaign.every(key => attribution[key] === incoming[key]);
  if (Object.keys(incoming).length && !sameCampaign) {
    attribution = {...incoming, landing_page:location.origin + location.pathname};
  }
  attribution.landing_page ||= location.origin + location.pathname;
  const source = new URLSearchParams(location.search).get('cta_source');
  if (source) attribution.cta_source = source.slice(0,200);
  write(storageKey, attribution);
  function setSource(source) {
    attribution.cta_source = source.slice(0,200);
    write(storageKey,attribution);
  }
  // Capture before page-specific handlers. Navigation stays native (including new tabs).
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const url = new URL(link.href,location.href);
    if (url.origin !== location.origin) return;
    if (link.hasAttribute('data-ap-cta') || link.hasAttribute('data-ap-sample') ||
        link.hasAttribute('data-cta-source') || ['/start/','/contact/'].includes(url.pathname) ||
        ['#build','#enquire','#ap-start'].includes(url.hash)) {
      setSource(link.dataset.ctaSource || link.dataset.apCta || link.dataset.apSample ||
        `${location.pathname}:${link.closest('section')?.id || link.closest('header,footer')?.tagName.toLowerCase() || 'navigation'}:${link.textContent.trim()}`);
      if (url.pathname !== location.pathname) {
        for (const [key,value] of Object.entries(attribution)) if (/^utm_/.test(key)) url.searchParams.set(key,value);
        url.searchParams.set('cta_source',attribution.cta_source);
        link.href = url.href;
      }
    }
  },true);
  const retry = 'We couldn’t send your enquiry. Your details are still here. Please try again.';
  function calendar(container) {
    const anchor = container.querySelector('[data-founder-calendar], [data-ap-calendar="success"]');
    const fallback = container.querySelector('[data-calendar-fallback], [data-ap-calendar-fallback]');
    let url;
    try { url = new URL(window.PODS_CONFIG?.founderCalendarUrl); } catch {}
    const valid = url?.protocol === 'https:' && !url.username && !url.password;
    if (anchor) {
      anchor.hidden = !valid;
      if (valid) { anchor.href = url.href; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; }
      else anchor.removeAttribute('href');
    }
    if (fallback) fallback.hidden = !!valid;
  }
  function bind(form, options = {}) {
    const button = form.querySelector('[type="submit"]');
    const status = options.status || form.querySelector('[data-form-status]');
    const success = options.success || form.parentElement.querySelector('[data-enquiry-success]');
    if (success) calendar(success);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (button.disabled || !form.reportValidity()) return;
      button.disabled = true;
      form.setAttribute('aria-busy','true');
      status.hidden = false;
      status.className = 'form-status pending';
      status.textContent = 'Sending your enquiry…';
      try {
        await send(form,typeof options.context === 'function' ? options.context() : options.context || {});
        status.className = 'form-status ok';
        status.textContent = 'Thanks. Your enquiry has been received.';
        if (success) { form.hidden = true; success.hidden = false; success.classList.add('ap-submitted'); success.focus(); }
        options.onSuccess?.();
      } catch (error) {
        status.className = 'form-status err';
        status.textContent = error.message;
        status.tabIndex = -1;
        status.focus();
      } finally { button.disabled = false; form.removeAttribute('aria-busy'); }
    });
  }
  async function send(form, context = {}) {
    const data = {...Object.fromEntries(new FormData(form)),...context,...attribution};
    for (const key of Object.keys(data)) if (typeof data[key] === 'string') data[key] = data[key].trim();
    data.name ||= [data.first_name,data.last_name].filter(Boolean).join(' ');
    if (!/^\+[1-9]\d{0,3}$/.test(data.phone_country_code || '') ||
        !/^[0-9() .-]{6,25}$/.test(data.phone || ''))
      throw new Error('Please enter a country code (such as +1) and a valid phone number.');

    if (!data.name || !data.brief || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || ''))
      throw new Error('Please enter your name, a valid work email and the work you need help with.');
    data.submission_page = location.origin + location.pathname;
    data.cta_source ||= 'direct';
    data.lead_source = data.cta_source;
    const snapshot = JSON.stringify(data);
    let state = pending.get(form);
    if (state?.snapshot !== snapshot) {
      state = {snapshot,id:crypto.randomUUID(),submittedAt:new Date().toISOString()};
      pending.set(form,state);
    }
    if (state.sent) return;
    if (state.inFlight) return state.inFlight;
    data.submission_id = state.id;
    data.submitted_at = state.submittedAt;
    state.inFlight = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(),20000);
      try {
        const response = await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});
        const result = await response.json();
        if (response.ok && result.ok === true && result.submission_id === state.id) { state.sent = true; return; }
        throw new Error(result?.code === 'invalid' ? 'Please check your required fields and try again.' : retry);
      } catch (error) { throw new Error(error.message.startsWith('Please check') ? error.message : retry); }
      finally { clearTimeout(timer); state.inFlight = null; }
    })();
    return state.inFlight;
  }
  window.podsEnquiry = {send,bind,setSource,calendar};
})();
