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
      project_images TEXT[] DEFAULT ARRAY[]::TEXT[],
      project_url TEXT,
      featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_images TEXT[] DEFAULT ARRAY[]::TEXT[];`);
  await query(`UPDATE projects SET project_images = ARRAY[image_url] WHERE (project_images IS NULL OR cardinality(project_images) = 0) AND image_url IS NOT NULL AND image_url <> '';`);

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
    hero_eyebrow: 'Graphic Design • FiveM Development',
    hero_title: 'Design and development work by Matt Wright.',
    hero_lead: 'A professional portfolio for logo design, branding, FiveM graphics, Discord visuals, website assets, and custom FiveM server development.',
    hero_card_title: 'Clean visuals. Strong branding. Better FiveM experiences.',
    hero_card_body: 'This site is built so new projects, descriptions, and page content can be updated through the admin dashboard.',
    services_title: 'What I Can Create',
    services_list: 'Logo Design\nBranding Packages\nFiveM Graphics\nFiveM Server Development\nFiveM UI & Script Design\nDiscord Graphics\nWebsite Visuals\nSocial Media Designs',
    about_title: 'About Me',
    about_body: 'I am Matt Wright, a graphic designer and FiveM server developer focused on clean visuals, polished community branding, and better player experiences. I create logos, branding packs, Discord graphics, website visuals, FiveM graphics, and custom FiveM server development work.',
    about_extra: 'My goal is to make every project look professional and feel easy to use, whether it is a business brand, a Discord community, a FiveM server, a website, or a custom in-game system.',
    contact_title: 'Contact Me',
    contact_intro: 'Add me on Discord, email me directly, or send a project request through the website.'
  };

  for (const [key, value] of Object.entries(defaults)) {
    await upsertContent(key, value);
  }



  const existingServices = await query('SELECT value FROM site_content WHERE key = $1', ['services_list']);
  if (existingServices.rows[0] && !existingServices.rows[0].value.includes('FiveM Server Development')) {
    const updatedServices = `${existingServices.rows[0].value}
FiveM Server Development
FiveM UI & Script Design`;
    await query('UPDATE site_content SET value = $1, updated_at = NOW() WHERE key = $2', [updatedServices, 'services_list']);
  }

  const oldHero = await query('SELECT value FROM site_content WHERE key = $1', ['hero_lead']);
  if (oldHero.rows[0] && oldHero.rows[0].value === 'A clean portfolio for logo design, branding, FiveM graphics, website visuals, and custom project work.') {
    await query('UPDATE site_content SET value = $1, updated_at = NOW() WHERE key = $2', ['A professional portfolio for logo design, branding, FiveM graphics, Discord visuals, website assets, and custom FiveM server development.', 'hero_lead']);
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
        'FiveM Server Development Concept',
        'FiveM Development',
        'A custom server development concept covering script configuration, UI improvements, and better RP workflows.',
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
