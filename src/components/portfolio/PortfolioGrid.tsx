'use client'
import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import type { GridProject } from '@/app/portfolio/page'

const PAGE_SIZE = 9   // 3 rows of 3 — keeps initial DOM small

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

export default function PortfolioGrid({ projects }: { projects: GridProject[] }) {
  const [active, setActive] = useState('All')
  const [page, setPage]     = useState(1)

  const filtered = useMemo(
    () => (active === 'All' ? projects : projects.filter((p) => p.category === active)),
    [projects, active]
  )

  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page])
  const hasMore = visible.length < filtered.length
  const remaining = filtered.length - visible.length

  const selectCategory = useCallback((cat: string) => {
    setActive(cat)
    setPage(1)
  }, [])

  return (
    <>
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => selectCategory(cat)}
            className={`filter-pill ${active === cat ? 'active' : ''}`}
            aria-pressed={active === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div
          className="rounded-2xl p-14 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="font-bold mb-3" style={{ color: 'var(--muted)' }}>
            No projects in this category yet.
          </p>
          <button onClick={() => selectCategory('All')} className="btn btn-ghost btn-sm">
            Show all
          </button>
        </div>
      ) : (
        <>
          <div className="project-grid">
            {visible.map((p, i) => (
              <Link
                key={p.id}
                href={`/portfolio/${p.id}`}
                className="project-card"
                aria-label={`${p.title} — ${p.category}`}
              >
                <div className="project-card-img">
                  <img
                    src={p.grid_url || '/assets/project-placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                    /* First 9 visible images get priority; the rest lazy-load */
                    loading={i < PAGE_SIZE ? 'eager' : 'lazy'}
                    decoding={i < PAGE_SIZE ? 'sync' : 'async'}
                    fetchPriority={i < 3 ? 'high' : 'low'}
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
            <div className="flex flex-col items-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="btn btn-ghost"
              >
                Load more
              </button>
              <p className="text-[12px]" style={{ color: 'var(--muted)' }}>
                Showing {visible.length} of {filtered.length}
              </p>
            </div>
          )}
        </>
      )}
    </>
  )
}
