(() => {
  'use strict';
  const pending = new WeakMap();

  window.podsEnquiry = {
    async send(form, context) {
      const data = {...Object.fromEntries(new FormData(form)), ...context};
      data.landing_page = location.origin + location.pathname;
      for (const [key, value] of new URLSearchParams(location.search)) {
        if (/^utm_[a-z0-9_]{1,50}$/i.test(key)) data[key.toLowerCase()] = value.slice(0, 500);
      }
      const snapshot = JSON.stringify(data);
      if (pending.get(form)?.snapshot !== snapshot) {
        pending.set(form, {snapshot, id: crypto.randomUUID()});
      }
      data.submission_id = pending.get(form).id;

      const retry = 'We couldn’t send your enquiry. Your details are still here. Please try again.';
      let result;
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data)
        });
        result = await response.json();
        if (response.ok && result.ok === true) {
          pending.delete(form);
          return;
        }
      } catch {
        throw new Error(retry);
      }
      throw new Error(result?.code === 'invalid'
        ? 'Please check your required fields and try again.'
        : retry);
    }
  };
})();
