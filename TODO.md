# AgriShield AI — TODO

No native project todo tool was available, so this file records the grouped deliverables and their acceptance criteria. Status notes below distinguish completed prototype behavior from still-open product/integration outcomes.

## 1. Public website, identity, onboarding and field profiles — Partial

**Status:** Public pages, real Manus sign-in initiation, farmer sessions, multiple farm/field profiles, optional manual region entry and owner-scoped APIs are implemented. A real OAuth callback has not been completed in this run. Agronomist/administrator role assignment and role-specific authorization are not available; those routes are read-only samples. The original English-first language plan is superseded by Outcome 7 below; generated regional translations still need native-speaker review.

- The website should have a simple public landing page and an authenticated farmer dashboard.
- Public navigation includes Home, How it works, Crops supported and About.
- Provide login/sign-up using the approved Manus account sign-in; phone-based OTP is not connected unless a suitable provider is configured. Do not simulate a logged-in Preview user or weaken server-side session validation.
- Support farmer, agronomist and administrator roles; new sign-ins default to farmer. In this prototype the expert/admin samples are read-only and cannot alter real roles, thresholds or recommendations.
- A farmer can register/create a field and reach the dashboard without configuring technical parameters.
- Allow multiple farms and fields per farmer. A field stores crop type, crop stage, planting date, location and optional variety.
- GPS is optional if manual location selection is available. Ask explicit consent before using location data; do not request location permission automatically.
- Use short, nontechnical copy; keep dates, units and message labels translation-ready. Regional-language support is expanded in Outcome 7 below; its prototype translations remain pending native review.

## 2. Farmer dashboard, crop image intake and diagnosis experience — Delivered within approved prototype scope

**Status:** Dashboard examples and browser-only image intake are implemented; review requests store only field/image-count metadata. The explicit inconclusive result avoids fabricating a diagnosis. No live image-analysis model is connected.

- The dashboard prioritizes the next action rather than overwhelming farmers with technical data. It shows field status, current risk summaries, weather context and priority alerts, with visible update/source information.
- Use the PRD's dashboard as an illustrative example only: Potato Plot A; risk values Now 24%, +12 h 31%, +24 h 48%, +36 h 65%, +48 h 58%, +72 h 39%; illustrative humidity 88%, temperature 18–22°C and possible rain. Label each value as mock/illustrative and never as live prediction or a measured probability.
- Show the example next step: “Inspect the field and capture fresh images of any suspected lesions. Review the disease-specific advisory before considering treatment.” Show the disclaimer that illustrative guidance is not recommending pesticide application.
- Support JPEG, PNG and WebP images; allow mobile camera capture and desktop file upload; allow multiple images per diagnostic case; show progress and retry affordances and validate file type/size/dimensions before accepting input.
- Poor-quality, obstructed, irrelevant, out-of-scope or unverified image cases request a retake or expert review rather than a confident diagnosis. Because no validated model is configured, the prototype must explicitly say image analysis is unavailable; it must not fabricate a disease label or calibrated confidence. Keep uploaded image bytes local/in-memory; do not retain them in the database or long-term storage.
- A diagnosis/result view explains crop, likely disease/pest only when validated evidence exists, alternatives, confidence/calibration category, image quality and whether expert review is required. In the prototype, unavailable evidence yields an explicit inconclusive/needs-review state with confidence/risk unset.

## 3. Weather context, disease risk forecast and safe advisory — Delivered within approved prototype scope

**Status:** The now/+12/+24/+36/+48/+72 example series, uncertainty display, explicit unavailable-data/provenance disclosures, separate risk dimensions and non-chemical scouting advisory are implemented. No live weather or calibrated disease-risk model is connected.

- Risk displays distinguish environmental favorability, current diagnostic evidence and estimated future spread risk.
- The risk forecast includes a time series for now/+12/+24/+36/+48/+72 hours and uncertainty where available, plus temperature, humidity and rainfall trends. State that all prototype plot values are synthetic and illustrative; label risk as an estimated model output rather than a measured or calibrated probability.
- Display weather source, data freshness, forecast horizon and missing variables. This prototype has no live weather provider; mark the sample source as illustrative, mark data as unavailable/not live, and suppress claims that require missing or stale data.
- Keep crop–disease logic separate. Pilot workflows named in the PRD are Potato—Late blight, Rice—Blast and Cotton—Pink bollworm monitoring. Do not imply that these are validated/live: pink bollworm is a pest and requires a distinct pest-development/scouting engine, not a generic fungal model.
- Every advisory includes current diagnosis/confidence status, current risk level and expected window when available, reasons, immediate action, chemical-intervention state, timing considerations, non-chemical options, reassessment timing, safety guidance and source/provenance. When data/model/guidance is unavailable, say so and suppress unsupported claims.
- Never recommend a pesticide solely because humidity is high. Chemical intervention requires disease-specific evidence and approved crop/region guidance; treatment timing also depends on label restrictions, rain/rainfastness, wind/drift, PPE, pre-harvest and re-entry intervals as applicable. This prototype does not issue chemical instructions.
- For uncertain evidence, recommend scouting, additional images, reassessment or expert review—not an automatic spray. Keep monitoring and non-chemical actions visible.

## 4. Alerts, history, observations and feedback — Partial

