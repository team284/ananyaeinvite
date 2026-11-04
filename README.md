# Ananya & Kabir · Website e-invite

A wedding invite that works as a website and as an installable phone app. Guests can add it to their home screen and open it offline. No build step, no server code: it is plain HTML, CSS and JavaScript.

## What's in the folder

| Path | What it is |
|---|---|
| `index.html` | The page. Also holds the link-preview tags for WhatsApp. |
| `js/config.js` | **All couple details: the only file you edit for a new couple.** |
| `js/app.js` | The animations and interactions. You don't need to touch it. |
| `css/style.css` | The design and palette. |
| `fonts/` | Self-hosted fonts, so the invite looks right on every phone and offline. |
| `icons/`, `manifest.webmanifest` | Home-screen app icon and app settings. |
| `sw.js` | Offline cache. |
| `og-image.jpg` | The 1200×630 preview image shown when the link is shared. |
| `photos/` | Put the couple's photos here. |

## Make it for a new couple

1. Open `js/config.js` and change the names, parents, dates, venue, story, events, dress codes, travel notes and WhatsApp number. Times are in IST.
2. Put photos in `photos/` and point to them in `config.js`, for example `src:"photos/first-trip.jpg"`. Tall portrait photos (3:4) look best in the jharokha windows. Keep each photo under about 400 KB.
3. Change the names in `index.html` (`<title>` and the `og:` tags) and in `manifest.webmanifest`.
4. Replace `og-image.jpg` with a new 1200×630 image if you want a custom preview.
5. In `sw.js`, change `VERSION` (for example `invite-v2`) every time you edit any file, so guests' phones pick up the change.

## Put it online

Any static host works. Upload the **contents** of this folder, so that `index.html` sits at the top level.

- **Netlify (easiest):** go to app.netlify.com/drop and drag this folder in. You get a link right away, and you can connect a domain such as `ananya-kabir.socialshosha.com`.
- **Vercel:** create a new project, import or upload this folder, and leave the framework as "Other".
- **cPanel / Hostinger:** upload everything into `public_html` (or a subfolder such as `public_html/ananya-kabir`).
- **GitHub Pages:** push the folder to a repository and turn on Pages.

The site must be served over **https** for the app install and offline mode to work. All of the hosts above do this automatically.

After deploying, open `index.html` and replace both `https://YOUR-DOMAIN` placeholders with the real address. Without this, WhatsApp can't show the preview image. To check the preview, paste the link into the Facebook Sharing Debugger at developers.facebook.com/tools/debug.

## Personalised guest links

Add the family's name to the end of the link:

```
https://ananya-kabir.socialshosha.com/#the-sharma-family
```

The envelope is then addressed to "The Sharma Family" and their RSVP name is filled in. Use hyphens between words.

## How guests install it

- **Android (Chrome):** a "Save invite to your phone" button appears near the end of the invite. Chrome may also offer "Install app" on its own.
- **iPhone (Safari):** tap Share, then "Add to Home Screen". The invite shows this tip on iPhones.

## RSVPs

RSVPs open WhatsApp with the reply already written, addressed to the number in `config.js`. Nothing is stored on a server.

## Fonts

Pinyon Script, Cinzel, Cormorant Garamond and Tiro Devanagari Hindi, all under the SIL Open Font License (free for commercial use).
