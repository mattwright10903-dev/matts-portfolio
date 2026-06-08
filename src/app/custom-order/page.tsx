import type { Metadata } from 'next'
import OrderForm from '@/components/forms/OrderForm'

export const metadata: Metadata = {
  title: 'Custom Order',
  description:
    'Request a custom graphic design, branding, FiveM graphics, or server development project directly from Matt Wright.',
}

export default function CustomOrderPage() {
  return (
    <main>
      <div className="page-header wrapper">
        <p className="eyebrow mb-4">Start a project</p>
        <h1 className="text-[clamp(36px,6vw,72px)] font-black tracking-tighter leading-none mb-4">
          Custom Order<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p className="max-w-lg text-[15px] leading-[1.78]" style={{ color: 'var(--soft)' }}>
          Fill in the form below with your project details and I'll get back to you within 24–48
          hours to discuss scope, pricing, and timeline.
        </p>
      </div>

      <section className="section">
        <div className="wrapper">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="card p-7 md:p-10">
                <OrderForm />
              </div>
            </div>

            {/* Sidebar info */}
            <div className="flex flex-col gap-4">
              <div className="card p-6">
                <p className="eyebrow mb-3">How it works</p>
                <ol className="space-y-3">
                  {[
                    ['Submit your brief', 'Fill in the form with project details, style, and budget.'],
                    ['Get a response',    'I\'ll reply within 24–48 hours with a quote and plan.'],
                    ['Work together',     'We refine the brief, I start work, you review and approve.'],
                    ['Delivery',          'Final files delivered in formats ready to use immediately.'],
                  ].map(([title, desc], i) => (
                    <li key={title} className="flex gap-3 items-start">
                      <span
                        className="shrink-0 w-6 h-6 rounded-full grid place-items-center text-[11px] font-black mt-0.5"
                        style={{ background: 'rgba(239,35,60,.12)', color: 'var(--accent)', border: '1px solid rgba(239,35,60,.20)' }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <strong className="block text-[13px] font-black text-white mb-0.5">{title}</strong>
                        <p className="text-[12px] leading-[1.6]" style={{ color: 'var(--muted)' }}>{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="card p-6">
                <p className="eyebrow mb-3">Contact directly</p>
                <div className="flex flex-col gap-3">
                  <a
                    href="https://discord.com/users/1128708778343280713"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm w-full text-center"
                    style={{ background: 'rgba(88,101,242,.15)', border: '1px solid rgba(88,101,242,.30)', color: '#fff' }}
                  >
                    Discord DM
                  </a>
                  <a
                    href="mailto:mattwright10903@gmail.com"
                    className="btn btn-sm btn-ghost w-full text-center"
                  >
                    Email
                  </a>
                  <a
                    href="https://www.fiverr.com/s/yvkxr7Z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm w-full text-center"
                    style={{ background: 'rgba(29,191,115,.12)', border: '1px solid rgba(29,191,115,.26)', color: '#fff' }}
                  >
                    Order on Fiverr ↗
                  </a>
                </div>
              </div>

              <div className="card p-6">
                <p className="eyebrow mb-3">Response time</p>
                <p className="text-[14px] leading-[1.7]" style={{ color: 'var(--soft)' }}>
                  I typically respond within <strong className="text-white">24–48 hours</strong>.
                  For urgent projects, Discord DM is the fastest way to reach me.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  )
}
