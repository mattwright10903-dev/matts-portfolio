import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Matt Wright — freelance graphic designer, GFX creator, and FiveM server developer.',
}

export default function AboutPage() {
  return (
    <main>
      <div className="page-header wrapper">
        <p className="eyebrow mb-4">About</p>
        <h1 className="text-[clamp(36px,6vw,72px)] font-black tracking-tighter leading-none mb-4">
          Matt Wright<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p className="max-w-lg text-[15px] leading-[1.78]" style={{ color: 'var(--soft)' }}>
          Freelance graphic designer, GFX creator, and FiveM server developer.
        </p>
      </div>

      <section className="section">
        <div className="wrapper">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="reveal">
              <p className="eyebrow mb-4">Who I am</p>
              <p className="text-[16px] leading-[1.82] mb-5" style={{ color: 'var(--soft)' }}>
                I'm Matt Wright — a freelance designer and developer with 5+ years of experience
                building clean visuals, bold branding, and practical FiveM systems. I work with
                communities, creators, gaming servers, and businesses worldwide.
              </p>
              <p className="text-[16px] leading-[1.82] mb-5" style={{ color: 'var(--soft)' }}>
                My work spans two disciplines: graphic design and FiveM server development.
                That means I can help with the look, the branding, and the actual in-game experience —
                often in the same project.
              </p>
              <p className="text-[16px] leading-[1.82]" style={{ color: 'var(--soft)' }}>
                I also run a{' '}
                <Link href="/store" style={{ color: 'var(--accent)' }}>
                  GFX store
                </Link>{' '}
                with premade logos, branding packs, Discord graphics, and FiveM visual resources —
                all available directly on this site.
              </p>
            </div>

            <div className="flex flex-col gap-3 reveal" style={{ animationDelay: '.08s' }}>
              <div className="card p-6">
                <p className="eyebrow mb-4">Skills &amp; tools</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-[12px] font-black mb-2" style={{ color: 'var(--muted)' }}>Design</p>
                    <div className="flex flex-wrap gap-2">
                      {['Photoshop','Illustrator','Figma','InDesign','After Effects','Canva'].map((t) => (
                        <span key={t} className="text-[11.5px] font-black px-3 py-1 rounded-full"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] font-black mb-2" style={{ color: 'var(--muted)' }}>Development</p>
                    <div className="flex flex-wrap gap-2">
                      {['Lua','JavaScript','HTML/CSS','React','Next.js','PostgreSQL','QBCore','QBox'].map((t) => (
                        <span key={t} className="text-[11.5px] font-black px-3 py-1 rounded-full"
                          style={{ background: 'rgba(52,199,89,.06)', border: '1px solid rgba(52,199,89,.16)', color: 'rgba(100,220,130,.82)' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <p className="eyebrow mb-4">Experience highlights</p>
                <div className="space-y-3">
                  {[
                    '5+ years of graphic design work',
                    'Hundreds of logos and branding projects',
                    'FiveM community graphics and server development',
                    'Discord community brand systems',
                    'Freelance via Fiverr and direct commission',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-1 shrink-0" style={{ color: 'var(--accent)' }}>→</span>
                      <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--soft)' }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="wrapper">
          <p className="eyebrow mb-8">How I work</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              ['Clean &amp; purposeful', 'No unnecessary complexity. Every design decision has a reason. I keep visuals clear, focused, and effective.'],
              ['Direct communication',  'You work with me directly — no account managers, no delays. Fast responses, clear updates.'],
              ['Quality over quantity', 'I don\'t take on more projects than I can deliver well. Each project gets proper attention and care.'],
            ].map(([title, desc]) => (
              <div key={title} className="card p-6 reveal">
                <h3 className="font-black tracking-tight text-[17px] text-white mb-3" dangerouslySetInnerHTML={{ __html: title }} />
                <p className="text-[13px] leading-[1.65]" style={{ color: 'var(--soft)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="wrapper">
          <div className="card p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="font-black tracking-tight text-[22px] mb-2">Want to work together?</h2>
              <p className="text-[13px]" style={{ color: 'var(--soft)' }}>
                Reach out via the contact form, custom order form, or directly on Discord or email.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/custom-order" className="btn btn-primary">Custom Order</Link>
              <Link href="/contact" className="btn btn-ghost">Contact Me</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
