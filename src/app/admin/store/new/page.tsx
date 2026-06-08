import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createProduct } from '@/app/admin/actions'

export const metadata: Metadata = { title: 'New Product' }

export default function NewProductPage() {
  async function create(fd: FormData) {
    'use server'
    const tags    = (fd.get('tags')     as string || '').split(',').map((t) => t.trim()).filter(Boolean)
    const includes = (fd.get('includes') as string || '').split('\n').map((t) => t.trim()).filter(Boolean)
    const images  = (fd.get('product_images') as string || '').split('\n').map((t) => t.trim()).filter(Boolean)
    await createProduct({
      title:          (fd.get('title')       as string).trim(),
      category:       (fd.get('category')    as string).trim(),
      price:          parseFloat(fd.get('price') as string),
      description:    (fd.get('description') as string || '').trim(),
      short_desc:     (fd.get('short_desc')  as string || '').trim(),
      original_price: fd.get('original_price') ? parseFloat(fd.get('original_price') as string) : undefined,
      image_url:      (fd.get('image_url')   as string || '').trim(),
      product_images: images,
      includes,
      license:        (fd.get('license')     as string || '').trim(),
      tags,
      published: fd.get('published') === 'true',
      featured:  fd.get('featured')  === 'true',
      sort_order: parseInt(fd.get('sort_order') as string || '0', 10),
    })
    redirect('/admin/store')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/store" className="text-[13px] font-bold" style={{ color: 'var(--muted)' }}>← Store</Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <h1 className="text-[22px] font-black tracking-tight">New Product</h1>
      </div>

      <form action={create} className="flex flex-col gap-5">
        <div><label className="form-label">Title *</label>
          <input className="form-input" name="title" required placeholder="Product title" /></div>

        <div><label className="form-label">Category *</label>
          <select className="form-input" name="category" required>
            {['Premade Logos','Tebex Product Images','Discord Graphics','Social Media Graphics','FiveM Branding Packs','Custom Graphics'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Price (£) *</label>
            <input className="form-input" name="price" type="number" step="0.01" required placeholder="9.99" /></div>
          <div><label className="form-label">Original Price (£) <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input className="form-input" name="original_price" type="number" step="0.01" placeholder="19.99" /></div>
        </div>

        <div><label className="form-label">Short Description <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(shown on card)</span></label>
          <input className="form-input" name="short_desc" placeholder="One line summary..." /></div>

        <div><label className="form-label">Full Description</label>
          <textarea className="form-input" name="description" rows={4} placeholder="Detailed product description..." /></div>

        <div><label className="form-label">Main Image URL</label>
          <input className="form-input" name="image_url" placeholder="https://..." /></div>

        <div><label className="form-label">Additional Images <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(one per line)</span></label>
          <textarea className="form-input" name="product_images" rows={3} /></div>

        <div><label className="form-label">What's Included <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(one per line)</span></label>
          <textarea className="form-input" name="includes" rows={3} placeholder={"PNG file\nSVG file\nEditable source"} /></div>

        <div><label className="form-label">License</label>
          <input className="form-input" name="license" placeholder="e.g. Personal & Commercial use" /></div>

        <div><label className="form-label">Tags <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(comma separated)</span></label>
          <input className="form-input" name="tags" placeholder="logo, minimal, dark" /></div>

        <div><label className="form-label">Sort Order</label>
          <input className="form-input" name="sort_order" type="number" defaultValue={0} /></div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="published" value="false" />
            <input type="checkbox" name="published" value="true" defaultChecked className="w-4 h-4 accent-red-500" />
            <span className="text-[13px] font-bold">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="featured" value="false" />
            <input type="checkbox" name="featured" value="true" className="w-4 h-4 accent-red-500" />
            <span className="text-[13px] font-bold">Featured on homepage</span>
          </label>
        </div>

        <div className="flex gap-3 mt-4">
          <button type="submit" className="btn btn-primary">Create Product</button>
          <Link href="/admin/store" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
