import type { Metadata } from 'next'
import Link from 'next/link'
import { query } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Matt Wright — Graphic Designer & FiveM Server Developer',
  description:
    'Matt Wright — freelance graphic designer, GFX creator, and FiveM server developer. Clean branding, Discord graphics, FiveM UI, and custom server development.',
}

interface Project { id: number; title: string; category: string; image_url: string }
interface Product { id: number; title: string; category: string; price: string; image_url: string; original_price: string | null }

async function getFeaturedProjects(): Promise<Project[]> {
  try {
    return await query<Project>(
      `SELECT id, title, category, image_url
       FROM projects
       WHERE featured = true AND published = true
       ORDER BY sort_order ASC, created_at DESC
       LIMIT 4`
    )
  } catch { return [] }
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    return await query<Product>(
      `SELECT id, title, category, price, original_price, image_url
       FROM store_products
       WHERE featured = true AND published = true
       ORDER BY sort_order ASC, created_at DESC
       LIMIT 3`
    )
  } catch { return [] }
}

export default async function HomePage() {
  const [projects, products] = await Promise.all([getFeaturedProjects(), getFeaturedProducts()])

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero wrapper">
        <div className="flex flex-wrap gap-2 mb-6 reveal">
          <span className="pill pill-gfx">GFX Creator</span>
          <span className="pill pill-design">Graphic Designer</span>
          <span className="pill pill-fivem">FiveM Developer</span>
        </div>

        <h1 className="hero-title reveal" style={{ animationDelay: '.05s' }}>
          Matt Wright<span className="dot">.</span>
        </h1>

        <p
          className="mt-5 text-[16px] font-bold uppercase tracking-[.07em] reveal"
          style={{ color: 'var(--muted)', animationDelay: '.1s' }}
        >
          Clean visuals · Strong branding · Practical FiveM design
        </p>

        <p
          className="mt-5 max-w-[560px] text-[15px] leading-[1.78] reveal"
          style={{ color: 'var(--soft)', animationDelay: '.15s' }}
        >
          I create bold branding, FiveM graphics, Discord visuals, loading screens, and custom FiveM
          server development for communities, creators, and businesses worldwide.
        </p>

        <div className="flex flex-wrap gap-3 mt-8 reveal" style={{ animationDelay: '.2s' }}>
          <Link href="/portfolio" className="btn btn-primary">View Portfolio</Link>
          <Link href="/store"     className="btn btn-ghost">GFX Store</Link>
          <Link href="/custom-order" className="btn btn-outline">Custom Order</Link>
        </div>

        <div className="flex flex-wrap gap-2 mt-8 reveal" style={{ animationDelay: '.25s' }}>
          {['5+ Years Experience', 'Design + Development', 'FiveM / Branding / Web'].map((t) => (
            <span
              key={t}
              className="text-[12px] font-black px-3 py-1.5 rounded-full"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── Featured Work ────────────────────────────────────── */}
      <section className="section">
        <div className="wrapper">
          <div className="section-head">
            <div>
              <p className="eyebrow mb-3">Featured Work</p>
              <h2 className="text-[clamp(26px,3vw,42px)] font-black tracking-tighter">Selected projects</h2>
            </div>
            <Link href="/portfolio" className="btn btn-ghost btn-sm">View all →</Link>
          </div>

          {projects.length === 0 ? (
            <div
              className="rounded-2xl p-16 text-center reveal"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p style={{ color: 'var(--muted)' }} className="font-bold">
                Projects will appear here once added in the admin dashboard.
              </p>
            </div>
          ) : (
            <div className={`bento-grid bento-count-${projects.length}`}>
              {projects.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/portfolio/${p.id}`}
                  className={`bento-card reveal ${i === 0 ? 'bento-large' : i === 3 ? 'bento-wide' : ''}`}
                  style={{ animationDelay: `${i * 0.07}s` }}
                  aria-label={p.title}
                >
                  <img
                    src={p.image_url || '/assets/project-placeholder.svg'}
                    alt={p.title}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  <div className="bento-meta">
                    <p>{p.category}</p>
                    <h3>{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── GFX Store Preview ────────────────────────────────── */}
      <section className="section">
        <div className="wrapper">
          <div className="section-head">
            <div>
              <p className="eyebrow mb-3">Matt W Studio</p>
              <h2 className="text-[clamp(26px,3vw,42px)] font-black tracking-tighter">GFX Store</h2>
            </div>
            <Link href="/store" className="btn btn-ghost btn-sm">Browse store →</Link>
          </div>

          {products.length === 0 ? (
            /* Studio band / coming soon */
            <div
              className="relative overflow-hidden rounded-3xl p-8 md:p-12 reveal"
              style={{
                background: 'radial-gradient(ellipse 65% 100% at 0% 55%, rgba(239,35,60,.08), transparent 62%), var(--surface)',
                border: '1px solid rgba(239,35,60,.20)',
              }}
            >
              <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
                   style={{ background: 'radial-gradient(circle, #ef233c, transparent 70%)', filter: 'blur(48px)', transform: 'translate(30%,-20%)' }} />
              <div className="relative z-10 max-w-xl">
                <p className="eyebrow mb-4">Coming soon</p>
                <p className="text-[clamp(22px,3vw,40px)] font-black tracking-tighter text-white leading-tight mb-4">
                  Matt W Studio<span style={{ color: 'var(--accent)' }}>.</span>
                </p>
                <p className="text-[14px] leading-[1.72] mb-6" style={{ color: 'var(--soft)' }}>
                  Premade logos, Tebex graphics, Discord branding packs, social media templates, and
                  FiveM visual resources — available at the Matt W Studio store.
                </p>
                <Link href="/store" className="btn btn-primary">Visit the Store</Link>
              </div>
            </div>
          ) : (
            <div className="store-grid">
              {products.map((p, i) => (
                <Link key={p.id} href={`/store/${p.id}`} className="card card-hover overflow-hidden reveal" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="aspect-video overflow-hidden bg-black/20">
                    <img
                      src={p.image_url || '/assets/project-placeholder.svg'}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <p className="eyebrow mb-2">{p.category}</p>
                    <h3 className="font-black tracking-tight text-[16px] text-white mb-2">{p.title}</h3>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="font-black text-[18px] text-accent">
                        £{Number(p.price).toFixed(2)}
                      </span>
                      {p.original_price && (
                        <span className="text-[13px] line-through" style={{ color: 'var(--muted)' }}>
                          £{Number(p.original_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────── */}
      <section className="section" id="services">
        <div className="wrapper">
          <div className="section-head">
            <div>
              <p className="eyebrow mb-3">Services</p>
              <h2 className="text-[clamp(26px,3vw,42px)] font-black tracking-tighter">Design &amp; development</h2>
            </div>
            <Link href="/contact" className="btn btn-ghost btn-sm">Get a quote</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Graphic Design */}
            <div className="card p-7 reveal">
              <div className="flex items-center justify-between mb-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="eyebrow">Graphic Design</p>
                <span className="badge badge-neutral">6 services</span>
              </div>
              <div className="flex flex-col divide-y" style={{ ['--tw-divide-opacity' as string]: '1', borderColor: 'var(--border)' }}>
                {[
                  ['01', 'Logo Design',          'Clean, professional logos for brands, creators, communities, and servers.'],
                  ['02', 'Branding Packages',     'Full visual systems — colors, banners, icons, and complete style direction.'],
                  ['03', 'FiveM Graphics',        'Loading screens, HUD overlays, NUI backgrounds, and server visual assets.'],
                  ['04', 'Discord Graphics',      'Icons, banners, role visuals, announcement graphics, and community assets.'],
                  ['05', 'Website Visuals',       'Landing page visuals, web graphics, and creative direction for online brands.'],
                  ['06', 'Social Media Designs',  'Promo posts, profile assets, ad graphics, and reusable marketing visuals.'],
                ].map(([num, name, desc]) => (
                  <div key={num} className="flex gap-3 items-start py-4">
                    <span
                      className="shrink-0 w-8 h-8 rounded-lg grid place-items-center text-[10px] font-black"
                      style={{ background: 'rgba(239,35,60,.10)', color: 'var(--accent)', border: '1px solid rgba(239,35,60,.16)' }}
                    >
                      {num}
                    </span>
                    <div>
                      <strong className="block text-[13px] font-black text-white mb-1">{name}</strong>
                      <p className="text-[12px] leading-[1.6]" style={{ color: 'var(--muted)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FiveM Development */}
            <div className="flex flex-col gap-3">
              <div className="card p-7 reveal">
                <div className="flex items-center justify-between mb-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="eyebrow">FiveM Development</p>
                  <span className="badge badge-neutral">2 services</span>
                </div>
                <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
                  {[
                    ['01', 'FiveM Server Development', 'QBCore/QBox setup, script configuration, bug fixing, server polish, and optimization.'],
                    ['02', 'FiveM UI & Script Design',  'Custom NUI interfaces, menu systems, dashboard-style panels, and player-facing tools.'],
                  ].map(([num, name, desc]) => (
                    <div key={num} className="flex gap-3 items-start py-4">
                      <span
                        className="shrink-0 w-8 h-8 rounded-lg grid place-items-center text-[10px] font-black"
                        style={{ background: 'rgba(52,199,89,.08)', color: 'rgba(52,199,89,.9)', border: '1px solid rgba(52,199,89,.16)' }}
                      >
                        {num}
                      </span>
                      <div>
                        <strong className="block text-[13px] font-black text-white mb-1">{name}</strong>
                        <p className="text-[12px] leading-[1.6]" style={{ color: 'var(--muted)' }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FiveM stack tags */}
              <div className="card p-6 reveal">
                <p className="eyebrow mb-4">FiveM Stack</p>
                <div className="flex flex-wrap gap-2">
                  {['QBCore','QBox','Lua','NUI','HTML/CSS/JS','Server Config','Database','Bug Fixing','Optimisation'].map((t) => (
                    <span
                      key={t}
                      className="text-[11.5px] font-black px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(52,199,89,.06)', border: '1px solid rgba(52,199,89,.16)', color: 'rgba(100,220,130,.82)' }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Custom Order CTA ──────────────────────────────────── */}
      <section className="section">
        <div className="wrapper">
          <div
            className="relative overflow-hidden rounded-3xl p-10 md:p-16 reveal"
            style={{ background: 'var(--surface)', border: '1px solid rgba(239,35,60,.18)' }}
          >
            <div
              className="absolute -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none opacity-20"
              style={{ background: 'radial-gradient(circle, #ef233c, transparent 65%)', filter: 'blur(60px)' }}
            />
            <div className="relative z-10 max-w-2xl">
              <p className="eyebrow mb-4">Start a project</p>
              <h2 className="text-[clamp(28px,4vw,54px)] font-black tracking-tighter leading-none mb-5">
                Let's build something clean, sharp, and professional.
              </h2>
              <p className="text-[15px] leading-[1.78] mb-8" style={{ color: 'var(--soft)' }}>
                Fill out the custom order form with your project details, budget, and timeline — I'll
                get back to you directly.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/custom-order" className="btn btn-primary">Custom Order Form</Link>
                <Link href="/contact"      className="btn btn-ghost">Contact Me</Link>
                <a
                  href="https://www.fiverr.com/s/yvkxr7Z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  Order on Fiverr ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrapper">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="reveal">
              <p className="eyebrow mb-4">About Matt</p>
              <h2 className="text-[clamp(26px,3.5vw,46px)] font-black tracking-tighter leading-tight mb-6">
                Turning ideas into visuals and systems<span style={{ color: 'var(--accent)' }}> that feel professional.</span>
              </h2>
              <p className="text-[15px] leading-[1.78] mb-4" style={{ color: 'var(--soft)' }}>
                I'm a freelance designer and developer with 5+ years of experience creating clean
                visuals, bold branding, and practical FiveM systems. I work with communities, creators,
                and businesses worldwide.
              </p>
              <p className="text-[15px] leading-[1.78] mb-8" style={{ color: 'var(--soft)' }}>
                I work across both creative design and FiveM server development — which means I can
                help with the look, the branding, and the actual in-game experience.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['Photoshop','Illustrator','Figma','VS Code','Lua','QBCore','HTML/CSS'].map((t) => (
                  <span
                    key={t}
                    className="text-[11.5px] font-black px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <Link href="/about" className="btn btn-ghost">More about me →</Link>
            </div>

            <div className="grid grid-cols-1 gap-3 reveal" style={{ animationDelay: '.1s' }}>
              {[
                ['Design Direction',    'Logos, branding packs, social graphics, and portfolio visuals made with clean modern direction.'],
                ['FiveM Development',   'Server setup, script configuration, UI work, and bug fixing for roleplay communities.'],
                ['Direct Workflow',     'You work directly with me from concept to delivery — simple, fast, and transparent.'],
              ].map(([title, desc], i) => (
                <div key={title} className="card p-6 card-hover">
                  <span
                    className="block text-[11px] font-black mb-3"
                    style={{ color: 'var(--accent)', letterSpacing: '.2em', textTransform: 'uppercase' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-black tracking-tight text-white text-[18px] mb-2">{title}</h3>
                  <p className="text-[13px] leading-[1.65]" style={{ color: 'var(--soft)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials placeholder ──────────────────────────── */}
      <section className="section">
        <div className="wrapper">
          <div className="section-head">
            <div>
              <p className="eyebrow mb-3">Reviews</p>
              <h2 className="text-[clamp(26px,3vw,42px)] font-black tracking-tighter">What clients say</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              ['FiveM Server Owner', 'The loading screen design was exactly what I needed. Clean, fast, and looked completely custom.'],
              ['Discord Community',  'Great communication and really understood the brief. The branding pack came out professional.'],
              ['GFX Client',         'Fast turnaround and high quality. Will definitely be ordering again for future projects.'],
            ].map(([role, text]) => (
              <div key={role} className="card p-6 reveal">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: 'var(--accent)' }}>★</span>
                  ))}
                </div>
                <p className="text-[14px] leading-[1.72] mb-4" style={{ color: 'var(--soft)' }}>&ldquo;{text}&rdquo;</p>
                <p className="text-[12px] font-black" style={{ color: 'var(--muted)' }}>— {role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact CTA ───────────────────────────────────────── */}
      <section className="py-24">
        <div className="wrapper">
          <div
            className="card p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 reveal"
          >
            <div className="max-w-lg">
              <p className="eyebrow mb-3">Get in touch</p>
              <h2 className="text-[clamp(24px,3vw,40px)] font-black tracking-tighter mb-3">
                Ready to start a project?
              </h2>
              <p className="text-[14px] leading-[1.72]" style={{ color: 'var(--soft)' }}>
                Reach out via Discord, email, or Fiverr for design, branding, FiveM development, and
                digital project work.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a
                href="https://discord.com/users/1128708778343280713"
                target="_blank"
                rel="noreferrer"
                className="btn"
                style={{ background: 'rgba(88,101,242,.16)', border: '1px solid rgba(88,101,242,.30)', color: '#fff' }}
              >
                Discord
              </a>
              <a
                href="mailto:mattwright10903@gmail.com"
                className="btn"
                style={{ background: 'rgba(66,133,244,.13)', border: '1px solid rgba(66,133,244,.26)', color: '#fff' }}
              >
                Email Me
              </a>
              <a
                href="https://www.fiverr.com/s/yvkxr7Z"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ background: 'rgba(29,191,115,.12)', border: '1px solid rgba(29,191,115,.26)', color: '#fff' }}
              >
                Fiverr ↗
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
