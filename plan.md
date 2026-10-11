# AgriShield AI — Implementation Plan

## Product scope

Build the approved mobile-first, India-first AgriShield AI web prototype: a public product site plus an authenticated farmer workspace that joins field records, image capture/upload, explicitly illustrative risk/weather views, safe advisory guidance, alerts, history and feedback. Include read-only/sample expert and administrator views. Deliver a polished Preview; this plan does not include public publication.

The design and copy must distinguish prototype data from operational agronomy. No image model, live weather provider, OTP provider or region-approved chemical-guidance source is configured. The first build therefore will not claim a real diagnosis, measured weather, calibrated disease probability or pesticide recommendation. Uploaded images will be validated locally and not retained; the result will state that automated analysis is unavailable and direct the farmer to scouting or expert review. Illustrative dashboard values and expert/admin sample records will be visibly labelled as examples.

## Implementation approach

- **Frontend:** React + TypeScript + Vite with a responsive application shell, React Router for public and authenticated/demo routes, Recharts for a synthetic risk curve, and Lucide icons. Use project-scoped CSS design tokens and reusable components rather than generated screenshots or a UI-template look.
- **Backend:** a small TypeScript/Express server on the project's configured port (3000), serving the Vite development middleware and API in Preview and the compiled client in production. Browser-facing URLs stay root-relative.
- **Identity and access:** use the default Manus account OAuth flow for real app sign-in; phone OTP remains a future provider integration. Bind OAuth state to a single-use browser nonce and validate sessions server-side. New users receive only the farmer role. Expert/admin screens are read-only illustrative previews and do not expose role escalation or pretend that real review records exist.
- **Persistent farmer records:** use the project's managed MySQL-compatible database, `DATABASE_URL`, and additive, version-recorded migrations. Scope farms/fields, image-review summaries, observations and audit records to the authenticated user. Alert preference controls are device-local samples, not a persisted delivery system. Do not write image bytes to the database or long-term storage in this prototype. Avoid destructive schema/data operations.
- **Diagnosis and risk:** define structured, typed API responses that mirror the PRD. Image intake checks supported MIME type, size, file decodability and dimensions; it does not run blur, lighting, crop-relevance or disease inference. No classifier is connected. The risk curve is visual fixture data, clearly labeled illustrative and not a live forecast or calibrated probability. Diagnosis and risk fields remain nullable/unconfirmed; unavailable weather or uncertain evidence suppresses claims. Keep environmental favorability separate from disease diagnosis and estimated future spread.
- **Advisory and safety:** show concrete non-chemical scouting steps, a reassessment window, and provenance/limitations. Do not render chemical treatment advice or infer a spray need from humidity. Expert escalation is the appropriate response for uncertainty.
- **PWA and connectivity:** provide an application manifest and a lightweight shell-only service worker if the selected serving workflow supports it; never cache or expose private farm records offline. Keep uploads retryable and the main screens usable on a narrow mobile viewport.
- **Inclusive farmer access:** offer a persistent, self-selected language setting for English plus 12 Indian languages (Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Urdu, Kannada, Malayalam, Punjabi, Odia and Assamese), with readable native scripts and right-to-left Urdu layout. Translate the public sign-in and core farmer field, photo-review and safe-next-step journey into short plain sentences, large labeled actions and a visible read-aloud control backed by the browser's available speech voices. Persist the selected language on the device, keep technical/prototype disclaimers intact, and clearly disclose that translations are a prototype requiring native-speaker and agronomist review before production. Keep secondary expert/admin sample surfaces clearly marked if not fully localized.
- **Routes:** maintain `public/manus-routes.json` from the actual page routes. The public landing page provides Home, How it works, Crops supported and About as clear in-page sections/anchors, plus a Login route; the app covers onboarding, dashboard, fields, scan, diagnosis, risk, advisory, alerts, history, expert sample and admin sample pages.
- **Data contract:** keep diagnosis, forecast, advisory and provenance fields structured: crop/growth stage; diagnosis status/hypothesis/confidence/calibration/alternatives/image quality; forecast horizon/score/label/calibration/data completeness/drivers; advisory priority/action/chemical state/reassessment/expert-review requirement; weather source/model version/generated time. Prototype-only fields must remain explicitly illustrative and must not be misrepresented as validated output.

### Project structure

