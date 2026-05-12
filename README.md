# Matt Wright Portfolio

Full-stack portfolio website for Matt Wright with:

- Public home page
- Public portfolio page
- Public about page
- Contact page with Discord button, email button, and project form
- Private `/admin` login
- Admin dashboard
- Website text editor
- Add, edit, delete portfolio projects
- View and close messages
- PostgreSQL database
- Render Web Service deployment

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
EMAIL_PASS=your-app-password
EMAIL_TO=mattwright10903@gmail.com
```

The public contact page also includes:

```txt
Discord username: mjww0
Discord user ID: 1128708778343280713
Email button: mattwright10903@gmail.com
```

If email variables are missing, contact messages still save to the admin dashboard database.

## Admin Login

Go to:

```txt
/admin
```

Login with the email/password you set in Render:

```txt
ADMIN_EMAIL
ADMIN_PASSWORD
```

## Updating the site

After replacing files locally:

```bash
git add .
git commit -m "Add admin website editor"
git push
```

Then Render should auto-deploy, or use **Manual Deploy → Deploy latest commit**.
