import type { Metadata } from 'next'
import { query } from '@/lib/db'
import { updateOrderStatus } from '@/app/admin/actions'

export const metadata: Metadata = { title: 'Orders' }

const STATUSES = ['new', 'in_review', 'in_progress', 'completed', 'cancelled']

export default async function AdminOrdersPage() {
  let orders: any[] = []
  try {
    orders = await query(`SELECT * FROM custom_orders ORDER BY created_at DESC`)
  } catch {}

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[24px] font-black tracking-tight">Custom Orders</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>{orders.length} total</p>
      </div>

      {orders.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[14px]" style={{ color: 'var(--muted)' }}>No orders yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-[16px] text-white">{o.name}</h3>
                    <span
                      className="text-[11px] font-black px-2 py-1 rounded-full"
                      style={{
                        background: o.status === 'new' ? 'rgba(239,35,60,.12)' : o.status === 'completed' ? 'rgba(52,199,89,.1)' : 'var(--surface)',
                        color: o.status === 'new' ? 'var(--accent)' : o.status === 'completed' ? 'rgba(52,199,89,.9)' : 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {o.status}
                    </span>
                  </div>
                  <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
                    {o.email}{o.discord ? ` · Discord: ${o.discord}` : ''}
                  </p>
                </div>
                <p className="text-[12px]" style={{ color: 'var(--muted)' }}>
                  {new Date(o.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[13px] mb-4">
                {[
                  ['Project Type', o.project_type],
                  o.project_name && ['Project Name', o.project_name],
                  o.budget       && ['Budget', o.budget],
                  o.deadline     && ['Deadline', o.deadline],
                  o.design_style && ['Style', o.design_style],
                  o.colors       && ['Colours', o.colors],
                ].filter(Boolean).map(([label, value]: any) => (
                  <div key={label} className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
                    <p className="font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>

              {(o.references_text || o.notes) && (
                <div className="flex flex-col gap-3 mb-4">
                  {o.references_text && (
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>References</p>
                      <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--soft)' }}>{o.references_text}</p>
                    </div>
                  )}
                  {o.notes && (
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Notes</p>
                      <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--soft)' }}>{o.notes}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[12px] font-black mr-1" style={{ color: 'var(--muted)' }}>Update status:</p>
                {STATUSES.map((s) => (
                  <form key={s} action={async () => { 'use server'; await updateOrderStatus(o.id, s) }}>
                    <button
                      type="submit"
                      className="text-[11px] font-black px-3 py-1.5 rounded-full transition-all"
                      style={{
                        background: o.status === s ? 'rgba(239,35,60,.15)' : 'var(--surface)',
                        border: `1px solid ${o.status === s ? 'rgba(239,35,60,.30)' : 'var(--border)'}`,
                        color: o.status === s ? 'var(--accent)' : 'var(--muted)',
                      }}
                    >
                      {s}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
