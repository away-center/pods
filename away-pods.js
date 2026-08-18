
(() => {
'use strict';

/* ============================================================
   CONFIGURATION — set these when wiring the page up
   ============================================================ */
const FORM_ENDPOINT = '';                        // ← POST target. Empty = hand off to Tally.
const TALLY_URL     = 'https://tally.so/r/7RN8LL';
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ============================================================
   NAV — stuck state, scroll progress, Bangalore clock
   ============================================================ */
const nav = $('#nav'), bar = $('#progress');
const onScroll = () => {
  nav.classList.toggle('stuck', scrollY > 8);
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

const clock = () => {
  const t = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  $('#blrTime').textContent = t;
};
clock(); setInterval(clock, 20000);

/* Sticky mobile bar: appears after the hero, steps aside at the two
   places where the same action is already on screen. */
(() => {
  const bar = $('#mcta');
  let past = false, inTarget = false;
  const paint = () => {
    const on = past && !inTarget;
    if (on) bar.hidden = false;
    requestAnimationFrame(() => bar.classList.toggle('on', on));
  };
  new IntersectionObserver(es => { past = !es[0].isIntersecting; paint(); },
    { rootMargin: '-70% 0px 0px 0px' }).observe($('.hero'));
  const near = new IntersectionObserver(es => {
    inTarget = es.some(e => e.isIntersecting); paint();
  }, { threshold: 0 });
  [$('#build'), $('#enquire')].forEach(el => near.observe(el));
})();

/* ============================================================
   REVEAL
   ============================================================ */
const io = new IntersectionObserver((es) => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
$$('.rv').forEach(el => io.observe(el));

/* ============================================================
   01 — HERO: the team assembling
   ============================================================ */
(() => {
  const nodes = $$('#nodes .node'), links = $$('.link-l'), badges = $$('.hero-badge');
  const play = () => {
    nodes.forEach((n, i) => setTimeout(() => {
      n.classList.remove('off');
      if (links[i]) links[i].classList.add('on');
    }, RM ? 0 : 380 + i * 190));
    badges.forEach((b, i) => setTimeout(() => b.classList.remove('off'), RM ? 0 : 1700 + i * 260));
  };
  // the six labels cycle, so the breadth of roles reads without scrolling
  const SETS = [
    ['SDR', 'Researcher', 'Content'],
    ['CRM Ops', 'RevOps', 'Finance Ops'],
    ['Support', 'Success', 'Onboarding'],
    ['Designer', 'Video', 'Copywriter'],
    ['Engineer', 'QA', 'DevOps'],
    ['AI Ops', 'Automation', 'SEO / GEO']
  ];
  const labels = $$('.node-lbl');
  let tick = 0;
  const cycle = () => {
    const i = tick % labels.length, set = SETS[i];
    const next = set[Math.floor(tick / labels.length) % set.length];
    const el = labels[i];
    el.style.opacity = '0';
    setTimeout(() => { el.textContent = next; el.style.opacity = '1'; }, 340);
    tick++;
  };

  const o = new IntersectionObserver((es) => {
    if (es[0].isIntersecting) {
      play();
      if (!RM) setTimeout(() => setInterval(cycle, 1400), 2600);
      o.disconnect();
    }
  }, { threshold: .3 });
  o.observe($('#stage'));
})();

/* ============================================================
   02 — LADDER tabs
   ============================================================ */
(() => {
  const tabs = $$('.rung'), panels = $$('.rp');
  const sel = (i) => {
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; });
    panels.forEach((p, j) => p.hidden = j !== i);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => sel(i));
    t.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const n = (i + d + tabs.length) % tabs.length;
      sel(n); tabs[n].focus();
    });
  });
})();

/* ============================================================
   03 — POD EXPLORER
   ============================================================ */
