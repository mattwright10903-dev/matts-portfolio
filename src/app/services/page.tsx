import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Graphic design, FiveM graphics, Discord branding, logos, and FiveM server development services by Matt Wright.',
}

export default function ServicesPage() {
  return (
    <main>
      <div className="page-header wrapper">
        <p className="eyebrow mb-4">Services</p>
        <h1 className="text-[clamp(36px,6vw,72px)] font-black tracking-tighter leading-none mb-4">
          What I do<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p className="max-w-lg text-[15px] leading-[1.78]" style={{ color: 'var(--soft)' }}>
          Clean graphic design and practical FiveM development. I work across both disciplines —
          brand visuals and in-game systems.
        </p>
      </div>

      {/* Graphic Design */}
      <section className="section">
        <div className="wrapper">
          <div className="section-head mb-8">
            <div>
              <p className="eyebrow mb-2">01</p>
              <h2 className="text-[clamp(24px,3vw,40px)] font-black tracking-tighter">Graphic Design</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                title: 'Logo Design',
                desc:  'Clean, professional logos for brands, creators, FiveM communities, and businesses. Delivered in all formats.',
                price: 'From £15',
              },
              {
                title: 'Branding Packages',
                desc:  'Complete visual identity — logo, colour system, typography, banners, icons, and full brand guidelines.',
                price: 'From £40',
              },
              {
                title: 'FiveM Graphics',
                desc:  'Loading screens, HUD overlays, NUI interface backgrounds, and server visual assets for FiveM communities.',
                price: 'From £20',
              },
              {
                title: 'Discord Graphics',
                desc:  'Server icons, banners, role visuals, announcement graphics, community assets, and channel headers.',
                price: 'From £10',
              },
              {
                title: 'Social Media Designs',
                desc:  'Profile graphics, promo posts, story templates, ad creatives, and reusable marketing visuals.',
                price: 'From £12',
              },
              {
                title: 'Website Visuals',
                desc:  'Landing page graphics, hero banners, section backgrounds, and web-optimised creative assets.',
                price: 'From £20',
              },
            ].map((s) => (
              <div key={s.title} className="card p-6 card-hover reveal">
                <h3 className="font-black tracking-tight text-[17px] text-white mb-2">{s.title}</h3>
                <p className="text-[13px] leading-[1.65] mb-4" style={{ color: 'var(--soft)' }}>{s.desc}</p>
                <p className="text-[13px] font-black" style={{ color: 'var(--accent)' }}>{s.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FiveM Development */}
      <section className="section">
        <div className="wrapper">
          <div className="section-head mb-8">
            <div>
              <p className="eyebrow mb-2">02</p>
              <h2 className="text-[clamp(24px,3vw,40px)] font-black tracking-tighter">FiveM Development</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                title: 'FiveM Server Development',
                desc:  'Full QBCore/QBox server setup — script installation and config, resource management, database setup, and ongoing support. Clean, optimised, production-ready.',
                items: ['QBCore / QBox setup', 'Script configuration', 'Database setup', 'Bug fixing', 'Server optimisation', 'Ongoing support'],
              },
              {
                title: 'FiveM UI & Script Design',
                desc:  'Custom NUI interfaces, player-facing menus and dashboards, script panels, and in-game UI systems built to match your server\'s visual identity.',
                items: ['Custom NUI interfaces', 'Menu systems', 'Dashboard panels', 'Player-facing tools', 'Lua scripting', 'HTML/CSS/JS NUI'],
              },
            ].map((s) => (
              <div key={s.title} className="card p-6 reveal">
                <h3 className="font-black tracking-tight text-[19px] text-white mb-3">{s.title}</h3>
                <p className="text-[13px] leading-[1.68] mb-5" style={{ color: 'var(--soft)' }}>{s.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {s.items.map((item) => (
                    <span
                      key={item}
                      className="text-[11.5px] font-black px-3 py-1 rounded-full"
                      style={{ background: 'rgba(52,199,89,.07)', border: '1px solid rgba(52,199,89,.18)', color: 'rgba(100,220,130,.85)' }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section">
        <div className="wrapper">
          <div className="section-head mb-8">
            <div>
              <p className="eyebrow mb-2">03</p>
              <h2 className="text-[clamp(24px,3vw,40px)] font-black tracking-tighter">My process</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Brief',    'You share the project goals, brand details, style preferences, and any references.'],
              ['Quote',    'I review the brief and come back with a clear quote and estimated timeline.'],
              ['Create',   'I work on the project and keep you updated throughout. Revisions included.'],
              ['Deliver',  'Final files delivered in all required formats, ready to use immediately.'],
            ].map(([step, desc], i) => (
              <div key={step} className="card p-5 reveal" style={{ animationDelay: `${i * 0.06}s` }}>
                <div
                  className="w-8 h-8 rounded-lg grid place-items-center text-[11px] font-black mb-4"
                  style={{ background: 'rgba(239,35,60,.10)', color: 'var(--accent)', border: '1px solid rgba(239,35,60,.16)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-black text-[16px] text-white mb-2">{step}</h3>
                <p className="text-[13px] leading-[1.65]" style={{ color: 'var(--soft)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="wrapper">
          <div
            className="card p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 reveal"
          >
            <div>
              <p className="eyebrow mb-2">Ready to start?</p>
              <h2 className="font-black tracking-tight text-[22px] mb-2">Let's get your project moving.</h2>
              <p className="text-[13px]" style={{ color: 'var(--soft)' }}>
                Fill in the custom order form or reach out directly — I'll get back to you within 24–48 hours.
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
