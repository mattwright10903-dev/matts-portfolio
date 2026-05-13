import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import connectPgSimple from 'connect-pg-simple';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { getContent, initDb, pool, query } from './lib/db.js';
import { sendMessageEmail } from './lib/mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.set('trust proxy', 1);
const PgSession = connectPgSimple(session);

const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'mattwright10903@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const BASE_URL = (process.env.BASE_URL || 'https://mattwright.online').replace(/\/$/, '');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 6 * 1024 * 1024, files: 10 } });

function splitImageUrls(value) {
  return String(value || '')
    .split(/\r?\n|,/g)
    .map((url) => url.trim())
    .filter(Boolean);
}

function uploadedImages(req) {
  return (req.files || [])
    .filter((file) => file && file.buffer)
    .map((file) => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
}

function arrayFromBody(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getProjectImages(req, fallbackImages = [], options = {}) {
  const keptImages = options.useKeepImages ? arrayFromBody(req.body.keep_images).map((url) => String(url || '').trim()).filter(Boolean) : [];
  const manualUrls = splitImageUrls(req.body.image_urls || req.body.image_url);
  const files = uploadedImages(req);
  const base = options.useKeepImages ? keptImages : fallbackImages.filter(Boolean);
  const images = [...base, ...manualUrls, ...files].filter(Boolean);
  const unique = [];
  for (const image of images) {
    if (!unique.includes(image)) unique.push(image);
  }
  return unique.length ? unique : ['/assets/project-1.svg'];
}

function normalizeProject(project) {
  const images = Array.isArray(project.project_images) && project.project_images.length
    ? project.project_images.filter(Boolean)
    : [project.image_url].filter(Boolean);
  return { ...project, images, image_url: images[0] || project.image_url || '/assets/project-1.svg' };
}

function normalizeProjects(rows) {
  return rows.map(normalizeProject);
}

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
      secure: process.env.NODE_ENV === 'production' ? 'auto' : false,
      sameSite: 'lax',
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
    baseUrl: BASE_URL,
    currentPath: req.originalUrl ? req.originalUrl.split('?')[0] : '/',
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
  const projects = await query('SELECT * FROM projects WHERE featured = true AND published = true ORDER BY sort_order ASC, created_at DESC LIMIT 6');
  const content = await getContent();
  res.render('home', locals(req, { page: 'home', projects: normalizeProjects(projects.rows), content }));
});

app.get('/portfolio', async (req, res) => {
  const projects = await query('SELECT * FROM projects WHERE published = true ORDER BY sort_order ASC, created_at DESC');
  const content = await getContent();
  res.render('portfolio', locals(req, { page: 'portfolio', projects: normalizeProjects(projects.rows), content }));
});

app.get('/portfolio/:id', async (req, res) => {
  const project = await query('SELECT * FROM projects WHERE id = $1 AND published = true', [req.params.id]);
  if (!project.rows.length) return res.status(404).render('error', locals(req, { message: 'Project not found.' }));
  const more = await query('SELECT * FROM projects WHERE published = true AND id <> $1 ORDER BY featured DESC, sort_order ASC, created_at DESC LIMIT 3', [req.params.id]);
  const content = await getContent();
  res.render('project-detail', locals(req, { page: 'portfolio', project: normalizeProject(project.rows[0]), moreProjects: normalizeProjects(more.rows), content }));
});

app.get('/about', async (req, res) => {
  const content = await getContent();
  res.render('about', locals(req, { page: 'about', content }));
});

app.get('/contact', async (req, res) => {
  const content = await getContent();
  res.render('contact', locals(req, { page: 'contact', sent: false, content }));
});