const PODS = {
  revenue: {
    kicker: 'Revenue Pod',
    title: 'Build a revenue execution team around the pipeline work you already know you need.',
    blurb: 'The unglamorous half of revenue — research, enrichment, CRM discipline, follow-up — is exactly the work that repeats weekly and rarely gets a dedicated owner.',
    roles: ['SDR / Outbound Associate', 'Lead Researcher', 'CRM Operations', 'Revenue Operations', 'Sales Support'],
    flows: ['Outbound account research', 'Lead enrichment', 'CRM hygiene', 'Reply triage', 'Pipeline reporting'],
    for: 'B2B SaaS, agencies, services businesses and consultants with a defined ICP.',
    start: '1 SDR + 1 CRM Ops Associate, then add research capacity.',
    support: 'Role design, sourcing, workspace, WorkOS, weekly pipeline-hygiene reporting.',
    model: 'Managed Role first; converts to Managed Workflow once targets and SOPs are fixed.'
  },
  marketing: {
    kicker: 'Marketing Pod',
    title: 'Build a marketing execution team around the campaigns and channels you already run.',
    blurb: 'Strategy stays with you. What moves to India is the execution rhythm — production, distribution, tracking, reporting — that determines whether the strategy actually ships.',
    roles: ['Growth Marketer', 'Content Marketer', 'Designer', 'Marketing Operations', 'SEO / GEO Associate'],
    flows: ['Content repurposing', 'Campaign execution support', 'AI SEO / GEO visibility monitoring', 'Analytics reporting', 'Landing page updates'],
    for: 'Startups, D2C brands, SaaS companies and agencies with an existing channel mix.',
    start: '1 Growth Marketer + 1 Content Marketer, designer added as volume justifies it.',
    support: 'Role design, sourcing, workspace, WorkOS, SOPs for the recurring parts, weekly reporting.',
    model: 'Managed Role. Away does not take responsibility for growth outcomes on a role engagement.'
  },
  creative: {
    kicker: 'Creative Pod',
    title: 'Build a creative team that holds your brand context instead of relearning it every brief.',
    blurb: 'The original Away Pod, and still one of the strongest fits — creative work rewards continuity, and continuity is what a managed team gives you that a marketplace cannot.',
    roles: ['Graphic Designer', 'Motion Designer', 'Video Editor', 'Copywriter', 'Creative Coordinator', 'Creative Director'],
    flows: ['Asset production', 'Social content production', 'Video editing pipeline', 'Design QA', 'Asset library management'],
    for: 'Agencies, in-house brand teams, media and creator-led businesses with steady output.',
    start: '1 Designer + 1 Video Editor, coordinated by your side or an Away coordinator.',
    support: 'Sourcing against portfolio and craft, workspace, WorkOS, brief-to-delivery visibility.',
    model: 'Managed Role or Managed Pod, depending on whether coordination sits with you or Away.'
  },
  cx: {
    kicker: 'Customer Experience Pod',
    title: 'Build a support operation that answers consistently, not heroically.',
    blurb: 'Support is one of the better candidates for output responsibility — once the rules and escalation paths are written down, quality becomes measurable.',
    roles: ['Customer Support Associate', 'Customer Success Operations', 'Knowledge Base Associate', 'Support QA', 'Onboarding Associate'],
    flows: ['Ticket triage', 'First response', 'Knowledge base upkeep', 'Customer onboarding', 'Support reporting'],
    for: 'SaaS, e-commerce, marketplaces and communities with recurring inbound volume.',
    start: '1 Support Associate, adding QA and knowledge-base capacity as volume grows.',
    support: 'SOPs, QA checklist, SLA definition, WorkOS task evidence, weekly support reporting.',
    model: 'Strong candidate for Managed Workflow once support rules and escalation are defined.'
  },
  ops: {
    kicker: 'Operations Pod',
    title: 'Build the operating spine that stops work falling between people.',
    blurb: 'Most small companies do not have an operations problem they can name. They have twenty small coordination failures a week that nobody owns.',
    roles: ['Operations Associate', 'Project Coordinator', 'Research Associate', 'CRM Operations', 'Executive Assistant'],
    flows: ['Weekly business reporting', 'Vendor and calendar coordination', 'Research memos', 'Process documentation', 'Task tracking'],
    for: 'Founder-led businesses, agencies and small global teams outgrowing informal process.',
    start: '1 Operations Associate, then a coordinator once there are several workstreams.',
    support: 'Role design, SOP build, WorkOS setup, reporting cadence, delivery oversight.',
    model: 'Managed Role, converting individual routines into Managed Workflows over time.'
  },
  eng: {
    kicker: 'Engineering Pod',
    title: 'Build engineering capacity that stays with your codebase.',
    blurb: 'You own the architecture, the roadmap and the technical direction. Away owns finding the people, housing them, and making sure the operating rhythm around them holds.',
    roles: ['Frontend Engineer', 'Backend Engineer', 'Full-stack Engineer', 'QA Engineer', 'DevOps / Infrastructure Support'],
    flows: ['Regression and release QA', 'Bug triage', 'Documentation upkeep', 'Environment and deployment support'],
    for: 'SaaS companies, product teams and technical agencies extending delivery capacity.',
    start: '1 Full-stack or Frontend Engineer, QA added once release cadence justifies it.',
    support: 'Technical sourcing and assessment, workspace, WorkOS, delivery visibility.',
    model: 'Managed Role or Managed Pod. We will not sell engineering outcomes as a workflow.'
  },
  ai: {
    kicker: 'AI & Automation Pod',
    title: 'Build the human layer that keeps your automations working after they are built.',
    blurb: 'Automations decay. Somebody has to map the process, build it, watch it, fix it when the tool changes, and check what the model produced before a customer sees it.',
    roles: ['AI Automation Associate', 'Workflow Automation Engineer', 'n8n / Make / Zapier Specialist', 'AI QA & Operations', 'Automation Maintenance Associate'],
    flows: ['SOP mapping', 'Automation build and maintenance', 'Prompt library upkeep', 'AI output QA', 'Tool integration'],
    for: 'AI-native companies, agencies and founders with internal process sprawl.',
    start: '1 AI Automation Associate, adding a QA operator as automations multiply.',
    support: 'Role design, sourcing for tool fluency, WorkOS, SOP library, review checkpoints.',
    model: 'Managed Role initially; specific automation packages can become Managed Workflows.'
  },
  founder: {
    kicker: "Founder's Office Pod",
    title: 'Get back the hours currently spent on follow-ups, coordination and research.',
    blurb: 'The highest-leverage first hire for most solo founders and consultants is not a specialist. It is somebody who makes sure nothing important gets dropped.',
    roles: ["Founder's Office Associate", 'Executive Assistant', 'Research Associate', 'CRM Operations', 'Project Coordinator'],
    flows: ['Founder follow-up workflow', 'Inbox and calendar triage', 'Meeting notes and action items', 'Research memos', 'Weekly founder dashboard'],
    for: 'Solo founders, consultants, creator-led businesses and small teams.',
    start: "1 Founder's Office Associate. Most clients never need more than two.",
    support: 'Role design, sourcing for judgement and communication, WorkOS, weekly dashboard.',
    model: 'Managed Role, with the follow-up routine often converting to a Managed Workflow.'
  },
  ecom: {
    kicker: 'E-commerce Operations Pod',
    title: 'Build the daily operations layer behind the storefront.',
    blurb: 'Catalogue, listings, orders, returns, marketplace admin and support — high-volume, rule-driven work that repeats every single day and quietly consumes founder time.',
    roles: ['E-commerce Operations Associate', 'Catalogue / Listings Associate', 'Customer Support Associate', 'Marketplace Operations', 'Performance Creative'],
    flows: ['Catalogue and listing upkeep', 'Order and returns operations', 'Marketplace administration', 'Support triage', 'Weekly operations reporting'],
    for: 'D2C brands, marketplace sellers and multi-channel retail operations.',
    start: '1 Operations Associate + 1 Support Associate.',
    support: 'SOPs for rule-driven work, QA, WorkOS task evidence, weekly operations reporting.',
    model: 'Strong candidate for Managed Workflow once the operating rules are documented.'
  }
};

