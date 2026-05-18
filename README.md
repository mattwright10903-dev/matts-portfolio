# Matt Wright Portfolio

Full-stack portfolio website for Matt Wright with an in-house admin dashboard and website chat system.

## Features

- Home page
- Portfolio page
- About page
- Contact page
- Discord and email contact buttons
- Private `/admin` login
- Admin dashboard website editor
- Page text editing
- Project add/edit/delete
- Multi-image project galleries
- Project image upload from admin dashboard
- In-house website chat system
- Admin live chat inbox
- PostgreSQL database
- Render Web Service deployment

## In-House Website Chat

The contact page now uses a built-in website chat flow.

Visitors can:

- Start a project chat from `/contact`
- Send follow-up messages on the same browser
- See replies from Matt directly on the website

Admin can:

- Open `/admin`
- View live chat threads
- Reply directly from the dashboard
- Close chats when finished

No Google login, Discord bot, external chat app, or email setup is required for the live chat system. Everything is stored in PostgreSQL.

## Custom Domain Setup

Primary domain:

```txt
https://mattwright.online
```

Set this in Render under **Environment**:

```txt
BASE_URL=https://mattwright.online
```

These links will work once the domain is connected:

```txt
https://mattwright.online/
https://mattwright.online/portfolio
https://mattwright.online/about
https://mattwright.online/contact
https://mattwright.online/admin
```

In Render, add these custom domains to the same Web Service:

```txt
mattwright.online
www.mattwright.online
```

Then update your DNS with the records Render gives you.

## Render Setup

Deploy as a **Web Service**, not a Static Site.

Build Command:

```bash
npm install --registry=https://registry.npmjs.org --no-audit --no-fund && npm run build
```

Start Command:

```bash
npm run start
```

## Required Environment Variables

Set these in Render under **Environment**:

```txt
DATABASE_URL=your_render_postgres_internal_database_url
BASE_URL=https://mattwright.online
SESSION_SECRET=change-this-to-a-long-random-secret
ADMIN_EMAIL=mattwright10903@gmail.com
ADMIN_PASSWORD=change-this-password
```

## Admin Login

Go to:

```txt
/admin
```

Login with the email/password set in Render.

## Project Images

The admin dashboard supports multiple images per project.

- Go to `/admin`
- Open **Add New Project**
- Click **Add another image** to add more file pickers
- Upload one image per picker
- Or paste image URLs, one URL per line
- Existing projects can also be updated with more images

Uploaded images are converted into image data and stored in PostgreSQL, so they do not rely on Render's temporary file system.

Recommended image size:

```txt
1200x800 or 1600x1000
```

## Updating the site

After replacing files locally:

```bash
git add .
git commit -m "Add in-house live chat system"
git push
```

Render should auto-deploy, or use **Manual Deploy → Deploy latest commit**.

---

## Security & Logging

### Required environment variables

Set these in Render under **Environment**:

```txt
ADMIN_ALLOWED_IPS=your.home.ip.here
ADMIN_LOG_WEBHOOK_URL=https://discord.com/api/webhooks/...
SITE_LOG_WEBHOOK_URL=https://discord.com/api/webhooks/...
STATUS_LOG_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

- `ADMIN_ALLOWED_IPS` — comma-separated list of IPs allowed to access `/admin`. Leave unset to disable IP restriction.
- `ADMIN_LOG_WEBHOOK_URL` — Discord webhook for admin access, login, and project change events.
- `SITE_LOG_WEBHOOK_URL` — Discord webhook for public page visits and contact button clicks.
- `STATUS_LOG_WEBHOOK_URL` — Discord webhook for server startup, health checks, and errors.

> **Important:** If any of these webhook URLs were ever committed to git or shown in code, regenerate them immediately in your Discord server settings.

---

## Status Monitoring

### Health check endpoint

```txt
GET https://mattwright.online/health
```

Returns JSON with server status, uptime, memory usage, Node version, and request count. Fast — no database query.

### Status ping endpoint

```txt
GET https://mattwright.online/status-ping
GET https://mattwright.online/status-ping?log=true
```

Same as `/health`. Adding `?log=true` sends a Discord embed to `STATUS_LOG_WEBHOOK_URL` (rate-limited to once per 5 minutes).

### What gets logged to Discord

| Event | Webhook | Cooldown |
|---|---|---|
| Server starts / Render redeploys | STATUS_LOG_WEBHOOK_URL | None |
| `/status-ping?log=true` called | STATUS_LOG_WEBHOOK_URL | 5 minutes |
| Express server error (500) | STATUS_LOG_WEBHOOK_URL | 60 seconds per route+error |
| Admin login success / failure | ADMIN_LOG_WEBHOOK_URL | Bypassed |
| Admin page blocked by IP | ADMIN_LOG_WEBHOOK_URL | 60 seconds |
| Admin project created/edited/deleted | ADMIN_LOG_WEBHOOK_URL | Bypassed |
| Public page visit | SITE_LOG_WEBHOOK_URL | 60 seconds per IP+event |
| Discord / Email / Fiverr CTA click | SITE_LOG_WEBHOOK_URL | 60 seconds per IP+event |

### Offline alerts — why the app cannot alert itself

If Render goes fully offline, the Node process stops and cannot send any webhook. This is a fundamental limitation of in-process monitoring.

To receive offline alerts, use an **external monitor** that calls `/health` from outside the app and sends its own Discord message if it gets no response.

**Recommended options:**

| Option | Free tier |
|---|---|
| [UptimeRobot](https://uptimerobot.com) | Yes — 5-minute checks |
| [Better Stack](https://betterstack.com) | Yes — 3-minute checks |
| GitHub Actions (included below) | Yes — 5-minute checks |

### GitHub Actions uptime monitor (optional)

A workflow is included at `.github/workflows/uptime-monitor.yml`.

It runs every 5 minutes, pings `/health`, and sends a Discord alert if the response is not HTTP 200.

**Setup:**

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Add a secret called `STATUS_LOG_WEBHOOK_URL` with your Discord webhook URL
3. Push the workflow file — it activates automatically

> The workflow only sends alerts when the site is **down**. It does not send a "back online" message because the app itself handles that via `logStartup()` on Render redeploy.