app.post('/contact', async (req, res) => {
  const name = req.body.name || 'Website Visitor';
  const email = req.body.email || '';
  const subject = req.body.subject || 'Website chat';
  const body = req.body.body || '';
  if (!email || !body) {
    const content = await getContent();
    return res.render('contact', locals(req, { page: 'contact', sent: false, error: 'Email and message are required.', content }));
  }

  const token = crypto.randomBytes(24).toString('hex');
  const thread = await query(
    'INSERT INTO chat_threads (token, name, email, subject) VALUES ($1, $2, $3, $4) RETURNING *',
    [token, name, email, subject]
  );
  await query('INSERT INTO chat_messages (thread_id, sender, body) VALUES ($1, $2, $3)', [thread.rows[0].id, 'visitor', body]);

  // Keep a simple inbox record too, so old dashboard/message history still works.
  await query('INSERT INTO messages (user_id, name, email, subject, body) VALUES ($1, $2, $3, $4, $5)', [null, name, email, subject, body]);

  const content = await getContent();
  res.render('contact', locals(req, { page: 'contact', sent: true, chatToken: token, content }));
});

app.get('/chat/:token/messages', async (req, res) => {
  const thread = await query('SELECT * FROM chat_threads WHERE token = $1', [req.params.token]);
  if (!thread.rows.length) return res.status(404).json({ error: 'Chat not found.' });
  await query('UPDATE chat_threads SET last_seen_visitor = NOW() WHERE id = $1', [thread.rows[0].id]);
  const messages = await query('SELECT id, sender, body, created_at FROM chat_messages WHERE thread_id = $1 ORDER BY created_at ASC', [thread.rows[0].id]);
  res.json({ thread: thread.rows[0], messages: messages.rows });
});

app.post('/chat/:token/messages', async (req, res) => {
  const body = String(req.body.body || '').trim();
  if (!body) return res.status(400).json({ error: 'Message is required.' });
  const thread = await query('SELECT * FROM chat_threads WHERE token = $1', [req.params.token]);
  if (!thread.rows.length) return res.status(404).json({ error: 'Chat not found.' });
  if (thread.rows[0].status === 'closed') return res.status(400).json({ error: 'This chat is closed.' });
  await query('INSERT INTO chat_messages (thread_id, sender, body) VALUES ($1, $2, $3)', [thread.rows[0].id, 'visitor', body]);
  await query('UPDATE chat_threads SET updated_at = NOW(), last_seen_visitor = NOW() WHERE id = $1', [thread.rows[0].id]);
  res.json({ ok: true });
});

app.get('/login', (_req, res) => res.redirect('/admin'));
app.get('/account', (_req, res) => res.redirect('/contact'));

app.get('/admin', async (req, res) => {
  if (!req.session?.isAdmin) {
    return res.render('admin-login', locals(req, { page: 'admin', error: null }));
  }

  const projects = await query('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC');
  const content = await getContent();
  res.render('admin', locals(req, { page: 'admin', projects: normalizeProjects(projects.rows), content, saved: req.query.saved || null }));
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
    return req.session.save(() => res.redirect('/admin'));
  }

  return res.status(401).render('admin-login', locals(req, { page: 'admin', error: 'Invalid admin email or password.' }));
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin'));
});


