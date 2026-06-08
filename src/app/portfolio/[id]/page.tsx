import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { queryOne, query } from '@/lib/db'

interface Project {
  id: number
  title: string
  category: string
  description: string | null
  image_url: string
  project_images: string[] | null
  tags: string[] | null
  created_at: string
}

async function getProject(id: string): Promise<Project | null> {
  try {
    return await queryOne<Project>(
      `SELECT id, title, category, description, image_url, project_images, tags, created_at
       FROM projects WHERE id = $1 AND published = true`,
      [parseInt(id, 10)]
    )
  } catch { return null }
}

async function getRelated(id: string, category: string): Promise<Pick<Project, 'id' | 'title' | 'category' | 'image_url'>[]> {
  try {
    return await query(
      `SELECT id, title, category, image_url FROM projects
       WHERE category = $1 AND id != $2 AND published = true
       ORDER BY sort_order ASC, created_at DESC LIMIT 3`,
      [category, parseInt(id, 10)]
    )
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await getProject(params.id)
  if (!p) return { title: 'Project Not Found' }
  return {
    title: p.title,
    description: p.description?.slice(0, 160) ?? `${p.category} project by Matt Wright.`,
    openGraph: { images: p.image_url ? [p.image_url] : [] },
  }
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)
  if (!project) notFound()

  const related = await getRelated(params.id, project.category)

  const allImages = [
    project.image_url,
    ...(project.project_images ?? []),
  ].filter(Boolean)

  return (
    <main>
      {/* Header */}
      <div className="page-header wrapper">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-[13px] font-bold mb-6 transition-colors"
          style={{ color: 'var(--muted)' }}
        >
          ← Back to Portfolio
        </Link>
        <p className="eyebrow mb-3">{project.category}</p>
        <h1 className="text-[clamp(32px,5vw,64px)] font-black tracking-tighter leading-none mb-6">
          {project.title}
        </h1>
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span
                key={t}
                className="text-[11.5px] font-black px-3 py-1 rounded-full"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main image */}
      <section className="wrapper mb-8">
        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <img
            src={allImages[0] || '/assets/project-placeholder.svg'}
            alt={project.title}
            loading="eager"
            decoding="async"
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Description */}
      {project.description && (
        <section className="wrapper mb-12 max-w-2xl">
          <p className="eyebrow mb-3">About this project</p>
          <p className="text-[15px] leading-[1.82] whitespace-pre-line" style={{ color: 'var(--soft)' }}>
            {project.description}
          </p>
        </section>
      )}

      {/* Additional images */}
      {allImages.length > 1 && (
        <section className="section">
          <div className="wrapper">
            <p className="eyebrow mb-6">Project images</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allImages.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <img
                    src={img}
                    alt={`${project.title} — image ${i + 2}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section">
        <div className="wrapper">
          <div className="card p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="font-black tracking-tight text-[22px] mb-2">Like what you see?</h2>
              <p className="text-[14px]" style={{ color: 'var(--soft)' }}>
                Let's talk about your project — reach out or place a custom order.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/custom-order" className="btn btn-primary">Start a Project</Link>
              <Link href="/contact" className="btn btn-ghost">Contact Me</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="section">
          <div className="wrapper">
            <div className="section-head mb-6">
              <p className="eyebrow">More {project.category}</p>
              <Link href="/portfolio" className="btn btn-ghost btn-sm">All projects →</Link>
            </div>
            <div className="project-grid">
              {related.map((p) => (
                <Link key={p.id} href={`/portfolio/${p.id}`} className="project-card">
                  <div className="project-card-img">
                    <img
                      src={p.image_url || '/assets/project-placeholder.svg'}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="project-card-body">
                    <p className="project-card-cat">{p.category}</p>
                    <h3 className="project-card-title">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
