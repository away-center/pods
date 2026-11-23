// Public configuration only. Never add keys, credentials or private media URLs.
// Video fields require public, direct HTTPS MP4 media URLs and optional JPG/VTT URLs.
// Drive viewing-page URLs are not compatible with native playback.
window.PODS_CONFIG = Object.freeze({
  founderCalendarUrl: '',
  videos: Object.freeze({
    nirvaan1: {landscape:'', poster:'', captions:''},
    nirvaan2: {landscape:'', poster:'', captions:''},
    uj: {landscape:'', portrait:'', poster:'', captions:''}
  })
});
