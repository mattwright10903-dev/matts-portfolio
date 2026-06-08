import type { Metadata } from 'next'
import Link from 'next/link'
import { query } from '@/lib/db'
import { deleteProduct } from '@/app/admin/actions'

export const metadata: Metadata = { title: 'Store Products' }

export default async function AdminStorePage() {
  let products: any[] = []
  try {
    products = await query(
      `SELECT id, title, category, price, published, featured, sort_order
       FROM store_products ORDER BY sort_order ASC, created_at DESC`
    )
  } catch {}

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-black tracking-tight">Store Products</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>{products.length} total</p>
        </div>
        <Link href="/admin/store/new" className="btn btn-primary btn-sm">+ New Product</Link>
      </div>

      {products.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>No products yet.</p>
          <Link href="/admin/store/new" className="btn btn-primary btn-sm">Add first product</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Title','Category','Price','Status','Featured','Actions'].map((h) => (
                  <th key={h} className="text-left p-4 font-black text-[11px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td className="p-4"><span className="font-bold text-white">{p.title}</span></td>
                  <td className="p-4" style={{ color: 'var(--muted)' }}>{p.category}</td>
                  <td className="p-4 font-black" style={{ color: 'var(--accent)' }}>£{Number(p.price).toFixed(2)}</td>
                  <td className="p-4">
                    <span
                      className="text-[11px] font-black px-2 py-1 rounded-full"
                      style={{
                        background: p.published ? 'rgba(52,199,89,.1)' : 'var(--surface)',
                        color: p.published ? 'rgba(52,199,89,.9)' : 'var(--muted)',
                        border: `1px solid ${p.published ? 'rgba(52,199,89,.2)' : 'var(--border)'}`,
                      }}
                    >
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4" style={{ color: p.featured ? 'var(--accent)' : 'var(--muted)' }}>
                    {p.featured ? '★ Yes' : '—'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/store/${p.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                      <form action={async () => { 'use server'; await deleteProduct(p.id) }}>
                        <button type="submit" className="btn btn-sm" style={{ background: 'rgba(239,35,60,.1)', border: '1px solid rgba(239,35,60,.2)', color: 'var(--accent)' }}>
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