(() => {
  const links = $('#podLinks'), orbs = $('#podOrbs'), NS = 'http://www.w3.org/2000/svg';
  const set = (key) => {
    const d = PODS[key];
    $('#podKicker').textContent = d.kicker;
    $('#podTitle').textContent  = d.title;
    $('#podBlurb').textContent  = d.blurb;
    $('#podRoles').innerHTML = d.roles.map(r => `<span class="role-tag">${r}</span>`).join('');
    $('#podFlows').innerHTML = d.flows.map(r => `<span class="role-tag wf">${r}</span>`).join('');
    $('#podFor').textContent = d.for;
    $('#podStart').textContent = d.start;
    $('#podSupport').textContent = d.support;
    $('#podModel').textContent = d.model;

    links.innerHTML = ''; orbs.innerHTML = '';
    const n = d.roles.length, R = 118, cx = 240, cy = 168;
    // wrap a role name onto at most two short lines so labels never collide
    const wrap = (s) => {
      const t = s.replace(/ Associate$/, '').replace(/ Operations/, ' Ops').replace(' / ', ' / ');
      const w = t.split(' '); const out = ['']; const LIM = 15;
      w.forEach(word => {
        const i = out.length - 1;
        if ((out[i] + ' ' + word).trim().length <= LIM) out[i] = (out[i] + ' ' + word).trim();
        else if (out.length < 2) out.push(word);
        else out[i] += '…';
      });
      return out.filter(Boolean);
    };
    d.roles.forEach((role, i) => {
      const a = (-90 + (360 / n) * i) * Math.PI / 180;
      const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', cx); ln.setAttribute('y1', cy);
      ln.setAttribute('x2', x);  ln.setAttribute('y2', y);
      ln.setAttribute('class', 'link-l'); links.appendChild(ln);

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'orb off');
      const lines = wrap(role);
      const above = y < cy - 20;                       // labels above the ring flip upward
      const y0 = above ? y - 34 - (lines.length - 1) * 11 : y + 38;
      g.innerHTML =
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="23" fill="#FDF7F3" stroke="#1A1A1A" stroke-width="1.8"/>` +
        `<g transform="translate(${x.toFixed(1)},${(y - 1).toFixed(1)}) scale(.8)" color="#1A1A1A">` +
        `<circle cx="0" cy="-9" r="6.5" fill="none" stroke="currentColor" stroke-width="2.8"/>` +
        `<path d="M-9 12c0-6.2 4-10.5 9-10.5S9 5.8 9 12" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></g>` +
        `<text x="${x.toFixed(1)}" y="${y0.toFixed(1)}" text-anchor="middle" font-family="Hanken Grotesk,sans-serif" font-size="10" font-weight="600" fill="#075056">` +
        lines.map((l, li) => `<tspan x="${x.toFixed(1)}" dy="${li ? 11.5 : 0}">${l}</tspan>`).join('') + `</text>`;
      orbs.appendChild(g);
      setTimeout(() => {
        g.classList.remove('off');
        links.children[i].classList.add('on');
      }, RM ? 0 : 70 + i * 85);
    });
  };

  const tabs = $$('.tab');
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => {
      tabs.forEach((x, j) => { x.setAttribute('aria-selected', j === i); x.tabIndex = j === i ? 0 : -1; });
      set(t.dataset.pod);
      CFG.fn = t.dataset.pod;
    });
    t.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
      e.preventDefault();
      const n = (i + d + tabs.length) % tabs.length; tabs[n].click(); tabs[n].focus();
    });
  });
  set('revenue');

  $('#podCta').addEventListener('click', () => {
    const active = $('.tab[aria-selected=true]');
    if (active) selectFn(active.dataset.pod);
  });
})();

/* ============================================================
   04 — BUILD YOUR POD
   ============================================================ */
const FUNCTIONS = [
  { k: 'revenue',   n: 'Revenue',            d: 'Pipeline, outbound, CRM' },
  { k: 'marketing', n: 'Marketing',          d: 'Campaigns, content, channels' },
  { k: 'creative',  n: 'Creative',           d: 'Design, video, brand output' },
  { k: 'cx',        n: 'Customer Support',   d: 'Tickets, onboarding, success' },
  { k: 'ops',       n: 'Operations',         d: 'Coordination, process, admin' },
  { k: 'eng',       n: 'Engineering',        d: 'Frontend, backend, QA' },
  { k: 'ai',        n: 'AI & Automation',    d: 'Automations, prompts, AI QA' },
  { k: 'founder',   n: "Founder's Office",   d: 'Follow-ups, research, EA' },
  { k: 'ecom',      n: 'E-commerce Ops',     d: 'Catalogue, orders, marketplace' },
  { k: 'custom',    n: 'Something custom',   d: "Tell us and we'll architect it" }
];

const ROLES = {
  revenue: [
    ['SDR / Outbound Associate', 'Research, sequences, follow-ups, reply triage'],
    ['Lead Researcher', 'ICP research, list building, enrichment'],
    ['CRM Operations Associate', 'Hygiene, stages, lost reasons, reporting'],
    ['Revenue Operations Associate', 'Reporting, forecasting support, tooling'],
    ['Sales Support Associate', 'Proposals, collateral, scheduling, admin']
  ],
  marketing: [
    ['Growth Marketer', 'Campaign execution, distribution, analytics'],
    ['Content Marketer', 'Calendar, drafting, publishing, newsletter'],
    ['Marketing Designer', 'Social, ads, landing pages, collateral'],
    ['Marketing Operations Associate', 'Automation, tracking, lists, attribution'],
    ['SEO / GEO Associate', 'Search and AI-answer visibility, structured pages']
  ],
  creative: [
    ['Graphic Designer', 'Brand identity, social assets, collateral'],
    ['Motion Designer', 'After Effects, explainers, animated assets'],
    ['Video Editor', 'Long-form, shorts, reels, subtitling'],
    ['Copywriter', 'Web, ads, email, long-form'],
    ['Creative Coordinator', 'Traffic, briefs, asset management'],
    ['Creative Director', 'Art direction, brand consistency, mentorship']
  ],
  cx: [
    ['Customer Support Associate', 'Triage, first response, escalations'],
    ['Customer Success Operations', 'Health tracking, renewals admin, reporting'],
    ['Knowledge Base Associate', 'Docs, macros, help centre upkeep'],
    ['Support QA', 'Response review, tone and accuracy checks'],
    ['Onboarding Associate', 'New-customer setup and activation']
  ],
  ops: [
    ['Operations Associate', 'Process, coordination, day-to-day execution'],
    ["Founder's Office Associate", 'Follow-ups, notes, dashboards, chasing'],
    ['Executive Assistant', 'Calendar, inbox, travel, vendor coordination'],
    ['Project Coordinator', 'Timelines, dependencies, status reporting'],
    ['Research Associate', 'Memos, market and account research'],
    ['CRM Operations Associate', 'Data hygiene, reporting, tooling']
  ],
  eng: [
    ['Frontend Engineer', 'React, Next, component work, UI delivery'],
    ['Backend Engineer', 'APIs, services, data, integrations'],
    ['Full-stack Engineer', 'End-to-end feature delivery'],
    ['QA Engineer', 'Test plans, regression, release QA'],
    ['DevOps / Infra Support', 'Environments, pipelines, monitoring']
  ],
  ai: [
    ['AI Automation Associate', 'SOP mapping, automation build and upkeep'],
    ['Workflow Automation Engineer', 'Complex multi-system automations'],
    ['n8n / Make / Zapier Specialist', 'Tool-specific build and maintenance'],
    ['AI QA & Operations', 'Reviewing AI output before it ships'],
    ['Automation Maintenance Associate', 'Monitoring, fixes, version upkeep']
  ],
  founder: [
    ["Founder's Office Associate", 'The catch-all that stops things dropping'],
    ['Executive Assistant', 'Calendar, inbox, coordination'],
    ['Research Associate', 'Briefs, memos, prep for meetings'],
    ['CRM Operations Associate', 'Follow-up tracking and pipeline hygiene'],
    ['Project Coordinator', 'Keeping workstreams moving']
  ],
  ecom: [
    ['E-commerce Operations Associate', 'Orders, returns, day-to-day store ops'],
    ['Catalogue / Listings Associate', 'Product data, listings, merchandising'],
    ['Customer Support Associate', 'Pre and post-purchase support'],
    ['Marketplace Operations Associate', 'Amazon, Shopify, marketplace admin'],
    ['Performance Creative', 'Static and video ad production, testing']
  ],
  custom: [
    ['Tell us the role', "We'll design the role card with you"],
    ['Operations Associate', 'A safe first hire while the shape settles'],
    ['Research Associate', 'Useful in almost every configuration'],
    ["Founder's Office Associate", 'The most common first Away Pod hire']
  ]
};

const LAYERS = {
  role:     ['Role design', 'Sourcing & vetting', 'Vetting', 'Away workspace', 'Device setup', 'WorkOS', 'Task visibility', 'Weekly reporting', 'Replacement support'],
  workflow: ['Workflow design', 'SOP library', 'Sourcing & vetting', 'Away workspace', 'WorkOS', 'AI-assisted execution', 'QA checklist', 'SLA', 'Weekly reporting'],
  pod:      ['Team architecture', 'Sourcing & vetting', 'Away workspace', 'Device setup', 'WorkOS dashboard', 'SOP library', 'Delivery lead', 'Weekly reporting', 'Monthly review', 'Replacement bench'],
  gcc:      ['India team architecture', 'Sourcing & vetting', 'Away workspace', 'Management layer', 'WorkOS', 'SOP library', 'Delivery governance', 'Reporting', 'Expansion planning', 'Replacement bench']
};

const MODEL_LABEL = { role: 'Managed Role', workflow: 'Managed Workflow', pod: 'Managed Pod', gcc: 'Nano GCC' };
const MODEL_NOTE = {
  role:     'On a <b>Managed Role</b>, Away owns hiring, workspace, WorkOS, visibility, reporting and replacement. You own functional strategy, priorities and the business outcome.',
  workflow: 'On a <b>Managed Workflow</b>, Away can own the defined outputs — because inputs, SOPs, QA and an SLA are agreed in writing first. You own strategy, approvals and business decisions.',
  pod:      'On a <b>Managed Pod</b>, Away additionally owns coordination between the roles and delivery quality within the agreed scope. You own strategy and commercial targets.',
  gcc:      'On a <b>Nano GCC</b>, Away helps establish and operate the India cell per the contracted model. Employment structure is decided with your own advisers.'
};

let CFG = { fn: null, shape: null, roles: {}, params: {}, showAll: false };

/* -- Step 1 -------------------------------------------------- */
const ICONS = {
  revenue:'<path d="M3 25l7-8 6 5 11-13" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 9h7v7" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  marketing:'<path d="M4 12v7l16 7V5L4 12z" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linejoin="round"/><path d="M24 11a5 5 0 0 1 0 9" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
  creative:'<circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2.4" fill="none"/><circle cx="11.5" cy="12.5" r="2" fill="currentColor"/><circle cx="20.5" cy="12.5" r="2" fill="currentColor"/><path d="M11 21c3 2.4 7 2.4 10 0" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
  cx:'<path d="M27 20c0 2-2 3-4 3H14l-6 4v-4H7c-2 0-3-1-3-3V9c0-2 1-3 3-3h17c2 0 3 1 3 3v11z" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linejoin="round"/>',
  ops:'<circle cx="16" cy="16" r="5" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M16 3v5M16 24v5M3 16h5M24 16h5M7 7l3.5 3.5M21.5 21.5L25 25M25 7l-3.5 3.5M10.5 21.5L7 25" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  eng:'<path d="M11 10L4 16l7 6M21 10l7 6-7 6M18 6l-4 20" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  ai:'<rect x="6" y="6" width="20" height="20" rx="5" stroke="currentColor" stroke-width="2.4" fill="none"/><circle cx="12.5" cy="14" r="1.9" fill="currentColor"/><circle cx="19.5" cy="14" r="1.9" fill="currentColor"/><path d="M12 20.5h8M16 2v4M16 26v4M2 16h4M26 16h4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  founder:'<circle cx="16" cy="11" r="5" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M6 28c0-5.2 4.5-8.5 10-8.5S26 22.8 26 28" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
  ecom:'<path d="M4 6h4l3 14h13l3-9H10" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13" cy="26" r="2.2" fill="currentColor"/><circle cx="23" cy="26" r="2.2" fill="currentColor"/>',
  custom:'<path d="M16 5v22M5 16h22" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2.4" fill="none" stroke-dasharray="4 4"/>'
};

$('#fnGrid').innerHTML = FUNCTIONS.map(f => `
  <button class="fn" aria-pressed="false" data-fn="${f.k}">
    <span class="fn-check"><svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true"><path d="M1 4l2.6 2.6L9 1.2" stroke="#FDF7F3" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <svg class="fn-ic" viewBox="0 0 32 32" fill="none" aria-hidden="true">${ICONS[f.k]}</svg>
    <span class="fn-n">${f.n}</span>
    <span class="fn-d">${f.d}</span>
  </button>`).join('');

function selectFn(k) {
  CFG.fn = k;
  $$('.fn').forEach(b => b.setAttribute('aria-pressed', b.dataset.fn === k));
  buildRoleList();
  gate();
}
$$('.fn').forEach(b => b.addEventListener('click', () => selectFn(b.dataset.fn)));

/* -- Step 2 -------------------------------------------------- */
$$('.shape').forEach(b => b.addEventListener('click', () => {
  CFG.shape = b.dataset.shape;
  $$('.shape').forEach(x => x.setAttribute('aria-pressed', x === b));
  gate();
}));

/* -- Step 3 -------------------------------------------------- */
function roleSet() {
  if (CFG.showAll) {
    const seen = new Set(), out = [];
    Object.values(ROLES).flat().forEach(r => { if (!seen.has(r[0])) { seen.add(r[0]); out.push(r); } });
    return out;
  }
  return ROLES[CFG.fn] || ROLES.custom;
}

function buildRoleList() {
  const list = $('#roleList');
  list.innerHTML = roleSet().map(([n, d]) => {
    const q = CFG.roles[n] || 0;
    return `<div class="role-row${q ? ' has' : ''}" data-role="${n}">
      <span class="role-info"><span class="role-nm">${n}</span><span class="role-dc">${d}</span></span>
      <span class="stepper">
        <button type="button" data-a="-" aria-label="Remove one ${n}"${q ? '' : ' disabled'}><svg width="12" height="2" viewBox="0 0 12 2" aria-hidden="true"><path d="M1 1h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
        <span class="qty" aria-live="polite" aria-label="${n} count">${q}</span>
        <button type="button" data-a="+" aria-label="Add one ${n}"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
      </span>
    </div>`;
  }).join('');
}

$('#roleList').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-a]'); if (!btn) return;
  const row = btn.closest('.role-row'), name = row.dataset.role;
  const cur = CFG.roles[name] || 0;
  const next = btn.dataset.a === '+' ? Math.min(cur + 1, 9) : Math.max(cur - 1, 0);
  if (next === 0) delete CFG.roles[name]; else CFG.roles[name] = next;
  row.querySelector('.qty').textContent = next;
  row.querySelector('[data-a="-"]').disabled = next === 0;
  row.classList.toggle('has', next > 0);
  drawAssembly(); gate();
});

$('#showAll').addEventListener('click', () => {
  CFG.showAll = !CFG.showAll;
  $('#showAll').textContent = CFG.showAll ? 'Show only this function' : 'Show roles from every function';
  buildRoleList();
});

const headcount = () => Object.values(CFG.roles).reduce((a, b) => a + b, 0);

function model() {
  const n = headcount();
  if (CFG.shape === 'workflow') return 'workflow';
  if (n >= 5) return 'gcc';
  if (n >= 2) return CFG.shape === 'gcc' ? 'gcc' : 'pod';
  if (n === 1) return CFG.shape === 'gcc' ? 'gcc' : (CFG.shape === 'pod' ? 'pod' : 'role');
  return CFG.shape || 'role';
}

function drawAssembly() {
  const stage = $('#asmStage'), n = headcount();
  $('#asmNum').textContent = n;
  $('#asmLbl').textContent = n === 1 ? 'person' : 'people';
  const badge = $('#asmModel');
  if (n > 0 || CFG.shape) { badge.hidden = false; badge.textContent = MODEL_LABEL[model()]; }
  else badge.hidden = true;

  if (!n) { stage.innerHTML = '<p class="asm-empty">Add a role and your pod starts to take shape.</p>'; return; }

  const cx = 130, cy = 92;
  let parts = '', links = '';
  const inner = Math.min(n, 8), outer = Math.max(0, n - 8);
  const place = (count, R, offset, cls) => {
    for (let i = 0; i < count; i++) {
      const a = (-90 + (360 / Math.max(count, 3)) * i) * Math.PI / 180;
      const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      links += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#E4BF71" stroke-width="1.2" opacity=".45"/>`;
      parts += `<g class="asm-p" style="animation-delay:${RM ? 0 : (offset + i) * 55}ms">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="14" fill="none" stroke="${cls}" stroke-width="1.6"/>
        <g transform="translate(${x.toFixed(1)},${(y - .5).toFixed(1)}) scale(.62)" color="${cls}">
          <circle cx="0" cy="-9" r="6.5" fill="none" stroke="currentColor" stroke-width="3.2"/>
          <path d="M-9 12c0-6.2 4-10.5 9-10.5S9 5.8 9 12" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
        </g></g>`;
    }
  };
  place(inner, 58, 0, '#FDF7F3');
  if (outer) place(outer, 84, inner, '#E4BF71');

  stage.innerHTML = `<svg viewBox="0 0 260 184" role="img" aria-label="${n} people arranged around the Away operating layer">
    ${links}
    <circle cx="${cx}" cy="${cy}" r="22" fill="#FF502A"/>
    <text x="${cx}" y="${cy + 3.5}" text-anchor="middle" font-family="Hanken Grotesk,sans-serif" font-size="9" font-weight="700" letter-spacing=".8" fill="#FDF7F3">AWAY</text>
    ${parts}
    <line x1="16" y1="174" x2="244" y2="174" stroke="#FDF7F3" stroke-width="1.3" opacity=".3" stroke-linecap="round"/>
  </svg>`;
}

/* -- Step 4 pills -------------------------------------------- */
const pillGroup = (id, key, multi = false) => {
  const g = $(id); if (!g) return;
  g.addEventListener('click', (e) => {
    const b = e.target.closest('.pill'); if (!b) return;
    if (multi) b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
    else $$('.pill', g).forEach(x => x.setAttribute('aria-pressed', x === b));
    CFG.params[key] = $$('.pill[aria-pressed=true]', g).map(x => x.dataset.v).join(', ');
  });
};
pillGroup('#mgmtPills', 'management');
pillGroup('#jdPills', 'jd');
pillGroup('#wantPills', 'intent');

/* -- Step 5 -------------------------------------------------- */
const POD_NAME = {
  revenue: 'Revenue Support', marketing: 'Marketing Execution', creative: 'Creative',
  cx: 'Customer Experience', ops: 'Operations', eng: 'Engineering',
  ai: 'AI & Automation', founder: "Founder's Office", ecom: 'E-commerce Operations', custom: 'Custom'
};

function renderRec() {
  const m = model(), n = headcount();
  const city = CFG.params.city || $('#q-city').value || 'Bangalore';
  const base = POD_NAME[CFG.fn] || 'Custom';
  const suffix = { role: 'Role', workflow: 'Workflow', pod: 'Pod', gcc: 'India Cell' }[m];

  $('#recBadge').textContent = MODEL_LABEL[m];
  $('#recName').textContent  = `${base} ${suffix}`;
  $('#recSub').textContent   = `${n || '—'} ${n === 1 ? 'person' : 'people'} · ${city.replace(/ —.*/, '')}`;

  const roster = Object.entries(CFG.roles);
  $('#recRoster').innerHTML = roster.length
    ? roster.map(([r, q]) => `<li><span class="rec-qty">${q}</span><span>${r}</span></li>`).join('')
    : `<li><span class="rec-qty">?</span><span>No roles selected yet — we'll propose a starting structure on the call.</span></li>`;

  $('#recLayer').innerHTML = LAYERS[m].map(l => `<span class="layer-tag">${l}</span>`).join('');
  $('#recNote').innerHTML = MODEL_NOTE[m] +
    ' This suggestion is directional and is not a quote, a commercial proposal or a commitment to a price, timeline or outcome.';

  // capture the parameter fields
  ['country','stage','teamsize','experience','city','overlap','start','hr','tools','budget'].forEach(k => {
    const el = document.querySelector(`[name="${k}"]`); if (el && el.value) CFG.params[k] = el.value;
  });
  syncForm();
}

/* -- Wizard navigation --------------------------------------- */
let step = 1;
const HINTS = {
  1: 'Choose a function to begin',
  2: 'Choose the kind of support you need',
  3: 'Add roles, or continue and we will suggest a structure',
  4: 'All optional — skip anything you would rather discuss',
  5: 'Directional only. Nothing here is a quote.'
};

function gate() {
  const next = $('#cfgNext');
  const ok = step === 1 ? !!CFG.fn : step === 2 ? !!CFG.shape : true;
  next.disabled = !ok;
  $('#cfgHint').textContent = HINTS[step];
  next.innerHTML = (step === 4 ? 'See my setup' : step === 5 ? 'Continue to enquiry' : 'Continue') +
    ' <svg class="ar" width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true"><path d="M1 6h12M9 2l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  $('#cfgBack').hidden = step === 1;
  $$('.step-dot').forEach(d => {
    const s = +d.dataset.s;
    d.classList.toggle('now', s === step);
    d.classList.toggle('done', s < step);
  });
}

function goto(s) {
  step = Math.min(5, Math.max(1, s));
  $$('.pane').forEach(p => p.classList.toggle('on', +p.dataset.pane === step));
  if (step === 3) { buildRoleList(); drawAssembly(); }
  if (step === 5) renderRec();
  gate();
  const y = $('#build').getBoundingClientRect().top + scrollY - 70;
  if (scrollY > y + 120 || scrollY < y - 400) scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
}

$('#cfgNext').addEventListener('click', () => {
  if (step === 5) { $('#enquire').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); $('#f-name').focus({ preventScroll: true }); return; }
  goto(step + 1);
});
$('#cfgBack').addEventListener('click', () => goto(step - 1));
$('#restartCfg').addEventListener('click', () => {
  CFG = { fn: null, shape: null, roles: {}, params: {}, showAll: false };
  $$('.fn').forEach(b => b.setAttribute('aria-pressed', 'false'));
  $$('.shape').forEach(b => b.setAttribute('aria-pressed', 'false'));
  $$('.pill').forEach(b => b.setAttribute('aria-pressed', 'false'));
  $$('#podForm select, .pgrid select, .pgrid input').forEach(el => el.value = '');
  $('#q-city').value = 'Bangalore';
  syncForm(); goto(1);
});
$('#recCta').addEventListener('click', () => setTimeout(() => $('#f-name').focus({ preventScroll: true }), 400));
$('#editCfg').addEventListener('click', () => { $('#build').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); goto(1); });
gate();

