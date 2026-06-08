import type { Metadata } from 'next'
import Link from 'next/link'
import { query } from '@/lib/db'

export const metadata: Metadata = { title: 'Dashboard' }

async function getStats() {
  try {
    const [projects, products, orders, messages] = await Promise.all([
      query<{ count: string }>('SELECT COUNT(*) as count FROM projects WHERE published=true'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM store_products WHERE published=true'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM custom_orders WHERE status=\'new\''),
      query<{ count: string }>('SELECT COUNT(*) as count FROM messages WHERE read IS NOT TRUE'),
    ])
    return {
      projects: parseInt(projects[0]?.count ?? '0'),
      products: parseInt(products[0]?.count ?? '0'),
      orders:   parseInt(orders[0]?.count ?? '0'),
      messages: parseInt(messages[0]?.count ?? '0'),
    }
  } catch {
    return { projects: 0, products: 0, orders: 0, messages: 0 }
  }
}

async function getRecentOrders() {
  try {
    return await query(
      `SELECT id, name, email, project_type, status, created_at
       FROM custom_orders ORDER BY created_at DESC LIMIT 5`
    )
  } catch { return [] }
}

async function getRecentMessages() {
  try {
    return await query(
      `SELECT id, name, email, subject, created_at, read
       FROM messages ORDER BY created_at DESC LIMIT 5`
    )
  } catch { return [] }
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders, recentMessages] = await Promise.all([
    getStats(), getRecentOrders(), getRecentMessages(),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[26px] font-black tracking-tight">Dashboard</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>Welcome back.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Published Projects', value: stats.projects, href: '/admin/projects' },
          { label: 'Store Products',     value: stats.products, href: '/admin/store' },
          { label: 'New Orders',         value: stats.orders,   href: '/admin/orders',   accent: stats.orders > 0 },
          { label: 'Unread Messages',    value: stats.messages, href: '/admin/messages', accent: stats.messages > 0 },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="card p-5 card-hover"
            style={s.accent ? { borderColor: 'rgba(239,35,60,.25)' } : {}}
          >
            <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
              {s.label}
            </p>
            <p
              className="text-[32px] font-black tracking-tighter"
              style={{ color: s.accent ? 'var(--accent)' : '#fff' }}
            >
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black tracking-tight text-[16px]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[12px] font-bold" style={{ color: 'var(--accent)' }}>View all →</Link>
          </div>
          {(recentOrders as any[]).length === 0 ? (
            <p className="text-[13px]" style={{ color: 'var(--muted)' }}>No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {(recentOrders as any[]).map((o) => (
                <div key={o.id} className="flex items-start justify-between gap-2 text-[13px] py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p className="font-bold text-white">{o.name}</p>
                    <p style={{ color: 'var(--muted)' }}>{o.project_type}</p>
                  </div>
                  <span
                    className="shrink-0 text-[11px] font-black px-2 py-1 rounded-full"
                    style={{
                      background: o.status === 'new' ? 'rgba(239,35,60,.12)' : 'var(--surface)',
                      color: o.status === 'new' ? 'var(--accent)' : 'var(--muted)',
                      border: `1px solid ${o.status === 'new' ? 'rgba(239,35,60,.25)' : 'var(--border)'}`,
                    }}
                  >
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent messages */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black tracking-tight text-[16px]">Recent Messages</h2>
            <Link href="/admin/messages" className="text-[12px] font-bold" style={{ color: 'var(--accent)' }}>View all →</Link>
          </div>
          {(recentMessages as any[]).length === 0 ? (
            <p className="text-[13px]" style={{ color: 'var(--muted)' }}>No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {(recentMessages as any[]).map((m) => (
                <div key={m.id} className="flex items-start justify-between gap-2 text-[13px] py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p className="font-bold text-white">{m.name} {!m.read && <span style={{ color: 'var(--accent)' }}>●</span>}</p>
                    <p style={{ color: 'var(--muted)' }}>{m.subject || m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-8">
        <p className="eyebrow mb-4">Quick actions</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/projects/new" className="btn btn-primary btn-sm">+ New Project</Link>
          <Link href="/admin/store/new"    className="btn btn-ghost btn-sm">+ New Product</Link>
          <Link href="/admin/orders"       className="btn btn-ghost btn-sm">View Orders</Link>
          <Link href="/admin/content"      className="btn btn-ghost btn-sm">Edit Content</Link>
        </div>
      </div>
    </div>
  )
}
