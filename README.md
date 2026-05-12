# Matt Wright Portfolio

Full-stack portfolio website for Matt Wright with:

- Home page
- Portfolio page
- About Me page
- Contact/message form
- Admin login at `/admin`
- Add/delete portfolio projects from the admin dashboard
- Messages saved to PostgreSQL
- Messages emailed to the master email address

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Render setup

Deploy as a **Web Service**, not a Static Site.

Build command:

```bash
npm install --registry=https://registry.npmjs.org --no-audit --no-fund && npm run build
```

Start command:

```bash
npm run start
```

## Required Render environment variables

```txt
DATABASE_URL=your_render_postgres_internal_database_url
SESSION_SECRET=make-this-a-long-random-secret
ADMIN_EMAIL=mattwright10903@gmail.com
ADMIN_PASSWORD=your-admin-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mattwright10903@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_TO=mattwright10903@gmail.com
```

## Admin login

Go to:

```txt
https://your-render-site.onrender.com/admin
```

Then log in using the email/password stored in Render:

```txt
ADMIN_EMAIL
ADMIN_PASSWORD
```

There is no public Google login button anymore.

## Push updates to GitHub

```bash
git add .
git commit -m "Update admin login system"
git push
```
