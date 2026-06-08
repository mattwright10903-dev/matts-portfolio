import type { Metadata } from 'next'
import Link from 'next/link'
import { query } from '@/lib/db'
import StoreGrid from '@/components/store/StoreGrid'

export const metadata: Metadata = {
  title: 'GFX Store',
  description:
    'Matt W Studio GFX Store — premade logos, Discord branding packs, FiveM visual resources, and social media templates.',
}

interface Product {
  id: number
  title: string
  category: string
  short_desc: string | null
  price: string
  original_price: string | null
  image_url: string
}

async function getProducts(): Promise<Product[]> {
  try {
    return await query<Product>(
      `SELECT id, title, category, short_desc, price, original_price, image_url
       FROM store_products
       WHERE published = true
       ORDER BY sort_order ASC, created_at DESC`
    )
  } catch { return [] }
}

export default async function StorePage() {
  const products = await getProducts()

  return (
    <main>
      <div className="page-header wrapper">
        <p className="eyebrow mb-4">Matt W Studio</p>
        <h1 className="text-[clamp(36px,6vw,72px)] font-black tracking-tighter leading-none mb-4">
          GFX Store<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p className="max-w-lg text-[15px] leading-[1.78]" style={{ color: 'var(--soft)' }}>
          Premade logos, Discord branding packs, FiveM visual resources, and social media
          templates — ready to use, instantly available.
        </p>
      </div>

      <section className="section">
        <div className="wrapper">
          <StoreGrid products={products} />
        </div>
      </section>

      {/* Custom order upsell */}
      <section className="section">
        <div className="wrapper">
          <div className="card p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="eyebrow mb-2">Need something unique?</p>
              <h2 className="font-black tracking-tight text-[20px] mb-2">Order a custom design</h2>
              <p className="text-[13px]" style={{ color: 'var(--soft)' }}>
                Can't find exactly what you need? I create fully custom designs tailored to your
                brand and brief.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/custom-order" className="btn btn-primary">Custom Order</Link>
              <Link href="/contact" className="btn btn-ghost">Ask a Question</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
