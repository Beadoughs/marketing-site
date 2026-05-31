# Raquel Cuevas Marketing

Premium marketing agency website for Tasmanian businesses. Built with plain HTML, CSS, and JavaScript. Contact form submissions are sent via [Resend](https://resend.com) through a Vercel serverless API.

## Sections

1. Hero with dynamic video background
2. Trusted brands marquee
3. Founder story
4. The Modern Customer
5. Services
6. How We Grow Businesses (interactive funnel)
7. Tasmanian Advantage (local knowledge + map)
8. Client Results
9. Enquiry form
10. FAQ

## Contact form — requirements

The form **does not work on static-only hosting** (GitHub Pages, `python -m http.server`, opening `index.html` from disk). It requires:

1. **Deploy on [Vercel](https://vercel.com)** (or another host that runs the `/api` serverless function).
2. **Environment variables** on that project (see below).
3. **Verified domain in Resend** for production sending to `team@rcmarketingtas.com`.

If the API is missing (404) or `RESEND_API_KEY` is unset (503), visitors see an error and should use **team@rcmarketingtas.com** directly.

### Why GitHub Pages fails

GitHub Pages serves static files only. There is no `/api/send-enquiry` endpoint, so the browser gets **404** and the form cannot send mail. Use Vercel (recommended) or add a separate form backend.

## Run locally

Static files only (form submissions will **not** work):

```bash
python3 -m http.server 8080
# Visit http://localhost:8080 — POST to /api/send-enquiry will 404
```

To test the contact form locally:

```bash
cp .env.example .env.local
# Add RESEND_API_KEY (and optionally RESEND_FROM) to .env.local

npm install
npx vercel dev
# Visit the URL shown (usually http://localhost:3000)
```

Submit the form and check the browser console on localhost for detailed API errors.

### Quick API test (with `vercel dev` running)

```bash
curl -sS -X POST http://localhost:3000/api/send-enquiry \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"you@example.com","business":"Test Co"}'
```

## Contact form (Resend)

Enquiries are delivered to **team@rcmarketingtas.com** via `api/send-enquiry` on Vercel.

### Setup

1. Create a [Resend](https://resend.com) account and create an API key.
2. **Verify `rcmarketingtas.com`** in Resend → Domains.
3. Copy `.env.example` to `.env.local` and set:
   - `RESEND_API_KEY` — from the Resend dashboard
   - `RESEND_FROM` — sender from your verified domain, e.g. `RC Marketing <noreply@rcmarketingtas.com>`
4. **Do not rely on `onboarding@resend.dev` in production.** That sandbox sender only delivers to the Resend account owner’s email, not to `team@rcmarketingtas.com`.
5. Deploy to Vercel:
   - Import the GitHub repo at [vercel.com/new](https://vercel.com/new)
   - Framework preset: **Other** (static site + serverless `api/`)
   - Add environment variables in **Project → Settings → Environment Variables** for **Production** (and Preview if you test PRs):
     - `RESEND_API_KEY`
     - `RESEND_FROM` = `RC Marketing <noreply@rcmarketingtas.com>` (or similar, verified domain)
   - Redeploy after adding variables
6. Point your domain (e.g. `rcmarketingtas.com`) to Vercel in **Project → Settings → Domains**.

The Resend API key stays server-side only and is never exposed in the browser.

### Optional: custom API URL

If you ever proxy the API elsewhere, set in `index.html`:

```html
<meta name="contact-api" content="https://your-api.example.com/send-enquiry" />
```

## Customize

- **Hero video** — Replace the Pexels source in `index.html` with your own Tasmania footage
- **Founder photo** — Update `assets/raquel-cuevas.png`
- **Case studies** — Update with real client names and metrics (with permission)

## Structure

```
marketing-site/
├── api/
│   └── send-enquiry.js   # Vercel serverless → Resend
├── assets/
├── css/styles.css
├── js/main.js
├── index.html
├── package.json
├── vercel.json
└── .env.example
```
