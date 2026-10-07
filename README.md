# Acadia Canine Academy: public static site

Fee-free public website for **acadiacanineacademy.com**.

Plain HTML + CSS (+ minimal JS for mobile nav and mailto contact form). No build step, no Node server, no Stripe, no auth, no client portal.

## Preview locally

From this folder:

```bash
cd ~/Desktop/aca/site
python3 -m http.server 8080
```

Then open: http://127.0.0.1:8080/

Any free port works (`python3 -m http.server 5500`, etc.). You can also open `index.html` directly in a browser; relative asset paths are used throughout.

## Pages

| File | Nav |
|------|-----|
| `index.html` | Home |
| `about.html` | About |
| `training.html` | Training |
| `store.html` | Store |
| `contact.html` | Contact |

Assets live in `assets/` (copied from `../airo-assets/`; originals untouched).

## Hosting

Point the domain (or GitHub Pages / Netlify / Cloudflare Pages / any static host) at **this folder** as the site root. Upload or push the contents of `site/`, not the parent `aca/` folder.

Recommended: set the document root so `index.html` is the homepage and paths like `/about.html` resolve.

## Notes for Ryan

- Contact form uses a private `mailto:` destination in JS/form action only. **Do not display any email address on the public pages**.
- Social: Facebook, Instagram, YouTube, X. See `../SOCIAL_LINKS.md`.
- Programs are **Coming Soon**; only public price shown is **$60 CAD/hour** consultation.
- Four Amazon.ca paperback links plus two "coming soon" books (The Sport Dog Playbook, Protection Training). No Apex Protocol.
