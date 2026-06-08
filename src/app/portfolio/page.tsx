import type { Metadata } from 'next'
import { query } from '@/lib/db'
import PortfolioGrid from '@/components/portfolio/PortfolioGrid'

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    "Browse Matt Wright's design and development portfolio — logos, branding, FiveM graphics, Discord visuals, and more.",
}

export interface GridProject {
  id: number
  title: string
  category: string
  /**
   * Safe-to-display URL for the grid thumbnail.
   * Never a base64 data URI — those stay on the detail page only.
   * NULL means no thumbnail was set; the grid shows the placeholder.
   */
  grid_url: string | null
}

async function getAllProjects(): Promise<GridProject[]> {
  try {
    return await query<GridProject>(
      `SELECT
         id,
         title,
         category,
         CASE
           WHEN thumbnail_url IS NOT NULL AND thumbnail_url != '' THEN thumbnail_url
           WHEN image_url IS NOT NULL AND image_url NOT LIKE 'data:%' THEN image_url
           ELSE NULL
         END AS grid_url
       FROM projects
       WHERE published = true
       ORDER BY sort_order ASC, created_at DESC`
    )
  } catch {
    return []
  }
}

export default async function PortfolioPage() {
  const projects = await getAllProjects()

  return (
    <main>
      <div className="page-header wrapper">
        <p className="eyebrow mb-4">Portfolio</p>
        <h1 className="text-[clamp(36px,6vw,72px)] font-black tracking-tighter leading-none mb-4">
          My work<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p className="max-w-lg text-[15px] leading-[1.78]" style={{ color: 'var(--soft)' }}>
          Logos, branding systems, FiveM graphics, Discord visuals, and more. Filter by category
          or browse everything below.
        </p>
      </div>

      <section className="section">
        <div className="wrapper">
          <PortfolioGrid projects={projects} />
        </div>
      </section>
    </main>
  )
}
