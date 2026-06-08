import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createProject } from '@/app/admin/actions'

export const metadata: Metadata = { title: 'New Project' }

export default function NewProjectPage() {
  async function create(fd: FormData) {
    'use server'
    const tags    = (fd.get('tags') as string || '').split(',').map((t) => t.trim()).filter(Boolean)
    const images  = (fd.get('project_images') as string || '').split('\n').map((t) => t.trim()).filter(Boolean)
    await createProject({
      title:          (fd.get('title')       as string).trim(),
      category:       (fd.get('category')    as string).trim(),
      description:    (fd.get('description') as string || '').trim(),
      image_url:      (fd.get('image_url')   as string || '').trim(),
      project_images: images,
      tags,
      published: fd.get('published')  === 'true',
      featured:  fd.get('featured')   === 'true',
      sort_order: parseInt(fd.get('sort_order') as string || '0', 10),
    })
    redirect('/admin/projects')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/projects" className="text-[13px] font-bold" style={{ color: 'var(--muted)' }}>← Projects</Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <h1 className="text-[22px] font-black tracking-tight">New Project</h1>
      </div>

      <form action={create} className="flex flex-col gap-5">
        <div>
          <label className="form-label">Title *</label>
          <input className="form-input" name="title" type="text" required placeholder="Project title" />
        </div>

        <div>
          <label className="form-label">Category *</label>
          <select className="form-input" name="category" required>
            {['Logo Design','Branding','FiveM Graphics','Discord Graphics','Web Design','Social Media','Other'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Description</label>
          <textarea className="form-input" name="description" rows={4} placeholder="Project description..." />
        </div>

        <div>
          <label className="form-label">Main Image URL</label>
          <input className="form-input" name="image_url" type="text" placeholder="https://... or data:image/..." />
        </div>

        <div>
          <label className="form-label">Additional Image URLs <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(one per line)</span></label>
          <textarea className="form-input" name="project_images" rows={3} placeholder={"https://image2.jpg\nhttps://image3.jpg"} />
        </div>

        <div>
          <label className="form-label">Tags <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(comma separated)</span></label>
          <input className="form-input" name="tags" type="text" placeholder="logo, branding, minimalist" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Sort Order</label>
            <input className="form-input" name="sort_order" type="number" defaultValue={0} />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="published" value="false" />
            <input
              type="checkbox"
              name="published"
              value="true"
              defaultChecked
              className="w-4 h-4 accent-red-500"
            />
            <span className="text-[13px] font-bold">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="featured" value="false" />
            <input type="checkbox" name="featured" value="true" className="w-4 h-4 accent-red-500" />
            <span className="text-[13px] font-bold">Featured on homepage</span>
          </label>
        </div>

        <div className="flex gap-3 mt-4">
          <button type="submit" className="btn btn-primary">Create Project</button>
          <Link href="/admin/projects" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
