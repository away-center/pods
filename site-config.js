// Public-only configuration for the Away Pods preview. Do not add credentials.
// The public media URLs point to user-provided files in their Vercel Blob store.
window.PODS_CONFIG = Object.freeze({
  founderCalendarUrl: '',
  videos: Object.freeze({
    nirvaan1: Object.freeze({
      landscape:'https://7d2sylb7vqedsnra.public.blob.vercel-storage.com/Pods%20Videos/nirvaan_01_web.mp4',
      poster:'https://7d2sylb7vqedsnra.public.blob.vercel-storage.com/Pods%20Video%20Posters/nirvaan_01_poster.jpg',
      captions:''
    }),
    nirvaan2: Object.freeze({
      landscape:'https://7d2sylb7vqedsnra.public.blob.vercel-storage.com/Pods%20Videos/nirvaan_02_web.mp4',
      poster:'https://7d2sylb7vqedsnra.public.blob.vercel-storage.com/Pods%20Video%20Posters/nirvaan_02_poster.jpg',
      captions:''
    }),
    uj: Object.freeze({
      landscape:'https://7d2sylb7vqedsnra.public.blob.vercel-storage.com/Pods%20Videos/uj_16x9_web.mp4',
      portrait:'https://7d2sylb7vqedsnra.public.blob.vercel-storage.com/Pods%20Videos/uj_9x16_web.mp4',
      poster:'https://7d2sylb7vqedsnra.public.blob.vercel-storage.com/Pods%20Video%20Posters/uj_16x9_poster.jpg',
      portraitPoster:'https://7d2sylb7vqedsnra.public.blob.vercel-storage.com/Pods%20Video%20Posters/uj_9x16_poster.jpg',
      captions:''
    })
  })
});
