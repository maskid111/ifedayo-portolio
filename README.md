# Adeyemo Muiz Ifedayo portfolio

A working, self-contained portfolio website for Adeyemo Muiz Ifedayo. The site keeps the original static WordPress/Elementor-style UI, animations, navigation, and local runtime while replacing the visible identity, bio, profile image, and social links.

## Run locally

Install Node.js 20 or newer. Open a terminal in this project folder and run:

```sh
npm start
```

Open http://localhost:4173. No npm installation or environment variables are required. Optional: set `PORT` to change the port. `npm run check` verifies all seven routes and local asset links.

## Routes

- `/` — homepage, selected projects, contact links
- `/about/` — biography and profile image
- `/projects/` — all six listed projects, case study modals, password prompts
- `/contact/` — validated contact form
- `/projects/ecommerce-saas-dashboard/` — complete public case study
- `/projects/decentralised-finance-web-mobile-app/` — public project preview and original coming-soon notice
- `/projects/dwtstore-improved-shopping-experience-on-web-mobile/` — public case study and original coming-soon notice

Project cards open modals; their View Project buttons open the standalone case study. Navigation, mobile drawer, modal close/Escape controls, focus handling, animated job title, hover effects, sticky navigation, back-to-top, and original entrance animations are retained. Image links open original full-resolution assets locally.

## Source organization

- `dist/` — ready-to-serve pages and shared local assets
- `src/app/interactions.js` — shared frontend controllers and accessibility behavior
- `src/app/services.js` — isolated backend-dependent methods
- `scripts/serve.mjs` — dependency-free local static server
- `scripts/recreate.py` — reference import/export utility
- `scripts/finalize.py` — deterministic local runtime and accessibility repairs
- `scripts/make-site-mine.mjs` — repeatable personalization pass for owner identity/content
- `scripts/check.mjs` — route and asset validation
- `verification/` — desktop/mobile comparison captures and recorded measurements

To rebuild from the live reference (only when intentionally refreshing content), install Python dependencies from `requirements.txt`, then run `python scripts/recreate.py` followed by `python scripts/finalize.py`. Re-importing overwrites generated pages and theme assets; edit the shared app source under `src/app/` and run finalize to apply changes.

## Backend limitations

The reference's email transport, WordPress likes database, protected project content, authentication, and reCAPTCHA cannot be recreated without access to their backend. No passwords or messages are sent to that server.

The contact service validates the form and saves a draft in this browser's local storage. Its response explicitly says email delivery is not connected. Likes toggle locally and persist in that browser. Password prompts preserve their frontend appearance and report the unavailable authentication service; undisclosed project content has not been invented. To connect real functionality, replace the three methods in `src/app/services.js` with your own API and run finalize. No credentials are needed for the current implementation.

Social links point to GitHub, X, Telegram, and email. Page images, fonts, styles, and frontend scripts are bundled locally.

## Verification and visual differences

All seven public routes were compared with the original at a 1363 × 926 browser viewport and 390 × 844 embedded mobile viewports (375 CSS content pixels after the scrollbar). Main heading fonts and positions matched; the largest recorded case-study heading vertical difference was about 0.32 pixels. The mobile comparisons preserve the reference's stacking and have no horizontal document overflow.

Browser checks covered navigation, mobile menu open/close, form required-field validation and local draft feedback, project modal open/close, password prompt feedback, and image destinations. Source and local asset checks pass. No site-origin console errors were observed; browser extension messages were excluded.

The original reCAPTCHA badge and analytics are intentionally absent. Loading timings differ because assets are served locally and image loading is repaired. Tiny font rasterization differences are possible. Four unused theme decoration assets return 404 on the reference; their unused CSS URLs were removed. This is not a WordPress administration/backend clone.
