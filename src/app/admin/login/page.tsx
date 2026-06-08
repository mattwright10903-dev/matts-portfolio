'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Invalid credentials.'); return }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <svg width="40" height="40" viewBox="0 0 32 32" className="mx-auto mb-4" fill="none">
            <rect width="32" height="32" rx="8" fill="#0c0c14"/>
            <rect x=".5" y=".5" width="31" height="31" rx="7.5" stroke="rgba(255,255,255,.1)"/>
            <text x="16" y="22" textAnchor="middle" fontFamily="system-ui" fontWeight="900" fontSize="13" fill="white" letterSpacing="-0.5">MW</text>
            <rect x="7" y="27.5" width="18" height="2" rx="1" fill="#ef233c"/>
          </svg>
          <h1 className="text-[22px] font-black tracking-tight">Admin Login</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>mattwright.online</p>
        </div>

        <div className="card p-7">
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            {error && <div className="notice-error">{error}</div>}

            <div>
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary mt-1" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
