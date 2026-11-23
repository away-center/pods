# Pending video assets

No videos, blank players, fake URLs or replacement graphics have been added. Placement and order are still your decisions.

Upload original MP4 or MOV files in this chat, or upload them to a Google Drive folder named **Away Pods — Website Videos** and share its accessible folder/file links. Do not send passwords. Keep originals at their highest available quality; compression can happen after selection.

For each file, supply:

- Page and section heading (or URL anchor), and the exact position relative to existing copy/graphics.
- Ordering if there is more than one clip, purpose, and any trim points.
- Click-to-play or autoplay. Autoplay must be muted and inline; reduced-motion visitors should get a poster and manual playback.
- Sound preference, captions/subtitle file (WebVTT/SRT), spoken language, and a transcript when available.
- Landscape/portrait alternatives, thumbnail/poster preference, and whether the clip may be shown publicly.

## Dormant insertion boundaries

Comments mark possible integration boundaries only, not approved placements:

| Page | Existing section | Comment identifier |
| --- | --- | --- |
| `/` | Hero | `main` |
| `/` | Operating layer | `layer` |
| `/` | Workspace | `workspace` |
| `/` | WorkOS | `workos` |
| `/start/` | Your India team. Right here in Bangalore. | `start-workspace` |

A video can also be inserted in another section you specify. Preserve each existing illustration and all existing text. Use a responsive aspect ratio, a poster, `preload="none"` or metadata, captions, accessible controls, and no audio autoplay. Pause offscreen/autoplay footage for reduced motion. Test mobile, captions, keyboard operation and performance after real assets arrive. Drive links are asset handoff links, not the final video hosting URLs.


## Assets and placement agreed — 23 November 2026

Three total videos, subject to obtaining original files from Frame.io:
- **Nirvaan 1:** `Away_Pods_1_4K.mp4` (horizontal; screenshot duration 1:13).
- **Nirvaan 2:** `Away_Pods_2_4K.mp4` (horizontal; screenshot duration 1:22).
- **UJ:** `Away_Pods_3_16x9_anim...` and `Away_Pods_3_9x16_ani...` (two aspect-ratio exports of the same video; screenshot duration 1:50).

Original share: https://next.frame.io/share/c329e975-6db6-4f2e-bc75-efa0eb4c6aa5/180265ba-bf6b-47f5-b424-72ff19bfcde5

Intended role: Explain what Pods is, who benefits, and common visitor questions. No autoplay: each clip must start only upon visitor interaction, with native/accessible playback controls. When less than 20% is visible, or the browser tab becomes hidden, pause it; never automatically resume. When one starts, pause the other videos. Use `video[data-pods-video]` so the shared enhancement script applies this behaviour.

**Recommended layout, awaiting actual videos:** Put Nirvaan's two landscape clips together immediately after the existing four-model explainer (`#ladder`), before the following recruiting/operating-layer explanation; this is close to the second fold without disrupting the interactive models. Put UJ video in the existing homepage FAQ section (`#faq`), with 16:9 on desktop and 9:16 on narrow mobile layouts. Keep all existing FAQ questions and answers unchanged. On `/start/`, preserve existing FAQ if present; do not duplicate the video across pages without explicit approval.

Do not embed inaccessible Frame.io share URLs as raw `video src` links. A Frame.io share page is not a verified direct video media URL. Browser access from this chat could not retrieve the MP4 originals. Obtain publicly shareable downloadable MP4s or a Drive folder with download permission before creating media markup. Prefer optimized 1080p H.264 MP4 derivatives, preserve high-resolution masters outside site assets, and request captions/transcripts and poster-frame approval. Uploaded brand art can complement video poster compositions but existing graphics must remain untouched.

Brand asset inventory supplied: `04a Birds eye view.jpg`, `IMG_2367.PNG`, `IMG_2376.PNG`, `IMG_2378.PNG`, `IMG_2399.PNG`, `IMG_2401.PNG`, `IMG_2380.PNG`, `IMG_2424.PNG`, `Sofa 1a.PNG`, `Table and plant 1a.PNG`, `Table and toaster 1a.PNG`, `Gmail 1.PNG`, `Printer 1a.PNG`, `07 VR.PNG`. They are in the user's conversation, not yet included in GitHub. Most are transparent RGBA PNG graphics. Add selectively once contextual placement is confirmed; do not replace current illustrations.

## Integration prepared from verified Drive files (23 November 2026)

The folder is accessible to the connected Drive account and contains the four verified MP4 files. The original files are large (107 MB, 112 MB, 59 MB and 59 MB). They must not be dropped into the production page as 4K direct downloads. The code adds a two-video native player showcase after `#ladder` and a responsive FAQ player in `#faq`, with zero existing text/graphics/interaction removal. Native players are intentionally hidden until direct hosted MP4 URLs are configured in `site-config.js`. The Drive **view** links are not playable MP4 source URLs; embedding them as if they were media URLs would create broken videos. The native player already pauses when less than 20% visible, when the tab is hidden, or when another clip starts; no autoplay and no automatic resume. The UJ player switches from 16:9 landscape to 9:16 portrait on narrow mobile viewports. Source switching is paused and attempts to maintain playback time. Add VTT captions when approved/transcribed.

Mapping:
- nirvaan1: 1c7kf file? **No** — confirmed `Away_Pods_1_4K.mp4` is Drive file ID `1HxpN9CfDuBiwL8WbeW4lRiUGlLjjg6u4` (1:13).
- nirvaan2: `Away_Pods_2_4K.mp4`, Drive file ID `1c7kfTaSWB_xSq5TardrZlM7k6GFWi7r9` (1:22).
- uj landscape: `Away_Pods_3_16x9_animated.mp4`, Drive file ID `144yJgPNYqMA142ji9z92Ooh1MkyZCuLQ` (1:51).
- uj portrait: `Away_Pods_3_9x16_animated.mp4`, Drive file ID `1lq5QGVbqILqrJ_C4vvpNGAwstsjv9NX-` (1:51).

**Publishing blocker:** Original downloads are available but the connected GitHub text-file tool does not upload native MP4 binaries, and suitable direct streaming URLs have not been published. Upload optimized encodes to dedicated static media hosting (e.g. Vercel Blob/CDN) before populating `site-config.js`. Do not introduce iframe-based Drive video players: their playback cannot be reliably paused/resumed via native HTMLVideoElement. No production deployment made.
