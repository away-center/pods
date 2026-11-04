(() => {
'use strict';
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const io = new IntersectionObserver((es) => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
$$('.rv').forEach(el => io.observe(el));

/* ============================================================
   01, HERO: the team assembling
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

})();
