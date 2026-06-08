import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <Link href="/" className="nav-brand text-[17px]">Matt Wright</Link>
          <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>
            Graphic Designer · GFX Creator<br />FiveM Server Developer
          </p>
          <Link
            href="/store"
            className="footer-studio-link inline-block mt-3 text-[12.5px] font-bold"
          >
            GFX Store →
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-2.5">
          {[
            ['/portfolio',    'Portfolio'],
            ['/store',        'GFX Store'],
            ['/services',     'Services'],
            ['/custom-order', 'Custom Order'],
            ['/about',        'About'],
            ['/contact',      'Contact'],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="text-[13px] font-bold transition-colors"
              style={{ color: 'var(--soft)' }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-2.5">
          <p className="eyebrow mb-2">Get in touch</p>
          <span className="text-[13px]" style={{ color: 'var(--soft)' }}>
            Discord: mjww0
          </span>
          <a
            href="mailto:mattwright10903@gmail.com"
            className="text-[13px] font-bold transition-colors break-all"
            style={{ color: 'var(--soft)' }}
          >
            mattwright10903@gmail.com
          </a>
          <a
            href="https://www.fiverr.com/s/yvkxr7Z"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-bold"
            style={{ color: 'rgba(29,191,115,.78)' }}
          >
            Fiverr ↗
          </a>
          <a
            href="https://discord.com/users/1128708778343280713"
            target="_blank"
            rel="noreferrer"
            className="text-[13px] font-bold"
            style={{ color: 'rgba(88,101,242,.88)' }}
          >
            Discord DM ↗
          </a>
        </div>
      </div>

      <div
        className="mt-8 pt-6 flex items-center justify-between gap-4 flex-wrap text-[12px]"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
      >
        <span>© {year} Matt Wright. All rights reserved.</span>
        <Link href="/custom-order" className="font-bold" style={{ color: 'var(--muted)' }}>
          Start a project →
        </Link>
      </div>
    </footer>
  )
}
