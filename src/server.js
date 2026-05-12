import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
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
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'mattwright10903@gmail.com';

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

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0] || null);
  } catch (error) {
    done(error);
  }
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || `${BASE_URL}/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const name = profile.displayName || 'Google User';
          const avatar = profile.photos?.[0]?.value || '';
          if (!email) return done(new Error('Google account did not return an email address.'));

          const existing = await query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [profile.id, email]);
          if (existing.rows.length) {
            const updated = await query(
              'UPDATE users SET google_id = $1, name = $2, avatar = $3 WHERE id = $4 RETURNING *',
              [profile.id, name, avatar, existing.rows[0].id]
            );
            return done(null, updated.rows[0]);
          }

          const created = await query(
            'INSERT INTO users (google_id, email, name, avatar) VALUES ($1, $2, $3, $4) RETURNING *',
            [profile.id, email, name, avatar]
          );
          return done(null, created.rows[0]);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

function locals(req, extra = {}) {
  return {
    user: req.user || null,
    isAdmin: req.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    adminEmail: ADMIN_EMAIL,
    page: '',
    ...extra,
  };
}

function requireLogin(req, res, next) {
  if (!req.user) return res.redirect('/login');
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.redirect('/login');
  if (req.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return res.status(403).render('error', locals(req, { message: 'You do not have admin access.' }));
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
  const name = req.body.name || req.user?.name || 'Website Visitor';
  const email = req.body.email || req.user?.email || '';
  const subject = req.body.subject || 'New website message';
  const body = req.body.body || '';
  if (!email || !body) return res.render('contact', locals(req, { page: 'contact', sent: false, error: 'Email and message are required.' }));

  await query('INSERT INTO messages (user_id, name, email, subject, body) VALUES ($1, $2, $3, $4, $5)', [req.user?.id || null, name, email, subject, body]);
  await sendMessageEmail({ name, email, subject, body });
  res.render('contact', locals(req, { page: 'contact', sent: true }));
});

app.get('/login', (req, res) => res.render('login', locals(req, { page: 'login', googleReady: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) })));
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => res.redirect('/account'));
app.post('/logout', (req, res) => req.logout(() => res.redirect('/')));

app.get('/account', requireLogin, async (req, res) => {
  const messages = await query('SELECT * FROM messages WHERE email = $1 ORDER BY created_at DESC', [req.user.email]);
  res.render('account', locals(req, { page: 'account', messages: messages.rows, sent: false }));
});

app.post('/account/message', requireLogin, async (req, res) => {
  const subject = req.body.subject || 'Account message';
  const body = req.body.body || '';
  if (body) {
    await query('INSERT INTO messages (user_id, name, email, subject, body) VALUES ($1, $2, $3, $4, $5)', [req.user.id, req.user.name, req.user.email, subject, body]);
    await sendMessageEmail({ name: req.user.name, email: req.user.email, subject, body });
  }
  res.redirect('/account');
});

app.get('/admin', requireAdmin, async (req, res) => {
  const projects = await query('SELECT * FROM projects ORDER BY created_at DESC');
  const messages = await query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 50');
  res.render('admin', locals(req, { page: 'admin', projects: projects.rows, messages: messages.rows }));
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
