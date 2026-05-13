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

## Animation / visual polish update

This version adds a full visual motion pass using a lightweight local `/animations.js` file and Anime.js from CDN for extra page-load text animation. The site still runs on the same Render Node setup and does not require React.

Added polish:
- Scroll progress bar
- Frosted/shrinking nav on scroll
- Soft cursor glow and ambient grid
- Scroll reveal animations
- Magnetic button hover movement
- Subtle card tilt / spotlight hover
- Project image parallax hover
- Cleaner contact/service card motion

If the Anime.js CDN is blocked, the site still works and falls back to CSS/vanilla JavaScript animations.
