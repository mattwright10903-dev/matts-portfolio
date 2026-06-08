import type { Metadata } from 'next'
import { query } from '@/lib/db'
import { markMessageRead, deleteMessage } from '@/app/admin/actions'

export const metadata: Metadata = { title: 'Messages' }

export default async function AdminMessagesPage() {
  let messages: any[] = []
  try {
    messages = await query(`SELECT * FROM messages ORDER BY created_at DESC`)
  } catch {}

  const unread = messages.filter((m) => !m.read).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[24px] font-black tracking-tight">Messages</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>
          {messages.length} total{unread > 0 ? ` · ${unread} unread` : ''}
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[14px]" style={{ color: 'var(--muted)' }}>No messages yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className="card p-6"
              style={{ borderColor: !m.read ? 'rgba(239,35,60,.20)' : 'var(--border)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-[15px] text-white">{m.name}</h3>
                  {!m.read && (
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(239,35,60,.12)', color: 'var(--accent)', border: '1px solid rgba(239,35,60,.22)' }}
                    >
                      New
                    </span>
                  )}
                </div>
                <p className="text-[12px]" style={{ color: 'var(--muted)' }}>
                  {new Date(m.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                </p>
              </div>

              <p className="text-[13px] mb-1" style={{ color: 'var(--muted)' }}>
                <a href={`mailto:${m.email}`} style={{ color: 'var(--accent)' }}>{m.email}</a>
              </p>

              {m.subject && (
                <p className="text-[13px] font-bold text-white mb-2">{m.subject}</p>
              )}

              <p className="text-[14px] leading-[1.7] mb-4 whitespace-pre-line" style={{ color: 'var(--soft)' }}>
                {m.message}
              </p>

              <div className="flex items-center gap-2">
                <a href={`mailto:${m.email}`} className="btn btn-ghost btn-sm">Reply via Email</a>

                {!m.read && (
                  <form action={async () => { 'use server'; await markMessageRead(m.id) }}>
                    <button type="submit" className="btn btn-sm btn-ghost">Mark as Read</button>
                  </form>
                )}

                <form action={async () => { 'use server'; await deleteMessage(m.id) }}>
                  <button type="submit" className="btn btn-sm" style={{ background: 'rgba(239,35,60,.08)', border: '1px solid rgba(239,35,60,.18)', color: 'var(--accent)' }}>
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
