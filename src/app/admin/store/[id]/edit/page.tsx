import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { queryOne } from '@/lib/db'
import { updateProduct } from '@/app/admin/actions'

export const metadata: Metadata = { title: 'Edit Product' }

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  let product: any = null
  try {
    product = await queryOne('SELECT * FROM store_products WHERE id=$1', [id])
  } catch {}
  if (!product) notFound()

  async function update(fd: FormData) {
    'use server'
    const tags    = (fd.get('tags')     as string || '').split(',').map((t) => t.trim()).filter(Boolean)
    const includes = (fd.get('includes') as string || '').split('\n').map((t) => t.trim()).filter(Boolean)
    const images  = (fd.get('product_images') as string || '').split('\n').map((t) => t.trim()).filter(Boolean)
    const origPrice = fd.get('original_price')
    await updateProduct(id, {
      title:          (fd.get('title')       as string).trim(),
      category:       (fd.get('category')    as string).trim(),
      price:          parseFloat(fd.get('price') as string),
      description:    (fd.get('description') as string || '').trim(),
      short_desc:     (fd.get('short_desc')  as string || '').trim(),
      original_price: origPrice ? parseFloat(origPrice as string) : null,
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
        <h1 className="text-[22px] font-black tracking-tight">Edit Product</h1>
      </div>

      <form action={update} className="flex flex-col gap-5">
        <div><label className="form-label">Title *</label>
          <input className="form-input" name="title" required defaultValue={product.title} /></div>

        <div><label className="form-label">Category *</label>
          <select className="form-input" name="category" required defaultValue={product.category}>
            {['Premade Logos','Discord Packs','FiveM Resources','Social Media','Branding Kits','Other'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Price (£) *</label>
            <input className="form-input" name="price" type="number" step="0.01" required defaultValue={product.price} /></div>
          <div><label className="form-label">Original Price (£)</label>
            <input className="form-input" name="original_price" type="number" step="0.01" defaultValue={product.original_price ?? ''} /></div>
        </div>

        <div><label className="form-label">Short Description</label>
          <input className="form-input" name="short_desc" defaultValue={product.short_desc ?? ''} /></div>

        <div><label className="form-label">Full Description</label>
          <textarea className="form-input" name="description" rows={4} defaultValue={product.description ?? ''} /></div>

        <div><label className="form-label">Main Image URL</label>
          <input className="form-input" name="image_url" defaultValue={product.image_url ?? ''} /></div>

        <div><label className="form-label">Additional Images <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(one per line)</span></label>
          <textarea className="form-input" name="product_images" rows={3} defaultValue={(product.product_images ?? []).join('\n')} /></div>

        <div><label className="form-label">What's Included <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(one per line)</span></label>
          <textarea className="form-input" name="includes" rows={3} defaultValue={(product.includes ?? []).join('\n')} /></div>

        <div><label className="form-label">License</label>
          <input className="form-input" name="license" defaultValue={product.license ?? ''} /></div>

        <div><label className="form-label">Tags <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(comma separated)</span></label>
          <input className="form-input" name="tags" defaultValue={(product.tags ?? []).join(', ')} /></div>

        <div><label className="form-label">Sort Order</label>
          <input className="form-input" name="sort_order" type="number" defaultValue={product.sort_order ?? 0} /></div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="published" value="false" />
            <input type="checkbox" name="published" value="true" defaultChecked={product.published} className="w-4 h-4 accent-red-500" />
            <span className="text-[13px] font-bold">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="featured" value="false" />
            <input type="checkbox" name="featured" value="true" defaultChecked={product.featured} className="w-4 h-4 accent-red-500" />
            <span className="text-[13px] font-bold">Featured on homepage</span>
          </label>
        </div>

        <div className="flex gap-3 mt-4">
          <button type="submit" className="btn btn-primary">Save Changes</button>
          <Link href="/admin/store" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
