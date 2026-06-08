import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, setAdminCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const adminEmail    = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Admin not configured.' }, { status: 500 })
    }

    if (
      email?.trim().toLowerCase() !== adminEmail.toLowerCase() ||
      password !== adminPassword
    ) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    const token = createSessionToken()
    await setAdminCookie(token)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