/* ============================================================
   FORM — carries the configurator payload
   ============================================================ */
function payload() {
  const m = model(), n = headcount();
  return {
    model: MODEL_LABEL[m],
    function: CFG.fn ? (FUNCTIONS.find(f => f.k === CFG.fn) || {}).n : '',
    people: n,
    roles: Object.entries(CFG.roles).map(([r, q]) => `${q}× ${r}`).join('; '),
    ...CFG.params
  };
}

function syncForm() {
  const p = payload();
  $('#podConfigField').value = JSON.stringify(p);
  const recall = $('#formRecall');
  if (p.people || CFG.fn) {
    recall.hidden = false;
    const bits = [p.model];
    if (p.people) bits.push(`${p.people} ${p.people === 1 ? 'person' : 'people'}`);
    if (p.roles) bits.push(p.roles);
    if (p.city) bits.push(p.city.replace(/ —.*/, ''));
    $('#recallText').textContent = bits.filter(Boolean).join(' · ') + '. ';
  } else recall.hidden = true;

  const q = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => { if (v) q.set(k, String(v)); });
  $('#tallyLink').href = TALLY_URL + '?' + q.toString();
}

$('#podForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const st = $('#formStatus'), btn = $('#formSubmit');
  const name = $('#f-name'), email = $('#f-email');
  if (!name.value.trim()) { st.className = 'form-status err'; st.textContent = 'We need a name to reply to.'; name.focus(); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { st.className = 'form-status err'; st.textContent = 'That email address does not look right.'; email.focus(); return; }

  const data = { ...Object.fromEntries(new FormData(e.target).entries()), ...payload(), page: 'away-pods' };

  if (!FORM_ENDPOINT) {
    st.className = 'form-status ok';
    st.textContent = 'Opening the Away enquiry form with your Pod details filled in…';
    const q = new URLSearchParams();
    Object.entries(data).forEach(([k, v]) => { if (v && k !== 'pod_config') q.set(k, String(v)); });
    window.open(TALLY_URL + '?' + q.toString(), '_blank', 'noopener');
    return;
  }
  btn.disabled = true; btn.textContent = 'Sending…';
  try {
    const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!r.ok) throw new Error(r.status);
    st.className = 'form-status ok';
    st.textContent = 'Got it. We will come back to you with a role, workflow or team architecture — usually within one working day.';
    e.target.reset(); btn.textContent = 'Sent';
  } catch (err) {
    st.className = 'form-status err';
    st.innerHTML = 'That did not send. Please email <a href="mailto:hello@away.center" style="color:inherit;text-decoration:underline">hello@away.center</a> or use the form link below.';
    btn.disabled = false; btn.innerHTML = 'Try again';
  }
});

