(() => {
  'use strict';
  const menu = document.querySelector('[data-menu]');
  const nav = document.querySelector('[data-nav-links]');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? 'Close' : 'Menu';
    });
    nav.addEventListener('click', e => {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
        menu.textContent = 'Menu';
      }
    });
  }

  const roleContent = {
    operations: {number:'01',title:'Back-office & operations',tag:'Make recurring work dependable',description:'An example starting point for companies with admin-heavy weeks, busy inboxes, and processes that need consistent follow-through.',tasks:['CRM and data upkeep','Order or ticket administration','Scheduling and recurring reporting']},
    sales: {number:'02',title:'Sales support',tag:'Keep the pipeline moving',description:'Support the work around selling, so your existing salespeople can spend more time with customers.',tasks:['Lead research and qualification','CRM hygiene and follow-ups','Appointment coordination']},
    customer: {number:'03',title:'Customer experience',tag:'Stay close to customers',description:'Design a repeatable support role with clear tools, escalation paths, and a visible service rhythm.',tasks:['Email and chat queues','Ticket triage and knowledge-base upkeep','Service reporting and escalation']},
    marketing: {number:'04',title:'Marketing operations',tag:'A reliable production cadence',description:'Give a lean team help with the recurring production and coordination work that makes campaigns consistent.',tasks:['Campaign and content operations','Asset coordination','Reporting and QA']},
    creative: {number:'05',title:'Design & creative',tag:'Creative capacity with context',description:'Bring brand-aligned design support into a documented review cycle that keeps your team in control.',tasks:['Social and presentation assets','Design-production support','Creative QA and handoff']},
    engineering: {number:'06',title:'Engineering & AI',tag:'Product work, with structure',description:'A potential path for software, testing, data, and AI-enabled workflows where scope and review ownership are defined.',tasks:['QA and technical support','Frontend or backend work','Automations and workflow tooling']}
  };
  const tabs = [...document.querySelectorAll('[data-role-tab]')];
  const title = document.querySelector('[data-role-title]');
  if (tabs.length && title) {
    function showRole(key) {
      const r = roleContent[key]; if (!r) return;
      tabs.forEach(t => {
        const active = t.dataset.roleTab === key;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
        t.tabIndex = active ? 0 : -1;
      });
      document.querySelector('#role-panel').setAttribute('aria-labelledby','role-'+key);
      title.textContent = r.title;
      document.querySelector('[data-role-number]').textContent = r.number;
      document.querySelector('[data-role-tag]').textContent = r.tag;
      document.querySelector('[data-role-description]').textContent = r.description;
      const list = document.querySelector('[data-role-tasks]');
      list.replaceChildren(...r.tasks.map(task => {
        const li = document.createElement('li');
        li.textContent = task;
        return li;
      }));
    }
    tabs.forEach((tab,i) => {
      tab.addEventListener('click', () => showRole(tab.dataset.roleTab));
      tab.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const next = (i + (['ArrowDown','ArrowRight'].includes(e.key) ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next].focus(); showRole(tabs[next].dataset.roleTab);
      });
    });
  }

  document.querySelectorAll('[data-enquiry-form]').forEach(form => {
    const status = form.querySelector('[data-form-status]');
    const button = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      button.disabled = true;
      button.textContent = 'Sending…';
      status.className = 'form-status';
      status.textContent = '';
      try {
        if (!window.podsEnquiry) throw new Error('Enquiries are temporarily unavailable.');
        await window.podsEnquiry.send(form,{source:'editorial-redesign'});
        form.reset();
        status.textContent = 'Thanks. We have your note and will get back to you.';
        status.classList.add('ok');
      } catch(err) {
        status.textContent = err.message || 'Something went wrong. Please try again.';
        status.classList.add('error');
      } finally {
        button.disabled = false;
        button.textContent = 'Send enquiry ↗';
      }
    });
  });
})();