app.post('/admin/content', requireAdmin, async (req, res) => {
  const allowedKeys = [
    'hero_eyebrow', 'hero_title', 'hero_lead', 'hero_card_title', 'hero_card_body',
    'services_title', 'services_list', 'about_title', 'about_body', 'about_extra',
    'contact_title', 'contact_intro'
  ];

  for (const key of allowedKeys) {
    const value = String(req.body[key] || '').trim();
    await query(
      `INSERT INTO site_content (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, value]
    );
  }

  res.redirect('/admin?saved=content');
});

app.post('/admin/projects/:id/update', requireAdmin, upload.array('image_files', 10), async (req, res) => {
  const { title, category, description, project_url, featured, tools, goal, result, published, sort_order } = req.body;
  const existing = await query('SELECT image_url, project_images FROM projects WHERE id = $1', [req.params.id]);
  const fallbackImages = normalizeProject(existing.rows[0] || {}).images;
  const images = getProjectImages(req, fallbackImages, { useKeepImages: true });
  const image_url = images[0] || '/assets/project-1.svg';
  await query(
    `UPDATE projects
     SET title = $1, category = $2, description = $3, image_url = $4, project_images = $5, project_url = $6, featured = $7, tools = $8, goal = $9, result = $10, published = $11, sort_order = $12
     WHERE id = $13`,
    [title, category || 'Design', description, image_url, images, project_url || '', featured === 'on', tools || '', goal || '', result || '', published !== 'off', Number(sort_order || 0), req.params.id]
  );
  res.redirect('/admin?saved=project');
});

app.post('/admin/projects', requireAdmin, upload.array('image_files', 10), async (req, res) => {
  const { title, category, description, project_url, featured, tools, goal, result, published, sort_order } = req.body;
  const images = getProjectImages(req, ['/assets/project-1.svg']);
  const image_url = images[0] || '/assets/project-1.svg';
  await query('INSERT INTO projects (title, category, description, image_url, project_images, project_url, featured, tools, goal, result, published, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [
    title,
    category || 'Design',
    description,
    image_url,
    images,
    project_url || '',
    featured === 'on',
    tools || '',
    goal || '',
    result || '',
    published !== 'off',
    Number(sort_order || 0),
  ]);
  res.redirect('/admin?saved=project');
});

app.post('/admin/projects/:id/delete', requireAdmin, async (req, res) => {
  await query('DELETE FROM projects WHERE id = $1', [req.params.id]);
  res.redirect('/admin');
});



app.get('/admin/chats/live', requireAdmin, async (_req, res) => {
  const chats = await query(`
    SELECT t.*, 
      (SELECT body FROM chat_messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) AS last_message,
      (SELECT created_at FROM chat_messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) AS last_message_at,
      (SELECT COUNT(*)::int FROM chat_messages WHERE thread_id = t.id AND sender = 'visitor' AND (t.last_seen_admin IS NULL OR created_at > t.last_seen_admin)) AS unread_count
    FROM chat_threads t
    ORDER BY COALESCE((SELECT created_at FROM chat_messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1), t.updated_at) DESC
    LIMIT 100
  `);
  res.json({ chats: chats.rows });
});

app.get('/admin/chats/:id/messages', requireAdmin, async (req, res) => {
  const thread = await query('SELECT * FROM chat_threads WHERE id = $1', [req.params.id]);
  if (!thread.rows.length) return res.status(404).json({ error: 'Chat not found.' });
  await query('UPDATE chat_threads SET last_seen_admin = NOW() WHERE id = $1', [req.params.id]);
  const messages = await query('SELECT id, sender, body, created_at FROM chat_messages WHERE thread_id = $1 ORDER BY created_at ASC', [req.params.id]);
  res.json({ thread: thread.rows[0], messages: messages.rows });
});

app.post('/admin/chats/:id/reply', requireAdmin, async (req, res) => {
  const body = String(req.body.body || '').trim();
  if (!body) return res.status(400).json({ error: 'Reply is required.' });
  const thread = await query('SELECT * FROM chat_threads WHERE id = $1', [req.params.id]);
  if (!thread.rows.length) return res.status(404).json({ error: 'Chat not found.' });
  await query('INSERT INTO chat_messages (thread_id, sender, body) VALUES ($1, $2, $3)', [req.params.id, 'admin', body]);
  await query('UPDATE chat_threads SET updated_at = NOW(), last_seen_admin = NOW(), status = $2 WHERE id = $1', [req.params.id, 'open']);
  res.json({ ok: true });
});

app.post('/admin/chats/:id/close', requireAdmin, async (req, res) => {
  await query("UPDATE chat_threads SET status = 'closed', updated_at = NOW() WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

app.get('/admin/messages/live', requireAdmin, async (_req, res) => {
  const messages = await query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 75');
  res.json({ messages: messages.rows });
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
