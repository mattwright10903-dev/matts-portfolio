'use client'
import { useState } from 'react'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  function set(field: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim())    { setError('Please enter your name.'); return }
    if (!form.email.trim())   { setError('Please enter your email.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email.'); return }
    if (!form.message.trim()) { setError('Please enter a message.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return }
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--surface)', border: '1px solid rgba(239,35,60,.18)' }}>
        <div
          className="w-12 h-12 rounded-full grid place-items-center mx-auto mb-5 text-[18px]"
          style={{ background: 'rgba(239,35,60,.12)', border: '1px solid rgba(239,35,60,.22)' }}
        >
          ✓
        </div>
        <h3 className="font-black tracking-tight text-[20px] mb-2">Message sent!</h3>
        <p className="text-[14px]" style={{ color: 'var(--soft)' }}>
          Thanks {form.name.split(' ')[0]}. I'll get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {error && <div className="notice-error">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Name <span style={{ color: 'var(--accent)' }}>*</span></label>
          <input className="form-input" type="text" value={form.name}
            onChange={(e) => set('name', e.target.value)} placeholder="Your name" autoComplete="name" />
        </div>
        <div>
          <label className="form-label">Email <span style={{ color: 'var(--accent)' }}>*</span></label>
          <input className="form-input" type="email" value={form.email}
            onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
        </div>
      </div>

      <div>
        <label className="form-label">Subject <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
        <input className="form-input" type="text" value={form.subject}
          onChange={(e) => set('subject', e.target.value)} placeholder="What's it about?" />
      </div>

      <div>
        <label className="form-label">Message <span style={{ color: 'var(--accent)' }}>*</span></label>
        <textarea className="form-input" rows={5} value={form.message}
          onChange={(e) => set('message', e.target.value)} placeholder="Tell me about your project or question..." />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