/* ============================================================
   05 — OPERATING LAYER accordion + rings
   ============================================================ */
(() => {
  const items = $$('.ops-item');
  const ring = (r) => {
    $$('.ops-ring').forEach(c => {
      const on = c.dataset.r === r;
      c.setAttribute('stroke', on ? '#FF502A' : '#1A1A1A');
      c.setAttribute('stroke-width', on ? 3 : 1.4);
      c.setAttribute('opacity', on ? 1 : .16);
    });
    $$('.ops-lbl').forEach(t => {
      const on = t.dataset.r === r;
      t.setAttribute('fill', on ? '#FF502A' : '#1A1A1A');
      t.setAttribute('opacity', on ? 1 : .4);
    });
  };
  items.forEach(it => it.addEventListener('click', () => {
    const open = it.getAttribute('aria-expanded') === 'true';
    items.forEach(x => x.setAttribute('aria-expanded', 'false'));
    it.setAttribute('aria-expanded', String(!open));
    ring(!open ? it.dataset.ring : '');
  }));
  ring('1');
})();

/* ============================================================
   07 — CALCULATOR (all inputs supplied by the visitor)
   ============================================================ */
(() => {
  const num = (s) => Math.max(0, parseFloat(String(s).replace(/[^\d.]/g, '')) || 0);
  const fmt = (v, c) => c + Math.round(v).toLocaleString('en-US');
  const local = $('#c-local'), away = $('#c-away'), n = $('#c-n');

  const run = () => {
    const cur = $('#c-cur').value;
    $('#curA').textContent = cur; $('#curB').textContent = cur;
    const L = num(local.value) * 12 * +n.value;
    const A = num(away.value) * 12 * +n.value;
    const max = Math.max(L, A, 1);
    $('#c-nVal').textContent = n.value;
    $('#outLocal').textContent = fmt(L, cur);
    $('#outAway').textContent  = fmt(A, cur);
    $('#barA').style.width = (L / max * 100) + '%';
    $('#barB').style.width = (A / max * 100) + '%';
    const d = L - A;
    $('#outDelta').textContent = (d >= 0 ? '' : '−') + fmt(Math.abs(d), cur);
    $('#outPct').textContent = L > 0
      ? `${d >= 0 ? 'Lower' : 'Higher'} by ${Math.round(Math.abs(d) / L * 100)}% against your own local figure, across ${n.value} ${+n.value === 1 ? 'person' : 'people'} for twelve months.`
      : 'Enter your local cost to compare.';
  };
  [local, away].forEach(el => {
    el.addEventListener('input', run);
    el.addEventListener('blur', () => { const v = num(el.value); el.value = v ? v.toLocaleString('en-US') : ''; run(); });
  });
  [n, $('#c-cur')].forEach(el => el.addEventListener('input', run));
  run();
})();

