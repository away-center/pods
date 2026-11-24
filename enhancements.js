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

  // Additive native media players. Empty config means no empty/broken embeds.
  // Sources must be direct downloadable HTTPS MP4 URLs, not Drive viewing pages.
  const placements = {
    nirvaan1: {label:'Away Pods — introduction', title:'An introduction to away Pods', index:'01', runtime:'1:13'},
    nirvaan2: {label:'Away Pods — how the model works', title:'How away Pods works', index:'02', runtime:'1:22'},
    uj: {label:'Away Pods — questions answered', title:'Questions about away Pods', index:'03', runtime:'1:50'}
  };
  const mediaConfig = window.PODS_CONFIG?.videos || {};
  const podsVideos = [];
  const isHttps = value => typeof value === 'string' && /^https:\/\/[^\s]+$/i.test(value);
  const narrow = window.matchMedia('(max-width: 700px)');
  document.querySelectorAll('[data-pods-video-slot]').forEach(slot => {
    const key = slot.dataset.podsVideoSlot;
    const data = mediaConfig[key];
    if (!data || !isHttps(data.landscape)) return;
    const video = document.createElement('video');
    video.setAttribute('data-pods-video', '');
    video.setAttribute('aria-label', placements[key]?.label || 'Away Pods video');
    video.controls = true;
    video.autoplay = false;
    video.playsInline = true;
    video.preload = 'none';
    const posterForViewport = () => key === 'uj' && narrow.matches && isHttps(data.portraitPoster)
      ? data.portraitPoster : data.poster;
    const applyPoster = () => {
      const poster = posterForViewport();
      if (isHttps(poster) && video.poster !== poster) video.poster = poster;
    };
    applyPoster();
    const sourceForViewport = () => key === 'uj' && narrow.matches && isHttps(data.portrait) ? data.portrait : data.landscape;
    const setSource = () => {
      if (video.src === sourceForViewport()) return;
      const wasStarted = video.currentTime > 0 && !video.ended;
      const previousTime = video.currentTime;
      video.pause();
      video.src = sourceForViewport();
      if (wasStarted) video.addEventListener('loadedmetadata', () => {
        video.currentTime = Math.min(previousTime, video.duration || previousTime);
      }, {once:true});
      video.dataset.mobilePortrait = String(key === 'uj' && narrow.matches && isHttps(data.portrait));
    };
    setSource();
    if (key === 'uj') narrow.addEventListener('change', () => {
      applyPoster();
      setSource();
    });
    if (isHttps(data.captions)) {
      const track = document.createElement('track');
      track.kind = 'captions'; track.srclang = 'en'; track.label = 'English'; track.src = data.captions;
      video.append(track);
    }
    const kicker = document.createElement('div');
    kicker.className = 'pods-media-kicker';
    const episode = document.createElement('span');
    episode.textContent = `AWAY PODS / VIDEO ${placements[key]?.index || ''}`;
    const runtime = document.createElement('span');
    runtime.className = 'pods-media-length';
    runtime.textContent = placements[key]?.runtime || '';
    kicker.append(episode, runtime);
    const caption = document.createElement('figcaption');
    caption.textContent = placements[key]?.title || 'Away Pods video';
    slot.append(kicker, video, caption);
    slot.hidden = false;
    podsVideos.push(video);
    video.addEventListener('play', () => {
      podsVideos.forEach(other => { if (other !== video && !other.paused) other.pause(); });
    });
  });
  document.querySelectorAll('[data-pods-video-showcase]').forEach(showcase => {
    if (showcase.querySelector('figure:not([hidden])')) showcase.hidden = false;
  });
  if (podsVideos.length && 'IntersectionObserver' in window) {
    const pauseOffscreen = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.intersectionRatio < 0.2 && !entry.target.paused) entry.target.pause();
      });
    }, {threshold:[0,0.2,0.5,1]});
    podsVideos.forEach(video => pauseOffscreen.observe(video));
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) podsVideos.forEach(video => { if (!video.paused) video.pause(); });
  });

})();
