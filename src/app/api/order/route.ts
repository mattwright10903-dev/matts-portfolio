import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

interface OrderBody {
  name: string
  email: string
  discord?: string
  project_type: string
  project_name?: string
  design_style?: string
  colors?: string
  budget?: string
  deadline?: string
  references_text?: string
  notes?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: OrderBody = await req.json()

    const { name, email, discord, project_type, project_name, design_style, colors, budget, deadline, references_text, notes } = body

    if (!name?.trim() || !email?.trim() || !project_type?.trim()) {
      return NextResponse.json({ error: 'Name, email, and project type are required.' }, { status: 400 })
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRx.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    await query(
      `INSERT INTO custom_orders
        (name, email, discord, project_type, project_name, design_style, colors, budget, deadline, references_text, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        discord?.trim() || null,
        project_type.trim(),
        project_name?.trim() || null,
        design_style?.trim() || null,
        colors?.trim() || null,
        budget?.trim() || null,
        deadline?.trim() || null,
        references_text?.trim() || null,
        notes?.trim() || null,
      ]
    )

    // Discord webhook notification
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (webhookUrl) {
      const fields = [
        { name: 'Name',         value: name.trim(),                           inline: true },
        { name: 'Email',        value: email.trim(),                          inline: true },
        { name: 'Project Type', value: project_type.trim(),                   inline: true },
        discord     && { name: 'Discord',      value: discord.trim(),         inline: true },
        project_name && { name: 'Project Name', value: project_name.trim(),   inline: true },
        budget      && { name: 'Budget',        value: budget.trim(),          inline: true },
        deadline    && { name: 'Deadline',      value: deadline.trim(),        inline: true },
        design_style && { name: 'Style',        value: design_style.trim(),    inline: false },
        colors      && { name: 'Colors',        value: colors.trim(),          inline: false },
        references_text && { name: 'References', value: references_text.trim().slice(0, 1000), inline: false },
        notes       && { name: 'Notes',         value: notes.trim().slice(0, 1000), inline: false },
      ].filter(Boolean)

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '🎨 New Custom Order',
            color: 0xef233c,
            fields,
            timestamp: new Date().toISOString(),
            footer: { text: 'mattwright.online — Custom Order' },
          }],
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
