# What changed in this version (11 Sep 2026)

## 1. Real-time data — nothing is hardcoded any more
* **Deleted `src/data/dockets.ts`** (the fake Zepto/flight/subscription “dockets”) and every screen that rendered mock carts, fake timers and fake prices.
* **New `/api/analyze`** (Vercel Function + Vite dev middleware) sends the uploaded screenshot to Gemini with a strict JSON schema and the 13-pattern rulebook. Findings, evidence, confidence, bounding boxes, platform guess and summary all come back live.
* **New `/api/grievance`** drafts the complaint from the real findings. If the model call fails, a template is filled from the *same real findings* and is clearly labelled “Template fallback”.
* **New `/api/health`** so the UI can show “Live · gemini-3.6-flash” or “API key missing”.
* Grievance form fields start **empty** (the old build pre-filled a fake name, phone and a `@india.gov.in` email).
* Share card is **drawn on a canvas from the real result** (the old download was simulated).
* “Recent scans” = an on-device cache of *real* results (localStorage), useful if the network is slow during a demo. Anything shown from cache is badged “From device cache”.
* Sample screenshots in `public/samples/` are **inputs only**; their results are still produced live each time.

## 2. Works on every device
* Phone: fixed header + bottom tabs, single column, 44px targets, 16px inputs (no iOS zoom), safe-area padding, landscape tweaks.
* Tablet: wider column, tab labels beside icons.
* Desktop (≥1024px): left **Sidebar** replaces header/tab bar; Scan, Analysis, Grievance and Share become two-pane layouts with the screenshot sticky on the left.
* Pins are positioned as percentages inside a wrapper that exactly matches the rendered image, so they stay on the right spot at any width.
* Removed `user-scalable=no`; added visible focus rings, `aria-*` on markers and tabs, `prefers-reduced-motion`, and system theme detection on first visit.

## 3. Accuracy and honesty
* Citations now read **“Guideline 4 read with Annexure 1, Item N”** (the old “Section 4(a)” / “Clause 4(1)(a)” did not exist).
* “CCPA” is spelled out as India’s Central Consumer Protection Authority to avoid confusion with California’s privacy law.
* Removed the false “Encrypted local client processing” claim; the UI now says the screenshot is sent securely to the server and not stored.
* Every finding shows the model’s confidence and the on-screen evidence. A “This finding looks wrong” control lets the user discount it.
* The complaint is gated behind “I have read this and it is accurate”; Snitch never submits anything.

## 4. Deploy checklist
1. `npm install`
2. Local: `cp .env.example .env`, paste your Gemini key, `npm run dev`.
3. Vercel: Settings → Environment Variables → `GEMINI_API_KEY` → redeploy.
4. Open `/api/health` and confirm `"configured": true`, then run a sample from the Scan tab.