/* ============================================================
   08 — NANO GCC growth
   ============================================================ */
(() => {
  const wrap = $('#people'), MAX = 15;
  const CAPS = {
    3:  'A first cell. Two operators and a coordinator, with an Away delivery lead shared across clients.',
    5:  'A working unit. Enough people for specialisation, with a dedicated delivery rhythm.',
    10: 'A genuine India team. Multiple functions, an internal lead, a defined operating cadence.',
    15: 'An operating cell. Your India presence, running its own rituals inside the Away layer.'
  };
  wrap.innerHTML = Array.from({ length: MAX }, (_, i) =>
    `<svg class="person" viewBox="0 0 26 34" fill="none" aria-hidden="true" data-i="${i}">
      <circle cx="13" cy="9" r="6.4" stroke="currentColor" stroke-width="2.6"/>
      <path d="M2.6 32c0-6.5 4.7-11 10.4-11s10.4 4.5 10.4 11" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`).join('');
  const people = $$('.person', wrap);
  const show = (n) => {
    people.forEach((p, i) => {
      p.classList.toggle('on', i < n);
      p.classList.toggle('core', i < 3);
      p.classList.toggle('next', i >= 3 && i < n);
      if (!RM) p.style.transitionDelay = (i < n ? i * 42 : 0) + 'ms';
    });
    $('#gccNum').textContent = n === 15 ? '15+' : n;
    $('#gccCap').textContent = CAPS[n];
  };
  let touched = false;
  $$('.gcc-step').forEach(b => b.addEventListener('click', () => {
    touched = true;
    $$('.gcc-step').forEach(x => x.setAttribute('aria-pressed', x === b));
    show(+b.dataset.n);
  }));
  const o = new IntersectionObserver(es => {
    if (es[0].isIntersecting) { if (!touched) show(3); o.disconnect(); }
  }, { threshold: .4 });
  o.observe(wrap);
})();

