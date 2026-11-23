(() => {
  'use strict';
  const menu = document.querySelector('[data-menu]');
  const nav = document.getElementById('pods-navigation');
  if (menu && nav) {
    const close = () => { menu.setAttribute('aria-expanded','false'); nav.classList.remove('is-open'); };
    menu.addEventListener('click',() => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded',String(open)); nav.classList.toggle('is-open',open);
    });
    nav.addEventListener('click',event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown',event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { close(); menu.focus(); } });
    document.addEventListener('click',event => { if (!nav.contains(event.target) && !menu.contains(event.target)) close(); });
  }
  document.querySelectorAll('[data-unified-form]').forEach(form => podsEnquiry.bind(form,{context:{page:'contact'}}));
  // Mirror existing accordion state onto its focusable control for assistive technology.
  document.querySelectorAll('.faq-i').forEach((item,index) => {
    const button = item.querySelector('.faq-q'), answer = item.querySelector('.faq-a');
    answer.id ||= `faq-answer-${index}`;
    button.setAttribute('aria-controls',answer.id);
    const sync = () => { const open = item.getAttribute('aria-expanded') === 'true'; button.setAttribute('aria-expanded',String(open)); answer.setAttribute('aria-hidden',String(!open)); };
    new MutationObserver(sync).observe(item,{attributes:true,attributeFilter:['aria-expanded']}); sync();
  });

  // Future Pods videos: click-to-play only; pause outside the viewport or when
  // another clip starts. No network requests or players until real video URLs exist.
  const podsVideos = [...document.querySelectorAll('video[data-pods-video]')];
  podsVideos.forEach(video => {
    video.removeAttribute('autoplay');
    video.autoplay = false;
    video.controls = true;
    video.playsInline = true;
    if (!video.hasAttribute('preload')) video.preload = 'metadata';
    video.addEventListener('play', () => {
      podsVideos.forEach(other => { if (other !== video && !other.paused) other.pause(); });
    });
  });
  if (podsVideos.length && 'IntersectionObserver' in window) {
    const offscreenPause = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.intersectionRatio < 0.2 && !entry.target.paused) entry.target.pause();
      });
    }, {threshold:[0,0.2,0.5,1]});
    podsVideos.forEach(video => offscreenPause.observe(video));
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) podsVideos.forEach(video => { if (!video.paused) video.pause(); });
  });

})();