**Status:** Owner-scoped case and farmer-observation records, farmer-vs-expert label separation, local alert preferences/quiet hours, a corrected/withdrawn sample-alert state and local-memory-only expert feedback flags are implemented. Live alert generation, duplicate suppression, persistent alert history and SMS/WhatsApp delivery are not connected.

- Provide in-app alerts for newly elevated field risk in the demonstration interface, avoid repeated notifications for the same risk event, and allow notification preferences/quiet hours.
- If a risk sample changes or is withdrawn, represent a correction/cancellation state rather than presenting stale sample data as certain.
- SMS and WhatsApp alerts are later integrations and must not be represented as delivered.
- Store diagnostic case summaries and generated advisory state with field, model/version and weather snapshot/provenance references when available; do not persist uploaded images in this prototype.
- Let farmers record observed symptoms, timestamp, action taken and whether symptoms improved. Keep farmer-reported outcomes distinct from expert-verified labels.
- Track previous scans and alerts in Field History; distinguish sample/demonstration records from the current farmer's saved records.
- Allow an expert preview to flag false alarms or missed outbreaks only as non-persisted sample interactions; do not claim that a real agronomist reviewed a case.

## 5. Expert/admin preview, safety, privacy and accessibility — Partial

**Status:** Read-only illustrative expert/admin screens show evidence notes, unavailable model/version and alert-history states, false-alarm/missed-outbreak examples and proposed KPI targets. Actual role assignment, model/rule controls, and a formal WCAG 2.2 AA audit remain open. Outcome 7 adds regional language choice and read-aloud to the primary farmer flow.

- Provide visible expert/admin preview surfaces showing sample low-confidence cases, notes, model/version and alert history/false-positive examples. They are read-only illustrative previews: do not claim they are connected to real cases, and do not persist edits to labels, model versions, thresholds or approved advisory rules.
- Product information describes the initial crop/disease set narrowly; do not claim diagnosis of all crops/pathogens or proven model performance.
- Proposed MVP KPIs are targets to validate, not existing claims: 3–5 validated combinations; image diagnostic macro-F1 ≥0.85 on representative test data; disease-risk calibration tracked with Brier score and reliability plots; forecast availability ≥95% when external services work; median advisory ≤10 seconds excluding slow external services; high-risk alert precision ≥80% subject to pilot sample size; farmer task completion ≥85%; unnecessary spray recommendations measured/minimized through expert-reviewed pilot audits.
- Target WCAG 2.2 AA. Use large tap targets, clear icons and text labels as well as color for risk, visible focus, keyboard-friendly controls, sufficient contrast and reduced-motion behavior.
- Mobile navigation provides Home, Scan, Fields, Alerts and Profile. Layout remains usable on narrow smartphone screens and low-cost devices.
- Protect sensitive field/location data, restrict records to their owning authenticated user, collect only required data, provide location consent, do not store unnecessary image metadata, and make the no-live-service/demo status clear.

## 6. Technical shape and handoff — Complete for Preview handoff

**Status:** The managed MySQL migration, role-scoped API patterns, PWA shell, route manifest and functioning Preview are in place. The public URL is a preview, not a production launch.

- Keep frontend and backend serving through the configured Preview port 3000; in Cloud the listener binds `0.0.0.0:3000`. Use root-relative browser URLs.
- Use a typed structured response for diagnosis, forecast, advisory and provenance; preserve uncertainty fields and distinguish unavailable values from false/zero values.
- Use the managed database only for authenticated, user-scoped farmer records; avoid destructive migrations and arbitrary unscoped data access.
- Maintain `public/manus-routes.json` with every source-derived page route and verify that the route returns HTTP 200 JSON, not SPA fallback HTML.
- Provide a lightweight PWA manifest/app shell if supported; do not cache private farm data offline.
- Deliver a usable Preview, not a public launch. Live vision AI, weather API, SMS/WhatsApp, phone OTP and validated/regional chemical advisory remain unconfigured integration work.

## 7. Plain-language regional-language and listen-aloud access — Partial
**Status:** The public and primary farmer journey has an easy-view layout, a guided field wizard, 13 language choices, and browser read-aloud when a matching voice exists. Machine-generated translations remain unreviewed by native-speaking farmers and agronomists; secondary expert/admin and technical samples are explicitly disclosed as partly English.
- Provide a clear, self-selected and device-persisted interface language: English plus Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Urdu, Kannada, Malayalam, Punjabi, Odia and Assamese. Display language names in their own scripts; changing language must not change crop records or sign-in state.
- Localize the public entry/sign-in journey and the primary farmer workflow (dashboard, farm/field creation, image review request and safety/result messaging) into short plain-language sentences. Keep technical sample/expert/admin pages explicitly marked as English if they are not translated; do not claim complete translation of such pages.
- Add large, clearly labeled tap targets and a visible listen-aloud control for the current farmer screen using browser speech synthesis when a matching device voice is available; provide a clear stop action and a graceful message when speech is unavailable.
- Support Urdu right-to-left page direction and script-aware font fallbacks. A user must be able to change language without reading dense English-only setup instructions.
- Preserve prototype and safety meaning in every translation: no live AI diagnosis, no live weather forecast and no pesticide instruction is provided. Mark machine-generated translations as prototype text that needs review by native-speaking farmers and agronomists before production; do not present a translation as an independently validated agronomic instruction.
