'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Project {
  id: number
  title: string
  category: string
  image_url: string
}

const PAGE_SIZE = 12

const CATEGORIES = [
  'All',
  'Logo Design',
  'Branding',
  'FiveM Graphics',
  'Discord Graphics',
  'Web Design',
  'Social Media',
  'Other',
]

export default function PortfolioGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState('All')
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () => (active === 'All' ? projects : projects.filter((p) => p.category === active)),
    [projects, active]
  )

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  function selectCategory(cat: string) {
    setActive(cat)
    setPage(1)
  }

  return (
    <>
      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => selectCategory(cat)}
            className={`filter-pill ${active === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p style={{ color: 'var(--muted)' }} className="font-bold">
            No projects in this category yet.
          </p>
        </div>
      ) : (
        <>
          <div className="project-grid">
            {visible.map((p) => (
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

          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="btn btn-ghost"
              >
                Load more ({filtered.length - visible.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
