import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import connectPgSimple from 'connect-pg-simple';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, pool, query } from './lib/db.js';
import { sendMessageEmail } from './lib/mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PgSession = connectPgSimple(session);

const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'mattwright10903@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || 'development-secret-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

function locals(req, extra = {}) {
  return {
    user: null,
    isAdmin: Boolean(req.session?.isAdmin),
    adminEmail: ADMIN_EMAIL,
    page: '',
    ...extra,
  };
}

function requireAdmin(req, res, next) {
  if (!req.session?.isAdmin) {
    return res.redirect('/admin');
  }
  next();
}

app.get('/', async (req, res) => {
  const projects = await query('SELECT * FROM projects WHERE featured = true ORDER BY created_at DESC LIMIT 6');
  res.render('home', locals(req, { page: 'home', projects: projects.rows }));
});

app.get('/portfolio', async (req, res) => {
  const projects = await query('SELECT * FROM projects ORDER BY created_at DESC');
  res.render('portfolio', locals(req, { page: 'portfolio', projects: projects.rows }));
});

app.get('/about', (req, res) => res.render('about', locals(req, { page: 'about' })));
app.get('/contact', (req, res) => res.render('contact', locals(req, { page: 'contact', sent: false })));

app.post('/contact', async (req, res) => {
  const name = req.body.name || 'Website Visitor';
  const email = req.body.email || '';
  const subject = req.body.subject || 'New website message';
  const body = req.body.body || '';
  if (!email || !body) {
    return res.render('contact', locals(req, { page: 'contact', sent: false, error: 'Email and message are required.' }));
  }

  await query('INSERT INTO messages (user_id, name, email, subject, body) VALUES ($1, $2, $3, $4, $5)', [null, name, email, subject, body]);
  await sendMessageEmail({ name, email, subject, body });
  res.render('contact', locals(req, { page: 'contact', sent: true }));
});

app.get('/login', (_req, res) => res.redirect('/admin'));
app.get('/account', (_req, res) => res.redirect('/contact'));

app.get('/admin', async (req, res) => {
  if (!req.session?.isAdmin) {
    return res.render('admin-login', locals(req, { page: 'admin', error: null }));
  }

  const projects = await query('SELECT * FROM projects ORDER BY created_at DESC');
  const messages = await query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 50');
  res.render('admin', locals(req, { page: 'admin', projects: projects.rows, messages: messages.rows }));
});

app.post('/admin/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!ADMIN_PASSWORD) {
    return res.status(500).render('admin-login', locals(req, {
      page: 'admin',
      error: 'ADMIN_PASSWORD is not set in Render environment variables.',
    }));
  }

  if (email === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    req.session.adminEmail = ADMIN_EMAIL;
    return res.redirect('/admin');
  }

  return res.status(401).render('admin-login', locals(req, { page: 'admin', error: 'Invalid admin email or password.' }));
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin'));
});

app.post('/admin/projects', requireAdmin, async (req, res) => {
  const { title, category, description, image_url, project_url, featured } = req.body;
  await query('INSERT INTO projects (title, category, description, image_url, project_url, featured) VALUES ($1, $2, $3, $4, $5, $6)', [
    title,
    category || 'Design',
    description,
    image_url,
    project_url || '',
    featured === 'on',
  ]);
  res.redirect('/admin');
});

app.post('/admin/projects/:id/delete', requireAdmin, async (req, res) => {
  await query('DELETE FROM projects WHERE id = $1', [req.params.id]);
  res.redirect('/admin');
});

app.post('/admin/messages/:id/close', requireAdmin, async (req, res) => {
  await query("UPDATE messages SET status = 'closed' WHERE id = $1", [req.params.id]);
  res.redirect('/admin');
});

app.use((req, res) => res.status(404).render('error', locals(req, { message: 'Page not found.' })));

initDb()
  .then(() => app.listen(PORT, () => console.log(`Matt Wright Portfolio running on port ${PORT}`)))
  .catch((error) => {
    console.error('Failed to start app:', error);
    process.exit(1);
  });
