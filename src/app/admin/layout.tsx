import type { Metadata } from 'next'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s — Admin' },
  robots: 'noindex,nofollow',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-wrap">
      <AdminNav />
      <main className="flex-1 min-w-0 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
