# away Pods — editorial redesign (review version)

The original production website is **not edited** by this project.

- Production branch: main
- Original snapshot: backup/pre-redesign-2026-11-13 (commit 33f797a)
- Redesign branch: redesign/libre-caslon-editorial
- New design lives under redesign/preview/; production still serves the original root index.html and /start/.

## Build and preview

The preview is dependency-free and generated from a source template:

    node redesign/scripts/build.mjs
    python3 -m http.server 8080

Open http://localhost:8080/redesign/preview/.

## Adding more brand assets

Use the **redesign branch**, not main, until the site is approved.

1. Create these folders as needed:
   - redesign/assets/brand/illustrations/ for SVGs.
   - redesign/assets/brand/patterns/ for SVGs or transparent PNGs.
   - redesign/assets/brand/raster/ for optimised PNG, WebP or AVIF assets.
2. Rename clearly, such as team-at-desk.svg, studio-pattern-01.svg, community-scene.webp.
3. Prefer SVG for flat illustrations, icons and repeatable patterns. Export from Illustrator/Figma with expanded/stable strokes, embedded assets and no external font references. Optimise only after checking visual fidelity.
4. Use PNG for transparent artwork where vector originals are unavailable. Keep enough resolution for its displayed size, typically 2x.
5. Convert HEIC to WebP or AVIF before uploading; HEIC is not broadly supported by web browsers. Export around quality 80-85 and inspect the result.
6. Keep original AI/HEIC master files outside the deployed web assets, or in a source-assets archive.
7. Include meaningful alternative text for informational illustrations. Decorative patterns should use empty alt text or CSS backgrounds.
8. Rebuild and check mobile, desktop, image sizes and cropping.

Example HTML:

    <img src="/redesign/assets/brand/illustrations/team-at-desk.svg"
         alt="Illustration of two people working at a desk"
         width="560" height="440" loading="lazy">

To upload via GitHub: open away-center/pods, switch the branch selector to redesign/libre-caslon-editorial, navigate to the relevant asset folder, choose Add file > Upload files, then commit to **this branch**. GitHub's editor cannot edit Illustrator files; upload the SVG/PNG/WebP export.

The supplied 5_icons.ai was a two-page vector sheet. Four transparent PNG extracts are included in redesign/assets/brand/ for this concept; replace these with individual SVG exports later for ultimate sharpness.

## Fonts

The supplied Libre Caslon Text family (Regular, Italic, Bold) is bundled in redesign/assets/fonts/ with its SIL Open Font License. Hanken Grotesk is used for interface text. Space Grotesk and Avantime are not used in the preview.

## Approval before launch

This is a design preview, not approved production legal copy. Review:

- Actual entity operating away Pods, address, contact and enquiry-processing disclosures.
- Employment/EOR partner responsibilities and any service commitments.
- Privacy Policy, website Terms and any cookie consent required by analytics.
- Marketing claims and any future client testimonials.
- Accessibility, performance, and end-to-end enquiry delivery.

Promote a reviewed version through a PR and a separately approved routing/deployment change. Keep the backup branch unchanged.
