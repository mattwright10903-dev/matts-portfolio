# Matt Wright Portfolio Website

Advanced portfolio website for Matt Wright.

## Features

- Home page
- Portfolio page with project images and descriptions
- About Me page
- Contact page
- Google login
- Account page
- Client message/live chat-style form
- Messages saved to PostgreSQL
- Messages emailed to `mattwright10903@gmail.com`
- Admin dashboard for the master account
- Add/delete portfolio projects
- Render-ready deployment

## Master Admin Account

The admin email is:

```txt
mattwright10903@gmail.com
```

Only this Google account can access `/admin`.

## Push to GitHub

After unzipping the folder, open Terminal inside the folder and run:

```bash
git init
git add .
git commit -m "Initial Matt Wright portfolio website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

## Render Setup

Create this as a **Web Service**, not a Static Site.

Render settings:

```txt
Build Command:
npm install --registry=https://registry.npmjs.org --no-audit --no-fund && npm run build

Start Command:
npm run start
```

You also need a Render PostgreSQL database and the `DATABASE_URL` environment variable.

## Environment Variables

Copy `.env.example` into Render environment variables.

Required:

```txt
NODE_ENV=production
BASE_URL=https://your-render-url-or-domain.com
SESSION_SECRET=random-long-secret
ADMIN_EMAIL=mattwright10903@gmail.com
DATABASE_URL=your-render-postgres-url
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-render-url-or-domain.com/auth/google/callback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=mattwright10903@gmail.com
SMTP_PASS=your-gmail-app-password
CONTACT_TO_EMAIL=mattwright10903@gmail.com
```

## Google Login Setup

In Google Cloud Console, create OAuth credentials.

Authorized redirect URI:

```txt
https://your-domain.com/auth/google/callback
```

For local testing:

```txt
http://localhost:3000/auth/google/callback
```

## Email Setup

For Gmail, use an App Password, not your normal Gmail password.

Set:

```txt
SMTP_USER=mattwright10903@gmail.com
SMTP_PASS=your-gmail-app-password
```

## Adding Projects

Login with Google using `mattwright10903@gmail.com`, then go to:

```txt
/admin
```

Add:

- Project title
- Category
- Image URL
- Project URL
- Description
- Whether it should be featured on the home page

For images, you can use:

```txt
/assets/project-1.svg
```

or an external hosted image URL.

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Then open:

```txt
http://localhost:3000
```
