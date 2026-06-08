import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { queryOne, query } from '@/lib/db'

interface Product {
  id: number
  title: string
  category: string
  description: string | null
  short_desc: string | null
  price: string
  original_price: string | null
  image_url: string
  product_images: string[] | null
  includes: string[] | null
  license: string | null
  tags: string[] | null
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    return await queryOne<Product>(
      `SELECT id, title, category, description, short_desc, price, original_price,
              image_url, product_images, includes, license, tags
       FROM store_products WHERE id = $1 AND published = true`,
      [parseInt(id, 10)]
    )
  } catch { return null }
}

async function getRelated(id: string, category: string) {
  try {
    return await query<Pick<Product, 'id' | 'title' | 'category' | 'price' | 'image_url'>>(
      `SELECT id, title, category, price, image_url FROM store_products
       WHERE category = $1 AND id != $2 AND published = true
       ORDER BY sort_order ASC LIMIT 3`,
      [category, parseInt(id, 10)]
    )
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await getProduct(params.id)
  if (!p) return { title: 'Product Not Found' }
  return {
    title: p.title,
    description: p.short_desc ?? p.description?.slice(0, 160) ?? `${p.category} by Matt W Studio.`,
    openGraph: { images: p.image_url ? [p.image_url] : [] },
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  const related = await getRelated(params.id, product.category)

  const allImages = [product.image_url, ...(product.product_images ?? [])].filter(Boolean)
  const discount = product.original_price
    ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)
    : null

  return (
    <main>
      <div className="wrapper pt-12">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-[13px] font-bold mb-8 transition-colors"
          style={{ color: 'var(--muted)' }}
        >
          ← Back to Store
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Images */}
          <div className="flex flex-col gap-3">
            <div
              className="overflow-hidden rounded-2xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <img
                src={allImages[0] || '/assets/project-placeholder.svg'}
                alt={product.title}
                loading="eager"
                decoding="async"
                className="w-full h-auto"
              />
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-lg aspect-square"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <img
                      src={img}
                      alt={`${product.title} — ${i + 2}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="eyebrow mb-3">{product.category}</p>
            <h1 className="text-[clamp(24px,3.5vw,42px)] font-black tracking-tighter leading-tight mb-4">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[30px] font-black" style={{ color: 'var(--accent)' }}>
                £{Number(product.price).toFixed(2)}
              </span>
              {product.original_price && (
                <>
                  <span className="text-[18px] line-through" style={{ color: 'var(--muted)' }}>
                    £{Number(product.original_price).toFixed(2)}
                  </span>
                  <span
                    className="text-[12px] font-black px-2 py-1 rounded-full"
                    style={{ background: 'rgba(239,35,60,.15)', color: 'var(--accent)' }}
                  >
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {product.short_desc && (
              <p className="text-[14px] leading-[1.72] mb-6" style={{ color: 'var(--soft)' }}>
                {product.short_desc}
              </p>
            )}

            {/* Includes */}
            {product.includes && product.includes.length > 0 && (
              <div className="card p-5 mb-6">
                <p className="eyebrow mb-3 text-[10px]">What's included</p>
                <ul className="space-y-2">
                  {product.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px]" style={{ color: 'var(--soft)' }}>
                      <span style={{ color: 'var(--accent)' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* License */}
            {product.license && (
              <p className="text-[12px] mb-6" style={{ color: 'var(--muted)' }}>
                <strong>License:</strong> {product.license}
              </p>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-black px-3 py-1 rounded-full"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Purchase CTA */}
            <div className="flex flex-col gap-3">
              <a
                href="https://www.fiverr.com/s/yvkxr7Z"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full justify-center text-center"
              >
                Purchase on Fiverr ↗
              </a>
              <a
                href="https://discord.com/users/1128708778343280713"
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost w-full justify-center text-center"
              >
                Buy via Discord
              </a>
              <Link href="/custom-order" className="btn btn-outline w-full justify-center text-center">
                Request Custom Version
              </Link>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="max-w-2xl mt-14">
            <p className="eyebrow mb-3">Description</p>
            <p className="text-[15px] leading-[1.82] whitespace-pre-line" style={{ color: 'var(--soft)' }}>
              {product.description}
            </p>
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="section">
          <div className="wrapper">
            <div className="section-head mb-6">
              <p className="eyebrow">More like this</p>
              <Link href="/store" className="btn btn-ghost btn-sm">All products →</Link>
            </div>
            <div className="store-grid">
              {related.map((p) => (
                <Link key={p.id} href={`/store/${p.id}`} className="card card-hover overflow-hidden">
                  <div className="aspect-video overflow-hidden" style={{ background: 'var(--surface)' }}>
                    <img
                      src={p.image_url || '/assets/project-placeholder.svg'}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <p className="eyebrow mb-2 text-[10px]">{p.category}</p>
                    <h3 className="font-black tracking-tight text-[15px] text-white mb-3">{p.title}</h3>
                    <span className="font-black text-[16px]" style={{ color: 'var(--accent)' }}>
                      £{Number(p.price).toFixed(2)}
                    </span>
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
