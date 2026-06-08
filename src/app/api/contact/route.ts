import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    await query(
      `INSERT INTO messages (name, email, subject, message) VALUES ($1,$2,$3,$4)`,
      [name.trim(), email.trim().toLowerCase(), subject?.trim() || null, message.trim()]
    )

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '💬 New Contact Message',
            color: 0x5865f2,
            fields: [
              { name: 'Name',    value: name.trim(),              inline: true },
              { name: 'Email',   value: email.trim(),             inline: true },
              subject && { name: 'Subject', value: subject.trim(), inline: false },
              { name: 'Message', value: message.trim().slice(0, 1500), inline: false },
            ].filter(Boolean),
            timestamp: new Date().toISOString(),
            footer: { text: 'mattwright.online — Contact Form' },
          }],
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
