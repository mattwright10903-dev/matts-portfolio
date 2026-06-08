'use server'
import { revalidatePath } from 'next/cache'
import { query, queryOne } from '@/lib/db'
import { isAdminAuth } from '@/lib/auth'

async function requireAdmin() {
  const ok = await isAdminAuth()
  if (!ok) throw new Error('Unauthorised')
}

// ── Projects ──────────────────────────────────────────────────────────────────

export async function createProject(data: {
  title: string; category: string; description?: string
  image_url?: string; thumbnail_url?: string; project_images?: string[]; tags?: string[]
  published?: boolean; featured?: boolean; sort_order?: number
}) {
  await requireAdmin()
  await query(
    `INSERT INTO projects (title, category, description, image_url, thumbnail_url, project_images, tags, published, featured, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      data.title, data.category, data.description || null,
      data.image_url || null,
      data.thumbnail_url || null,
      data.project_images ?? [],
      data.tags ?? [],
      data.published ?? true, data.featured ?? false, data.sort_order ?? 0,
    ]
  )
  revalidatePath('/portfolio')
  revalidatePath('/')
}

export async function updateProject(id: number, data: Partial<{
  title: string; category: string; description: string
  image_url: string; thumbnail_url: string | null; project_images: string[]; tags: string[]
  published: boolean; featured: boolean; sort_order: number
}>) {
  await requireAdmin()
  const sets: string[] = []
  const vals: unknown[] = []
  let i = 1

  if (data.title         !== undefined) { sets.push(`title=$${i++}`);         vals.push(data.title) }
  if (data.category      !== undefined) { sets.push(`category=$${i++}`);      vals.push(data.category) }
  if (data.description   !== undefined) { sets.push(`description=$${i++}`);   vals.push(data.description) }
  if (data.image_url     !== undefined) { sets.push(`image_url=$${i++}`);     vals.push(data.image_url) }
  if (data.thumbnail_url !== undefined) { sets.push(`thumbnail_url=$${i++}`); vals.push(data.thumbnail_url) }
  if (data.project_images !== undefined) { sets.push(`project_images=$${i++}`); vals.push(data.project_images) }
  if (data.tags          !== undefined) { sets.push(`tags=$${i++}`);          vals.push(data.tags) }
  if (data.published     !== undefined) { sets.push(`published=$${i++}`);     vals.push(data.published) }
  if (data.featured      !== undefined) { sets.push(`featured=$${i++}`);      vals.push(data.featured) }
  if (data.sort_order    !== undefined) { sets.push(`sort_order=$${i++}`);    vals.push(data.sort_order) }

  if (sets.length === 0) return
  sets.push(`updated_at=NOW()`)
  vals.push(id)

  await query(`UPDATE projects SET ${sets.join(', ')} WHERE id=$${i}`, vals)
  revalidatePath('/portfolio')
  revalidatePath(`/portfolio/${id}`)
  revalidatePath('/')
}

export async function deleteProject(id: number) {
  await requireAdmin()
  await query('DELETE FROM projects WHERE id=$1', [id])
  revalidatePath('/portfolio')
  revalidatePath('/')
}

// ── Store Products ─────────────────────────────────────────────────────────────

export async function createProduct(data: {
  title: string; category: string; price: number
  description?: string; short_desc?: string; original_price?: number
  image_url?: string; product_images?: string[]; includes?: string[]
  license?: string; tags?: string[]; published?: boolean; featured?: boolean; sort_order?: number
}) {
  await requireAdmin()
  await query(
    `INSERT INTO store_products
       (title, category, price, description, short_desc, original_price,
        image_url, product_images, includes, license, tags, published, featured, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [
      data.title, data.category, data.price,
      data.description || null, data.short_desc || null,
      data.original_price ?? null,
      data.image_url || null,
      data.product_images ?? [],
      data.includes ?? [],
      data.license || null,
      data.tags ?? [],
      data.published ?? true, data.featured ?? false, data.sort_order ?? 0,
    ]
  )
  revalidatePath('/store')
  revalidatePath('/')
}

export async function updateProduct(id: number, data: Partial<{
  title: string; category: string; price: number; description: string; short_desc: string
  original_price: number | null; image_url: string; product_images: string[]
  includes: string[]; license: string; tags: string[]; published: boolean; featured: boolean; sort_order: number
}>) {
  await requireAdmin()
  const sets: string[] = []
  const vals: unknown[] = []
  let i = 1

  const fields: [string, unknown][] = [
    ['title', data.title], ['category', data.category], ['price', data.price],
    ['description', data.description], ['short_desc', data.short_desc],
    ['original_price', data.original_price], ['image_url', data.image_url],
    ['license', data.license], ['published', data.published],
    ['featured', data.featured], ['sort_order', data.sort_order],
  ]

  for (const [col, val] of fields) {
    if (val !== undefined) { sets.push(`${col}=$${i++}`); vals.push(val) }
  }

  if (data.product_images !== undefined) { sets.push(`product_images=$${i++}`); vals.push(data.product_images) }
  if (data.includes       !== undefined) { sets.push(`includes=$${i++}`);       vals.push(data.includes) }
  if (data.tags           !== undefined) { sets.push(`tags=$${i++}`);           vals.push(data.tags) }

  if (sets.length === 0) return
  sets.push(`updated_at=NOW()`)
  vals.push(id)

  await query(`UPDATE store_products SET ${sets.join(', ')} WHERE id=$${i}`, vals)
  revalidatePath('/store')
  revalidatePath(`/store/${id}`)
  revalidatePath('/')
}

export async function deleteProduct(id: number) {
  await requireAdmin()
  await query('DELETE FROM store_products WHERE id=$1', [id])
  revalidatePath('/store')
  revalidatePath('/')
}

// ── Orders ──────────────────────────────────────────────────────────────────────

export async function updateOrderStatus(id: number, status: string) {
  await requireAdmin()
  await query('UPDATE custom_orders SET status=$1 WHERE id=$2', [status, id])
  revalidatePath('/admin/orders')
}

// ── Messages ────────────────────────────────────────────────────────────────────

export async function markMessageRead(id: number) {
  await requireAdmin()
  await query('UPDATE messages SET read=true WHERE id=$1', [id])
  revalidatePath('/admin/messages')
}

export async function deleteMessage(id: number) {
  await requireAdmin()
  await query('DELETE FROM messages WHERE id=$1', [id])
  revalidatePath('/admin/messages')
}

// ── Site Content ─────────────────────────────────────────────────────────────────

export async function updateContent(key: string, value: string) {
  await requireAdmin()
  await query(
    `INSERT INTO site_content (key, value) VALUES ($1,$2)
     ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()`,
    [key, value]
  )
  revalidatePath('/')
}
