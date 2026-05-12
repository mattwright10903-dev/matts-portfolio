import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

async function upsertContent(key, value) {
  await query(
    `INSERT INTO site_content (key, value)
     VALUES ($1, $2)
     ON CONFLICT (key) DO NOTHING`,
    [key, value]
  );
}

export async function getContent() {
  const result = await query('SELECT key, value FROM site_content ORDER BY key ASC');
  return result.rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      avatar TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Design',
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      project_url TEXT,
      featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const defaults = {
    hero_eyebrow: 'Portfolio Website',
    hero_title: 'Creative work by Matt Wright.',
    hero_lead: 'A clean portfolio for logo design, branding, FiveM graphics, website visuals, and custom project work.',
    hero_card_title: 'Clean visuals. Strong branding. Easy project updates.',
    hero_card_body: 'This site is built so new projects, descriptions, and page content can be updated through the admin dashboard.',
    services_title: 'What I Can Create',
    services_list: 'Logo Design\nBranding Packages\nFiveM Graphics\nDiscord Graphics\nWebsite Visuals\nSocial Media Designs',
    about_title: 'About Me',
    about_body: 'I am Matt Wright, a freelance graphic designer focused on clean, modern visuals for businesses, FiveM communities, Discord brands, content creators, and online projects. I create logos, branding packs, social media graphics, website visuals, and custom project designs built around each client’s style.',
    about_extra: 'My goal is to make every design look professional, clear, and easy to use across websites, Discord servers, social pages, and business branding.',
    contact_title: 'Contact Me',
    contact_intro: 'Add me on Discord, email me directly, or send a project request through the website.'
  };

  for (const [key, value] of Object.entries(defaults)) {
    await upsertContent(key, value);
  }

  const count = await query('SELECT COUNT(*)::int AS total FROM projects');
  if (count.rows[0].total === 0) {
    await query(
      `INSERT INTO projects (title, category, description, image_url, project_url, featured)
       VALUES
       ($1, $2, $3, $4, $5, true),
       ($6, $7, $8, $9, $10, true),
       ($11, $12, $13, $14, $15, false)`,
      [
        'Clean Business Logo Concept',
        'Logo Design',
        'A sharp and professional logo concept designed for businesses that need a clean, modern identity.',
        '/assets/project-1.svg',
        '',
        'FiveM Server Branding Pack',
        'FiveM Graphics',
        'A full graphic pack concept for a FiveM community, including banners, icons, and social branding.',
        '/assets/project-2.svg',
        '',
        'Social Media Brand Kit',
        'Branding',
        'A modern brand kit designed for online promotion, using consistent colors, clean typography, and reusable layouts.',
        '/assets/project-3.svg',
        '',
      ]
    );
  }
}
