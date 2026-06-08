import crypto from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME   = 'mw_admin'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function secret(): string {
  return process.env.SESSION_SECRET ?? 'dev-secret-please-change-in-production'
}

export function createSessionToken(): string {
  const payload = `mw_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('hex').slice(0, 24)
  return `${payload}.${sig}`
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token?.startsWith('mw_')) return false
  const dot = token.lastIndexOf('.')
  if (dot === -1) return false
  const payload  = token.slice(0, dot)
  const sig      = token.slice(dot + 1)
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('hex').slice(0, 24)
  if (sig.length !== expected.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function isAdminAuth(): Promise<boolean> {
  const store = await cookies()
  return verifySessionToken(store.get(COOKIE_NAME)?.value)
}

export async function setAdminCookie(token: string): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   COOKIE_MAX_AGE,
    path:     '/',
  })
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export { COOKIE_NAME }
