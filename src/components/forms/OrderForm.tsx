'use client'
import { useState } from 'react'
import Link from 'next/link'

const PROJECT_TYPES = [
  'Logo Design',
  'Branding Package',
  'FiveM Graphics (Loading Screen / HUD)',
  'Discord Graphics',
  'Social Media Design',
  'Website Visuals',
  'FiveM Server Development',
  'FiveM Script / UI Development',
  'Other',
]

const BUDGETS = ['Under £20', '£20–£50', '£50–£100', '£100–£250', '£250+', 'Not sure']

type Step = 1 | 2 | 3

export default function OrderForm() {
  const [step, setStep] = useState<Step>(1)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    discord: '',
    project_type: '',
    project_name: '',
    design_style: '',
    colors: '',
    budget: '',
    deadline: '',
    references_text: '',
    notes: '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  function validateStep(): string {
    if (step === 1) {
      if (!form.name.trim()) return 'Please enter your name.'
      if (!form.email.trim()) return 'Please enter your email address.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Please enter a valid email address.'
    }
    if (step === 2) {
      if (!form.project_type) return 'Please select a project type.'
    }
    return ''
  }

  function next() {
    const err = validateStep()
    if (err) { setError(err); return }
    setStep((s) => (s + 1) as Step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const err = validateStep()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return }
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div
        className="rounded-3xl p-10 md:p-14 text-center"
        style={{ background: 'var(--surface)', border: '1px solid rgba(239,35,60,.20)' }}
      >
        <div
          className="w-14 h-14 rounded-full grid place-items-center mx-auto mb-6 text-[22px]"
          style={{ background: 'rgba(239,35,60,.12)', border: '1px solid rgba(239,35,60,.22)' }}
        >
          ✓
        </div>
        <h2 className="text-[28px] font-black tracking-tighter mb-3">Order Received!</h2>
        <p className="text-[15px] leading-[1.72] mb-6 max-w-sm mx-auto" style={{ color: 'var(--soft)' }}>
          Thanks, {form.name.split(' ')[0]}! I'll review your brief and get back to you via email
          or Discord within 24–48 hours.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/portfolio" className="btn btn-ghost">View Portfolio</Link>
          <Link href="/" className="btn btn-outline">Back to Home</Link>
        </div>
      </div>
    )
  }

  const steps = ['Your Details', 'Project Info', 'Brief & Notes']

  return (
    <form onSubmit={submit} noValidate>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((label, i) => {
          const n = (i + 1) as Step
          const done = step > n
          const active = step === n
          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-black shrink-0"
                  style={{
                    background: done || active ? 'var(--accent)' : 'var(--surface)',
                    border: `1px solid ${done || active ? 'var(--accent)' : 'var(--border)'}`,
                    color: done || active ? '#fff' : 'var(--muted)',
                  }}
                >
                  {done ? '✓' : n}
                </div>
                <span
                  className="text-[12px] font-black hidden sm:block"
                  style={{ color: active ? '#fff' : 'var(--muted)' }}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px mx-1" style={{ background: 'var(--border)', minWidth: 16 }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="notice-error mb-6">{error}</div>
      )}

      {/* Step 1 — Contact */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <h2 className="text-[22px] font-black tracking-tight mb-2">Your details</h2>

          <div>
            <label className="form-label">Full Name <span style={{ color: 'var(--accent)' }}>*</span></label>
            <input
              className="form-input"
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Matt Wright"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="form-label">Email Address <span style={{ color: 'var(--accent)' }}>*</span></label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="form-label">Discord Username <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input
              className="form-input"
              type="text"
              value={form.discord}
              onChange={(e) => set('discord', e.target.value)}
              placeholder="yourname or yourname#0000"
            />
            <p className="text-[12px] mt-1" style={{ color: 'var(--muted)' }}>
              Preferred for quick communication. Not required.
            </p>
          </div>

          <button type="button" onClick={next} className="btn btn-primary mt-2">
            Continue →
          </button>
        </div>
      )}

      {/* Step 2 — Project Type */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <h2 className="text-[22px] font-black tracking-tight mb-2">Project info</h2>

          <div>
            <label className="form-label">Project Type <span style={{ color: 'var(--accent)' }}>*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {PROJECT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('project_type', type)}
                  className="text-left p-3 rounded-xl text-[13px] font-bold transition-all"
                  style={{
                    background: form.project_type === type ? 'rgba(239,35,60,.12)' : 'var(--surface)',
                    border: `1px solid ${form.project_type === type ? 'rgba(239,35,60,.35)' : 'var(--border)'}`,
                    color: form.project_type === type ? '#fff' : 'var(--soft)',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Project / Brand Name <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input
              className="form-input"
              type="text"
              value={form.project_name}
              onChange={(e) => set('project_name', e.target.value)}
              placeholder="e.g. My FiveM server, Brand name..."
            />
          </div>

          <div>
            <label className="form-label">Budget <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <div className="flex flex-wrap gap-2 mt-2">
              {BUDGETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => set('budget', b)}
                  className="text-[12.5px] font-black px-4 py-2 rounded-full transition-all"
                  style={{
                    background: form.budget === b ? 'rgba(239,35,60,.12)' : 'var(--surface)',
                    border: `1px solid ${form.budget === b ? 'rgba(239,35,60,.30)' : 'var(--border)'}`,
                    color: form.budget === b ? '#fff' : 'var(--muted)',
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Deadline <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input
              className="form-input"
              type="text"
              value={form.deadline}
              onChange={(e) => set('deadline', e.target.value)}
              placeholder="e.g. Within 2 weeks, ASAP, No rush..."
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => setStep(1)} className="btn btn-ghost flex-1">← Back</button>
            <button type="button" onClick={next} className="btn btn-primary flex-[2]">Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3 — Brief */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <h2 className="text-[22px] font-black tracking-tight mb-2">Brief &amp; notes</h2>

          <div>
            <label className="form-label">Design Style / Vibe <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input
              className="form-input"
              type="text"
              value={form.design_style}
              onChange={(e) => set('design_style', e.target.value)}
              placeholder="e.g. Minimalist, dark theme, aggressive, luxury..."
            />
          </div>

          <div>
            <label className="form-label">Colour Preferences <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input
              className="form-input"
              type="text"
              value={form.colors}
              onChange={(e) => set('colors', e.target.value)}
              placeholder="e.g. Red & black, dark blue, no bright colours..."
            />
          </div>

          <div>
            <label className="form-label">References / Inspiration <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              className="form-input"
              rows={3}
              value={form.references_text}
              onChange={(e) => set('references_text', e.target.value)}
              placeholder="Links, descriptions of styles you like, competitors, examples..."
            />
          </div>

          <div>
            <label className="form-label">Additional Notes <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              className="form-input"
              rows={4}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Anything else I should know about the project..."
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => setStep(2)} className="btn btn-ghost flex-1">← Back</button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-[2]"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Submitting...' : 'Submit Order'}
            </button>
          </div>

          <p className="text-[12px] text-center" style={{ color: 'var(--muted)' }}>
            By submitting you agree to be contacted about your project via email or Discord.
          </p>
        </div>
      )}
    </form>
  )
}
