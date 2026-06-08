'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/store',     label: 'Store'     },
  { href: '/services',  label: 'Services'  },
  { href: '/about',     label: 'About'     },
  { href: '/contact',   label: 'Contact'   },
]

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  return (
    <>
      <nav className="site-nav" aria-label="Main navigation">
        {/* Brand */}
        <Link href="/" className="nav-brand" aria-label="Matt Wright — home">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#0c0c14"/>
            <rect x=".5" y=".5" width="31" height="31" rx="6.5" stroke="rgba(255,255,255,.10)"/>
            <text x="16" y="22" textAnchor="middle" fontFamily="system-ui" fontWeight="900" fontSize="13" fill="white" letterSpacing="-0.5">MW</text>
            <rect x="7" y="27.5" width="18" height="2" rx="1" fill="#ef233c"/>
          </svg>
          Matt Wright
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname.startsWith(href) ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA + Hamburger */}
        <div className="flex items-center gap-2">
          <Link href="/custom-order" className="btn btn-primary btn-sm hidden md:inline-flex">
            Custom Order
          </Link>
          <button
            className="nav-hamburger"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span
              style={{
                transform: open ? 'translateY(6.5px) rotate(45deg)' : '',
                transition: 'transform 240ms cubic-bezier(.16,1,.3,1)',
              }}
            />
            <span
              style={{
                opacity: open ? 0 : 1,
                transition: 'opacity 160ms ease',
              }}
            />
            <span
              style={{
                transform: open ? 'translateY(-6.5px) rotate(-45deg)' : '',
                transition: 'transform 240ms cubic-bezier(.16,1,.3,1)',
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`mobile-nav ${open ? 'open' : ''}`}
        aria-hidden={!open}
      >
        <button
          className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-white/70 hover:text-white transition-colors"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        <nav className="flex flex-col gap-0">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className="mobile-nav-link">
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/custom-order" className="btn btn-primary" onClick={() => setOpen(false)}>
            Custom Order
          </Link>
          <Link href="/store" className="btn btn-ghost" onClick={() => setOpen(false)}>
            Visit GFX Store →
          </Link>
        </div>

        <div className="mt-auto pt-8 text-white/30 text-[12px] font-bold">
          <span>mattwright.online</span>
        </div>
      </div>
    </>
  )
}