/* ============================================================
   11 — WORKOS module views
   ============================================================ */
const OS = {
  role: { t: 'Role Card', s: 'Growth Marketer · Bangalore · Client: Northbeam Labs', html: `
    <dl class="os-fields">
      <div class="os-f"><dt>Role type</dt><dd>Managed Role</dd></div>
      <div class="os-f"><dt>City</dt><dd>Bangalore</dd></div>
      <div class="os-f"><dt>Workspace</dt><dd>away Koramangala</dd></div>
      <div class="os-f"><dt>Device</dt><dd>Assigned, Away-managed</dd></div>
      <div class="os-f"><dt>Reporting cadence</dt><dd>Weekly, Friday</dd></div>
      <div class="os-f"><dt>Client manager</dt><dd>Head of Growth</dd></div>
      <div class="os-f"><dt>Away delivery lead</dt><dd>Assigned</dd></div>
      <div class="os-f"><dt>Replacement plan</dt><dd>Backup identified</dd></div>
    </dl>
    <p class="os-sec-t">This role owns</p>
    <ul class="os-bul"><li>Campaign execution across email and paid channels</li><li>Landing page updates and QA before launch</li><li>Weekly analytics and lead-source reporting</li></ul>
    <p class="os-sec-t">This role does not own</p>
    <ul class="os-bul"><li>Channel strategy and budget allocation</li><li>Positioning and pricing decisions</li><li>Commercial targets</li></ul>` },
  flow: { t: 'Workflow Card', s: 'CRM Hygiene · weekly · SLA Friday 16:00 IST', html: `
    <dl class="os-fields">
      <div class="os-f"><dt>Trigger</dt><dd>Weekly, Monday 09:00</dd></div>
      <div class="os-f"><dt>Inputs</dt><dd>CRM export, call notes</dd></div>
      <div class="os-f"><dt>Tools</dt><dd>HubSpot, Sheets</dd></div>
      <div class="os-f"><dt>Output</dt><dd>Clean pipeline + report</dd></div>
      <div class="os-f"><dt>Human review</dt><dd>Before client delivery</dd></div>
      <div class="os-f"><dt>SLA</dt><dd>Friday 16:00 IST</dd></div>
    </dl>
    <p class="os-sec-t">Steps</p>
    <ul class="os-bul"><li>Tag lead source on all new records</li><li>Update deal stages against last activity</li><li>Flag stalled deals over 21 days</li><li>Apply lost-reason taxonomy</li><li>Generate pipeline hygiene report</li></ul>
    <p class="os-sec-t">QA checklist</p>
    <ul class="os-bul"><li>Every field change traceable to a source</li><li>Assumptions marked, not silently applied</li><li>Report reconciles to CRM totals</li></ul>` },
  op: { t: 'Operator Profile', s: 'Away-side view of the person doing the work', html: `
    <dl class="os-fields">
      <div class="os-f"><dt>Role</dt><dd>CRM Operations Associate</dd></div>
      <div class="os-f"><dt>City</dt><dd>Bangalore</dd></div>
      <div class="os-f"><dt>Work location</dt><dd>away Koramangala</dd></div>
      <div class="os-f"><dt>Client assigned</dt><dd>1</dd></div>
      <div class="os-f"><dt>Delivery lead</dt><dd>Assigned</dd></div>
      <div class="os-f"><dt>Device</dt><dd>Assigned</dd></div>
      <div class="os-f"><dt>Training completed</dt><dd>Onboarding sprint, SOP set</dd></div>
      <div class="os-f"><dt>Backup operator</dt><dd>Identified</dd></div>
    </dl>
    <p class="os-sec-t">Scored at hiring</p>
    <ul class="os-bul"><li>Communication · role skill · reliability · judgement</li><li>Learning speed · comfort with AI tools · tool fluency</li><li>Ownership · coachability · professionalism</li></ul>` },
  task: { t: 'Task Board', s: 'Every task carries an SOP link and evidence', html: `
    <div class="os-tasks">
      <div class="os-task"><span class="os-chk done"><svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true"><path d="M1 3.5L3.3 6 8 1" stroke="#DFFDB3" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span><span class="os-tname">Weekly CRM hygiene pass</span><span class="os-tmeta">SOP-014 · evidence attached · 2h 10m</span></span><span class="os-st st-done">Client ready</span></div>
      <div class="os-task"><span class="os-chk done"><svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true"><path d="M1 3.5L3.3 6 8 1" stroke="#DFFDB3" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span><span class="os-tname">ICP account research — batch 12</span><span class="os-tmeta">SOP-006 · 40 accounts · enriched</span></span><span class="os-st st-qa">In QA</span></div>
      <div class="os-task"><span class="os-chk"></span><span><span class="os-tname">Lost-reason taxonomy update</span><span class="os-tmeta">SOP-014 · due Thursday</span></span><span class="os-st st-prog">In progress</span></div>
      <div class="os-task"><span class="os-chk"></span><span><span class="os-tname">Sequence copy review</span><span class="os-tmeta">Waiting on client approval · 2 days</span></span><span class="os-st st-block">Blocked</span></div>
      <div class="os-task"><span class="os-chk"></span><span><span class="os-tname">Pipeline report — week 32</span><span class="os-tmeta">SOP-021 · scheduled Friday</span></span><span class="os-st st-prog">Queued</span></div>
    </div>` },
  rep: { t: 'Weekly Report', s: 'Shows movement, not a timesheet', html: `
    <div class="os-rep">
      <div class="os-stat"><p class="os-sn">18</p><p class="os-sl">Tasks completed</p></div>
      <div class="os-stat"><p class="os-sn">2</p><p class="os-sl">Blocked on client</p></div>
      <div class="os-stat"><p class="os-sn">1</p><p class="os-sl">SOP improved</p></div>
      <div class="os-stat"><p class="os-sn">3</p><p class="os-sl">Decisions needed</p></div>
    </div>
    <p class="os-sec-t">Decisions we need from you</p>
    <ul class="os-bul"><li>Approve the revised lost-reason list before Friday</li><li>Confirm whether tier-3 accounts stay in scope</li><li>Sign off on the sequence copy sitting in review</li></ul>
    <p class="os-sec-t">Risks and suggestions</p>
    <ul class="os-bul"><li>Enrichment credits run out in nine days at current volume</li><li>Two steps of SOP-006 are now automatable — we would like to propose it</li></ul>
    <p class="tiny" style="color:var(--light-40);margin-top:16px">Example values, shown to illustrate the report structure.</p>` },
  sop: { t: 'SOP Library', s: 'The asset that survives any individual leaving', html: `
    <ul class="os-bul">
      <li><strong>SOP-006</strong> — Outbound account research and enrichment</li>
      <li><strong>SOP-014</strong> — CRM hygiene and pipeline pass</li>
      <li><strong>SOP-021</strong> — Weekly reporting pack</li>
      <li><strong>SOP-030</strong> — Founder follow-up and action tracking</li>
      <li><strong>SOP-042</strong> — Support triage and escalation rules</li>
      <li><strong>SOP-055</strong> — Content repurposing and publishing</li>
      <li><strong>SOP-061</strong> — AI output review checklist</li>
    </ul>
    <p class="os-sec-t">Why this matters</p>
    <ul class="os-bul"><li>Every SOP has inputs, steps, human review points, an output format and a QA checklist</li><li>When an operator changes, the process does not restart from zero</li><li>Repeated tasks visible here become candidates for a Managed Workflow</li></ul>` },
  ct: { t: 'Control Tower', s: 'Away-internal view — how we catch problems early', html: `
    <div class="os-rep">
      <div class="os-stat"><p class="os-sn">—</p><p class="os-sl">Client health</p></div>
      <div class="os-stat"><p class="os-sn">—</p><p class="os-sl">Overdue rate</p></div>
      <div class="os-stat"><p class="os-sn">—</p><p class="os-sl">QA score</p></div>
      <div class="os-stat"><p class="os-sn">—</p><p class="os-sl">Replacement risk</p></div>
    </div>
    <p class="os-sec-t">Tracked internally per client</p>
    <ul class="os-bul"><li>Operator performance and attendance</li><li>Task overdue rate and blocker resolution time</li><li>QA score and scope-creep incidents</li><li>Renewal risk and expansion opportunity</li></ul>
    <p class="tiny" style="color:var(--light-40);margin-top:16px">Away-internal module. Values are deliberately not shown here.</p>` }
};
(() => {
  const view = $('#osView'), navs = $$('.os-nav');
  const set = (k) => {
    const d = OS[k];
    view.innerHTML = `<div class="os-vh"><span class="os-vt">${d.t}</span><span class="os-vs">${d.s}</span></div>${d.html}`;
  };
  navs.forEach((b, i) => {
    b.addEventListener('click', () => {
      navs.forEach((x, j) => { x.setAttribute('aria-selected', j === i); x.tabIndex = j === i ? 0 : -1; });
      set(b.dataset.os);
    });
    b.addEventListener('keydown', (e) => {
      const d = { ArrowDown: 1, ArrowUp: -1, ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
      e.preventDefault(); const n = (i + d + navs.length) % navs.length; navs[n].click(); navs[n].focus();
    });
  });
  set('role');
})();

/* ============================================================
   10 — TIMELINE dots
   ============================================================ */
(() => {
  const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { threshold: .5 });
  $$('.tl-i').forEach((el, i) => { el.style.transitionDelay = (i * 60) + 'ms'; o.observe(el); });
})();

/* ============================================================
   14 — FAQ
   ============================================================ */
(() => {
  const items = $$('.faq-i');
  items.forEach(it => $('.faq-q', it).addEventListener('click', () => {
    const open = it.getAttribute('aria-expanded') === 'true';
    items.forEach(x => x.setAttribute('aria-expanded', 'false'));
    it.setAttribute('aria-expanded', String(!open));
  }));
  $$('.ff').forEach(b => b.addEventListener('click', () => {
    $$('.ff').forEach(x => x.setAttribute('aria-pressed', x === b));
    const f = b.dataset.f;
    items.forEach(it => it.hidden = !(f === 'all' || it.dataset.c === f));
  }));
})();

/* ============================================================
   Nav anchor offset for keyboard users
   ============================================================ */
$$('a[href^="#"]').forEach(a => a.addEventListener('click', () => {
  const t = document.getElementById(a.getAttribute('href').slice(1));
  if (t) setTimeout(() => { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }, 500);
}));

})();
