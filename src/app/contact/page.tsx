import type { Metadata } from 'next'
import ContactForm from '@/components/forms/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Matt Wright for graphic design, FiveM development, custom orders, or general enquiries.',
}

export default function ContactPage() {
  return (
    <main>
      <div className="page-header wrapper">
        <p className="eyebrow mb-4">Contact</p>
        <h1 className="text-[clamp(36px,6vw,72px)] font-black tracking-tighter leading-none mb-4">
          Get in touch<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p className="max-w-lg text-[15px] leading-[1.78]" style={{ color: 'var(--soft)' }}>
          Questions, project enquiries, or just want to chat? Reach out via the form or directly
          on Discord.
        </p>
      </div>

      <section className="section">
        <div className="wrapper">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Contact form */}
            <div className="lg:col-span-2">
              <div className="card p-7 md:p-10">
                <p className="eyebrow mb-4">Send a message</p>
                <ContactForm />
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              <div className="card p-6">
                <p className="eyebrow mb-4">Direct contact</p>
                <div className="flex flex-col gap-3">
                  <a
                    href="https://discord.com/users/1128708778343280713"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl transition-all card-hover"
                    style={{ background: 'rgba(88,101,242,.10)', border: '1px solid rgba(88,101,242,.22)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg grid place-items-center text-[14px] shrink-0"
                      style={{ background: 'rgba(88,101,242,.18)' }}
                    >
                      D
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-white">Discord DM</p>
                      <p className="text-[11.5px]" style={{ color: 'var(--muted)' }}>mjww0</p>
                    </div>
                  </a>

                  <a
                    href="mailto:mattwright10903@gmail.com"
                    className="flex items-center gap-3 p-3 rounded-xl card-hover"
                    style={{ background: 'rgba(66,133,244,.08)', border: '1px solid rgba(66,133,244,.18)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg grid place-items-center text-[14px] shrink-0"
                      style={{ background: 'rgba(66,133,244,.14)' }}
                    >
                      @
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-white">Email</p>
                      <p className="text-[11.5px] break-all" style={{ color: 'var(--muted)' }}>mattwright10903@gmail.com</p>
                    </div>
                  </a>

                  <a
                    href="https://www.fiverr.com/s/yvkxr7Z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl card-hover"
                    style={{ background: 'rgba(29,191,115,.08)', border: '1px solid rgba(29,191,115,.18)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg grid place-items-center text-[13px] shrink-0"
                      style={{ background: 'rgba(29,191,115,.14)' }}
                    >
                      F
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-white">Fiverr</p>
                      <p className="text-[11.5px]" style={{ color: 'var(--muted)' }}>Order on Fiverr ↗</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="card p-6">
                <p className="eyebrow mb-3">Response time</p>
                <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--soft)' }}>
                  I typically reply within <strong className="text-white">24–48 hours</strong>.
                  Discord is fastest for quick questions.
                </p>
              </div>

              <div className="card p-6">
                <p className="eyebrow mb-3">Working on a project?</p>
                <p className="text-[13px] leading-[1.7] mb-4" style={{ color: 'var(--soft)' }}>
                  For design and dev projects, the custom order form gives me more detail upfront
                  so I can reply with a faster, more accurate quote.
                </p>
                <a href="/custom-order" className="btn btn-primary btn-sm w-full text-center">Custom Order Form →</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
