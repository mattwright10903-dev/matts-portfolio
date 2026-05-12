# Matt Wright Portfolio

Full-stack portfolio website for Matt Wright with:

- Public home page
- Public portfolio page
- Public about page
- Contact page with Discord and email buttons
- Private `/admin` login
- Admin dashboard website editor
- Page text editing
- Project add/edit/delete
- Project image upload from admin dashboard
- Client message inbox
- PostgreSQL database
- Render Web Service deployment

## Latest Update

This version rebuilds the layout to be cleaner and easier to manage:

- Smaller, cleaner text sizing
- Better page spacing
- Cleaner project showcase layout
- Better portfolio page structure
- Better contact page layout
- Admin dashboard split into clear sections
- Admin sidebar navigation
- Collapsible page text editor sections
- Direct image upload for portfolio projects
- Cleaner project editing forms

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
SESSION_SECRET=change-this-to-a-long-random-secret
ADMIN_EMAIL=mattwright10903@gmail.com
ADMIN_PASSWORD=change-this-password
```

Optional email settings for contact form email delivery:

```txt
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_TO=mattwright10903@gmail.com
```

If email variables are missing, contact messages still save to the admin dashboard database.

## Admin Login

Go to:

```txt
/admin
```

Login with the email/password set in Render.

## Project Images

In the admin dashboard, you can either:

1. Upload an image file directly, or
2. Paste an image URL.

Uploaded images are converted into image data and stored in PostgreSQL with the project, so they do not rely on Render's temporary file system.

Recommended image size:

```txt
1200x800 or 1600x1000
```

Use compressed JPG/PNG/WebP images when possible.

## Updating the site

After replacing files locally:

```bash
git add .
git commit -m "Improve portfolio layout and admin dashboard"
git push
```

Then Render should auto-deploy, or use **Manual Deploy → Deploy latest commit**.
