import type { Metadata } from 'next'
import { query } from '@/lib/db'
import { updateContent } from '@/app/admin/actions'

export const metadata: Metadata = { title: 'Site Content' }

const CONTENT_KEYS = [
  { key: 'hero_title',         label: 'Hero Title',             placeholder: 'Matt Wright' },
  { key: 'hero_subtitle',      label: 'Hero Subtitle',          placeholder: 'Clean visuals · Strong branding · Practical FiveM design' },
  { key: 'hero_description',   label: 'Hero Description',       placeholder: 'About line under hero...' },
  { key: 'about_text',         label: 'About Text (short)',      placeholder: 'Short about blurb...' },
  { key: 'fiverr_url',         label: 'Fiverr URL',             placeholder: 'https://www.fiverr.com/s/...' },
  { key: 'discord_username',   label: 'Discord Username',       placeholder: 'mjww0' },
  { key: 'discord_user_id',    label: 'Discord User ID',        placeholder: '1128708778343280713' },
  { key: 'contact_email',      label: 'Contact Email',          placeholder: 'mattwright10903@gmail.com' },
]

export default async function AdminContentPage() {
  let existing: Record<string, string> = {}
  try {
    const rows = await query<{ key: string; value: string }>('SELECT key, value FROM site_content')
    for (const row of rows) existing[row.key] = row.value
  } catch {}

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-[24px] font-black tracking-tight">Site Content</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>
          Key–value content overrides. Leave blank to use defaults.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {CONTENT_KEYS.map(({ key, label, placeholder }) => (
          <form
            key={key}
            action={async (fd: FormData) => {
              'use server'
              const val = (fd.get('value') as string || '').trim()
              if (val) await updateContent(key, val)
            }}
          >
            <div className="card p-5">
              <label className="form-label mb-2 block">{label}</label>
              <p className="text-[11px] mb-2" style={{ color: 'var(--muted)' }}>Key: <code>{key}</code></p>
              {key.includes('description') || key.includes('text') ? (
                <textarea
                  className="form-input mb-3"
                  name="value"
                  rows={3}
                  defaultValue={existing[key] ?? ''}
                  placeholder={placeholder}
                />
              ) : (
                <input
                  className="form-input mb-3"
                  name="value"
                  type="text"
                  defaultValue={existing[key] ?? ''}
                  placeholder={placeholder}
                />
              )}
              <button type="submit" className="btn btn-ghost btn-sm">Save</button>
            </div>
          </form>
        ))}
      </div>
    </div>
  )
}