```text
/home/ubuntu/agrishield/
├── plan.md                         # this approved implementation plan
├── TODO.md                         # grouped PRD outcomes and complete acceptance clauses
├── package.json                    # pinned packageManager and scripts/dependencies
├── pnpm-workspace.yaml             # explicit dependency lifecycle-script policy
├── scripts/                         # translation utility for static locale JSON; not used at runtime
├── app.config.ts                   # project-logo metadata
├── public/
│   ├── icons/brand-mark.svg          # custom site/PWA and project mark
│   ├── manifest.webmanifest         # install metadata
│   ├── manus-routes.json           # source-derived page route manifest
│   └── sw.js                        # app-shell and static-asset caching only
├── src/
│   ├── main.tsx                     # React entry
│   ├── app/                         # router, app shell, route guards
│   ├── components/                  # reusable navigation, status, forms, chart, accessibility controls
│   ├── i18n/                        # English source messages, 12 locale catalogs and persisted provider
│   ├── pages/                       # public, farmer and sample expert/admin routes
│   ├── data/                        # clearly labelled static illustration fixtures
│   ├── lib/                         # schemas, date/format and client API helpers
│   └── styles.css                   # tokens, layout, responsive and accessible states
├── server/
│   ├── index.ts                     # Express/Vite runtime and static serving
│   ├── routes/                      # auth, farms/fields, scans, alerts and history APIs
│   ├── auth/                        # OAuth state, identity/session validation and roles
│   └── db/                          # MySQL connection, schema and additive migrations
└── dist/                            # generated production client output
```

## Design direction

- **Design movement:** contemporary Indian agricultural editorial, blending a field journal's grounded warmth with the clarity of a modern climate-intelligence instrument.
- **Core principles:** (1) lead with the next useful action; (2) make uncertainty visible without alarm; (3) keep farmer language plain and supportive; (4) show evidence and freshness near every risk claim.
- **Color philosophy:** warm paper/off-white surfaces feel approachable in bright outdoor use; deep forest green signals dependable stewardship; a distinctive canopy emerald marks the brand; turmeric/amber communicates attention without implying emergency; reserve red for validated urgent warnings, which the prototype will not issue.
- **Layout paradigm:** asymmetrical, field-notebook composition: a generous editorial landing hero with a compact evidence panel; inside the app, a calm persistent desktop rail and single-column mobile reading flow with bottom navigation. Use deliberate editorial bands and staggered callouts rather than a centered uniform card grid.
- **Signature elements:** fine topographic field contours around section transitions; a sprout enclosed in a protective shield as the brand mark; risk timelines rendered as a softly bounded uncertainty band with labeled illustrative status.
- **Interaction philosophy:** direct, forgiving, low-bandwidth interactions; large camera/upload targets; plain-language confirmations; never make color the only risk cue; preserve form progress locally until a save succeeds; explain why a field needs follow-up.
- **Animation:** brief opacity/position entrance for page-level content, restrained 160–220 ms state transitions, and a gentle chart-line reveal. Respect `prefers-reduced-motion`; no looping attention effects or urgency pulses.
- **Typography:** Manrope for display headings and Inter for body, controls and data labels. Use high-contrast, readable body sizes, short line lengths, clear heading hierarchy and tabular numerals for chart values.
- **Brand essence:** “A practical early-warning companion that helps Indian growers inspect sooner and act more safely.” Personality: grounded, clear, watchful.
- **Brand voice:** calm, specific and non-prescriptive; headlines promise clarity rather than certainty. Examples: “Know what to check before the weather turns.” “This is an example outlook—not a field-ready forecast.”
- **Wordmark & logo:** a custom shield outline formed from two furrow/leaf strokes with a small central sprout; pair with a carefully spaced AgriShield AI wordmark, not a stock icon or default typed logo alone.
- **Signature brand color:** Canopy Emerald `#1F6B4A`.

## Complete build workflow

1. Finalize this plan and its explicit safety boundaries with the user.
2. Prepare the project todo from the PRD's concrete product clauses, register TypeScript diagnostics, and prepare the custom hero image/logo assets before application code.
3. Implement the responsive public experience and reusable application shell, then the farmer field/scan/result/risk/advisory/alerts/history flows and the read-only sample expert/admin views.
4. Add OAuth/session and row-scoped database persistence for the supported farmer records; keep AI, weather, SMS/WhatsApp and phone OTP clearly marked as integrations not configured.
5. Add route manifest, installable-shell metadata and accessibility/mobile behavior; run source checks and confirm the configured Preview listener and route manifest.
6. Deliver the Preview URL and disclose any unconfigured production integrations. Do not publish the site unless separately requested.
