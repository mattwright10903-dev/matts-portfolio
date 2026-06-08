import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { queryOne } from '@/lib/db'
import { updateProject } from '@/app/admin/actions'

export const metadata: Metadata = { title: 'Edit Project' }

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  let project: any = null
  try {
    project = await queryOne('SELECT * FROM projects WHERE id=$1', [id])
  } catch {}
  if (!project) notFound()

  async function update(fd: FormData) {
    'use server'
    const tags   = (fd.get('tags')           as string || '').split(',').map((t) => t.trim()).filter(Boolean)
    const images = (fd.get('project_images') as string || '').split('\n').map((t) => t.trim()).filter(Boolean)
    await updateProject(id, {
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

  const existingImages = (project.project_images ?? []).join('\n')

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/projects" className="text-[13px] font-bold" style={{ color: 'var(--muted)' }}>← Projects</Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <h1 className="text-[22px] font-black tracking-tight">Edit Project</h1>
      </div>

      <form action={update} className="flex flex-col gap-5">
        <div>
          <label className="form-label">Title *</label>
          <input className="form-input" name="title" type="text" required defaultValue={project.title} />
        </div>

        <div>
          <label className="form-label">Category *</label>
          <select className="form-input" name="category" required defaultValue={project.category}>
            {['Logo Design','Branding','FiveM Graphics','Discord Graphics','Web Design','Social Media','Other'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Description</label>
          <textarea className="form-input" name="description" rows={4} defaultValue={project.description ?? ''} />
        </div>

        <div>
          <label className="form-label">Main Image URL</label>
          <input className="form-input" name="image_url" type="text" defaultValue={project.image_url ?? ''} />
        </div>

        <div>
          <label className="form-label">Additional Image URLs <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(one per line)</span></label>
          <textarea className="form-input" name="project_images" rows={3} defaultValue={existingImages} />
        </div>

        <div>
          <label className="form-label">Tags <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(comma separated)</span></label>
          <input className="form-input" name="tags" type="text" defaultValue={(project.tags ?? []).join(', ')} />
        </div>

        <div>
          <label className="form-label">Sort Order</label>
          <input className="form-input" name="sort_order" type="number" defaultValue={project.sort_order ?? 0} />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="published" value="false" />
            <input type="checkbox" name="published" value="true" defaultChecked={project.published} className="w-4 h-4 accent-red-500" />
            <span className="text-[13px] font-bold">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="featured" value="false" />
            <input type="checkbox" name="featured" value="true" defaultChecked={project.featured} className="w-4 h-4 accent-red-500" />
            <span className="text-[13px] font-bold">Featured on homepage</span>
          </label>
        </div>

        <div className="flex gap-3 mt-4">
          <button type="submit" className="btn btn-primary">Save Changes</button>
          <Link href="/admin/projects" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
