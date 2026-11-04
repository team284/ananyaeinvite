# Ananya & Kabir website e-invite

Live site: https://whitesmoke-tarsier-224896.hostingersite.com/ (Hostinger, auto-deploys from `main` via Git webhook).
Pushing to `main` publishes to the live site. There is no build step: files at the repo root are served as-is from `public_html`.

- Couple details, dates, events, story, photos, WhatsApp number: `js/config.js`
- Interactions and animations: `js/app.js`; design and palette: `css/style.css`
- Palette (only these): burgundy #3a0b12, dusty rose #8c2a34, baby pink #ecbcb4, olive #5b6b2c, ivory #f6e3b4. Flame/fire colours are the only exception.
- After any change, bump `VERSION` in `sw.js` so installed copies refresh.
- Photos go in `photos/` and are referenced from `config.js`.
