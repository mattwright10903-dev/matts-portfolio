import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      created_at TIMESTAMP DEFAULT NOW()
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
