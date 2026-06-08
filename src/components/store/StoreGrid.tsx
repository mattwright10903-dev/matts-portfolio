'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Product {
  id: number
  title: string
  category: string
  short_desc: string | null
  price: string
  original_price: string | null
  image_url: string
}

const CATEGORIES = [
  'All',
  'Premade Logos',
  'Tebex Product Images',
  'Discord Graphics',
  'Social Media Graphics',
  'FiveM Branding Packs',
  'Custom Graphics',
]

export default function StoreGrid({ products }: { products: Product[] }) {
  const [active, setActive] = useState('All')

  const filtered = useMemo(
    () => (active === 'All' ? products : products.filter((p) => p.category === active)),
    [products, active]
  )

  return (
    <>
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`filter-pill ${active === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="font-black text-white text-[18px] mb-2">Store coming soon</p>
          <p className="text-[14px] mb-6" style={{ color: 'var(--muted)' }}>
            Products will appear here once added. In the meantime, reach out for a custom order.
          </p>
          <Link href="/custom-order" className="btn btn-primary">Request Custom Order</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="font-bold text-[15px] mb-2 text-white">No products in this category</p>
          <button onClick={() => setActive('All')} className="btn btn-ghost btn-sm mt-3">
            Show all products
          </button>
        </div>
      ) : (
        <div className="store-grid">
          {filtered.map((p, i) => (
            <Link
              key={p.id}
              href={`/store/${p.id}`}
              className="card card-hover overflow-hidden"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="aspect-video overflow-hidden" style={{ background: 'var(--surface)' }}>
                <img
                  src={p.image_url || '/assets/project-placeholder.svg'}
                  alt={p.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="eyebrow mb-2 text-[10px]">{p.category}</p>
                <h3 className="font-black tracking-tight text-[15px] text-white mb-1 line-clamp-2">
                  {p.title}
                </h3>
                {p.short_desc && (
                  <p className="text-[12.5px] leading-[1.6] mb-3 line-clamp-2" style={{ color: 'var(--muted)' }}>
                    {p.short_desc}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <span className="font-black text-[17px]" style={{ color: 'var(--accent)' }}>
                    £{Number(p.price).toFixed(2)}
                  </span>
                  {p.original_price && (
                    <span className="text-[12px] line-through" style={{ color: 'var(--muted)' }}>
                      £{Number(p.original_price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
