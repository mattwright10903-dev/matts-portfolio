'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const links = [
  { href: '/admin',          label: 'Dashboard' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/store',    label: 'Store' },
  { href: '/admin/orders',   label: 'Orders' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/content',  label: 'Content' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside className="admin-sidebar">
      <Link href="/admin" className="flex items-center gap-2 mb-8 px-3">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="7" fill="#0c0c14"/>
          <rect x=".5" y=".5" width="31" height="31" rx="6.5" stroke="rgba(255,255,255,.1)"/>
          <text x="16" y="22" textAnchor="middle" fontFamily="system-ui" fontWeight="900" fontSize="13" fill="white" letterSpacing="-0.5">MW</text>
          <rect x="7" y="27.5" width="18" height="2" rx="1" fill="#ef233c"/>
        </svg>
        <span className="font-black text-[14px] text-white">Admin</span>
      </Link>

      <nav className="flex flex-col gap-0.5 flex-1">
        {links.map(({ href, label }) => {
          const active = href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={`admin-nav-link ${active ? 'active' : ''}`}>
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-6 flex flex-col gap-2">
        <Link href="/" target="_blank" className="admin-nav-link text-center">
          View Site ↗
        </Link>
        <button onClick={logout} className="admin-nav-link text-left w-full" style={{ color: 'rgba(239,35,60,.75)' }}>
          Log out
        </button>
      </div>
    </aside>
  )
}
