# Away Pods enhancement handoff

Prepared 23 November 2026. Work branch: `enhancement/pods-v2`. No production deployment or merge authorized or performed.

## Source and deployment audit

- Baseline `main`: `33f797a79202827d2ff544334739e2892b7bcca2`.
- Reference only: `redesign/libre-caslon-editorial` at `5715c386cb80ad00577c14595babe2855badcd73`. Backup and reference branches untouched.
- Baseline repository has nine files: static homepage/start HTML, CSS and JavaScript, shared enquiry helper, and a CommonJS `/api/enquiry` handler. No package manifest, test suite, deployment configuration or GitHub Actions workflows were in the source tree.
- GitHub reports a successful Vercel status for baseline main, pointing to project `udbhav-jalans-projects/pods`. This proves the deployment integration; dashboard production-branch/domain/environment settings were not independently accessible or verified. The production address supplied by the owner is `https://pods.away.center`.
- Original API embedded a live Apps Script URL as its fallback. It checked content type/origin/size, but did not validate required fields itself. Existing frontend reused an ID on retry, but persistent deduplication at the Google Sheet was not inspectable; original Apps Script source is absent.
- `vercel.json` disables Git-triggered deployment of **this enhancement branch only**, using [Vercel's documented branch setting](https://vercel.com/docs/project-configuration/git-configuration). It does not modify main or its production deployment behavior. No hosting settings, aliases or domains were changed. Do not manually deploy this branch with `--prod`.

## What changed

| Files | Purpose |
| --- | --- |
| `index.html`, `start/index.html` | Four core fields; original extra fields retained in optional disclosures; supporting links; dormant video comments. Primary homepage CTAs route to `/start/`; explicit configurator CTAs still explore in place. |
| `enquiry.js` | One submission/controller implementation; required trimmed name/email/brief; optional company; session campaign + first landing page + CTA + submission page/time; loading/error/success; concurrent send coalescing; retry with same ID; safe optional booking. No contact data in session storage. |
| `away-pods.js`, `start/start.js` | Use shared handler; retain configurator/sample requests and existing start analytics events. Mobile sticky CTA visibility/focus fix. |
| `api/enquiry.js`, `lib/enquiry.cjs` | Server validation, allowlisted fields, same-origin checks, 32 KB limit, timeout, strict acknowledgement, separate preview/production destinations, no live fallback. |
| `integrations/google-sheets/Code.gs` | Proposed Apps Script adapter: shared-secret verification, lock-protected persistent ID lookup, schema validation, formula-safe cells, attribution columns, no sensitive logs. Not installed in Google. |
| `contact/`, `about/`, `security/`, `privacy-policy/`, `terms-of-use/` | Five supporting pages. Contact uses the shared form; other prose selectively adapted from reference. Policy/terms remain clearly marked drafts. |
| `enhancements.css`, `enhancements.js`, `assets/` | Local licensed Libre Caslon for selected headings, paper surface/dividers, focus visibility, touch sizes, mobile menu with Escape/close behavior, FAQ state announcements. Original CSS and hero animation source untouched. Supporting About illustration copied from reference. |
| `site-config.js` | Empty founder calendar setting, no fake booking link. |
| `scripts/preview.cjs`, `tests/`, `package*.json`, `.gitignore`, `vercel.json`, `docs/` | Isolated preview, repeatable checks, branch deployment guard and handoff. |

Existing non-form copy, section order and SVG/image markup on both original pages are checked against the frozen baseline. Existing form labels and optional fields are retained; required markers change where requirements changed. The homepage configurator, explorer, model tabs, calculator, WorkOS and FAQ remain in place. The homepage form retains its configuration payload. `/start/` keeps the existing first-name label; last name is now optional. No email-provider blocking is imposed.

## Local preview

From the repository folder, with Node.js 18.16+ (a maintained LTS release is recommended):

```text
npm ci
npm run preview
```

Open `http://127.0.0.1:4173/`. Also review `/start/`, `/contact/`, `/about/`, `/security/`, `/privacy-policy/`, `/terms-of-use/`.

Preview binds only to this computer, sends through the real API handler to an in-memory Sheet double, and overrides inherited production settings. No live Google writes occur. Submitted test rows are available locally at `/__preview/rows`; restarting clears them. `POST /__preview/fail-next` simulates one delivery failure. Do not enter real lead data in this test preview. The local server denies backend, test, documentation and hidden files. Preview responses carry `X-Robots-Tag: noindex, nofollow`.

```text
npm test
npm run test:browser
```

Browser checks use installed Google Chrome. Screenshots are generated under ignored `test-results/`. If Chrome is elsewhere, adjust the Playwright launch channel in the browser test. Dependencies are pinned in the lockfile; npm install reported zero vulnerabilities.

## Google Sheets integration: isolated acceptance first

1. Create a **new test spreadsheet** and a blank tab named `Enquiries`. Do not connect the existing production Sheet.
2. In a separate Apps Script project, copy `integrations/google-sheets/Code.gs`. Set Script Properties `SHEET_ID`, `SHEET_NAME`, and a strong random `SHARED_SECRET`. Keep secrets out of the repository and chat.
3. Deploy that test script as a web app executing as the owner, with caller access appropriate for the server integration. The script enforces the shared secret. Verify its access/deployment settings in the Google account.
4. In a separately reviewed hosting preview, set `PODS_TEST_ENQUIRY_ENDPOINT` and `PODS_TEST_ENQUIRY_SECRET` to this **test-only** deployment. The local preview intentionally always uses its in-memory adapter. No hosted preview was created in this task.
5. Send synthetic data from the preview. Verify exactly one row, server received timestamp, name/email/company/brief, landing/submission pages, CTA, all UTM fields and optional/configurator data in `details_json`.
6. Repeat the exact same payload and submission ID; row count must remain unchanged. Simulate a timeout after writing and retry with the same ID. Two distinct valid IDs should create two rows. Check validation, formula-like strings and failed delivery with details retained.
7. Record the test Sheet, Apps Script version, preview URL and results before launch approval. The existing production Apps Script/Sheet compatibility is not verified. This new adapter requires an acknowledgement containing the submission ID and will fail closed against an older incompatible endpoint.

`PODS_ENQUIRY_ENDPOINT` / `PODS_ENQUIRY_SECRET` are read **only** when `VERCEL_ENV=production`. They are for a future approved release. Missing or incompatible configuration yields a retriable failure instead of claiming a lead was saved. Persistent deduplication lives in the Sheet under a script lock, not a serverless process cache. It prevents repeated delivery of the same ID; it is not fuzzy email/person deduplication across new sessions. Do not run multiple independent script projects writing the same tab, because their locks are separate. Schema mismatch fails closed. At high volume, replace the linear ID scan with a suitable durable idempotency store.

## Founder calendar

Set a verified HTTPS URL in `site-config.js` (`founderCalendarUrl`). Until then, the booking link is hidden and success text explains email follow-up. The option appears only after acknowledged enquiry delivery. No invented URL is present. No calendar webhook exists; clicking the link is not treated as a confirmed booking, and the Sheet starts with `calendar_status=not_booked`. Confirmed booking correlation requires the provider/webhook details later.

## Verification performed and limits

- Seven backend/adapter tests: validation, malformed JSON, size/origin/method rejection, preview isolation, attribution forwarding, acknowledgement/timeout/error handling, persistent duplicate IDs including lost acknowledgement, schema refusal and formula escaping.
- Real Chrome: seven routes at 1440, 768, 375 and 320 px; no horizontal overflow; images and in-page links; no page script exceptions; model/explorer/WorkOS/FAQ interactions; complete configurator with role carryover; calculator; all three forms; attribution across navigation; preserved form data and ID on retry; optional valid/blank/unsafe calendar; concurrent/repeated send protection; whitespace validation; unavailable storage; mobile menu Escape behavior.
- Preservation: original non-form text remains in sequence, all original section IDs/order and SVG/image markup remain. Original `away-pods.css`, `start/start.css` and `hero.js` unchanged.
- Visual inspection of desktop hero and mobile form screenshots. This is targeted usability/accessibility verification, not a claim of a complete WCAG audit or production performance certification.
- Not performed: production submissions, actual test Google Sheet writes, hosting-dashboard configuration verification, calendar provider booking/webhook confirmation or video QA.

## Pending owner inputs / release gates

- Test Sheet/Apps Script setup and verified delivery as above.
- Optional founder calendar URL.
- Videos and placement instructions: see `docs/VIDEOS.md`.
- Privacy and Terms: legal operator, address, direct privacy contact, processors, retention, jurisdiction and legal approval. Drafts are review pages, not final compliance notices.
- Confirm Security operating controls and About founder biography/launch status. These are reference-branch statements, not independently verified certifications or claims.
- Existing homepage claims such as “The original away Pod” and “Most clients never need more than two” remain verbatim as requested; reconcile them with the developing-service language on supporting pages before publication if needed. No silent copy correction was made.
- Before any release, verify Vercel production branch/domain mapping and scope secrets, review baseline comparison and screenshots, provide actual assets, and obtain explicit approval to merge/deploy. Main and production remain outside this work's changes.
