import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const products = await query(
      `SELECT id, title, category, short_desc, price, original_price, image_url, tags
       FROM store_products
       WHERE published = true
       ORDER BY sort_order ASC, created_at DESC`
    )
    return NextResponse.json(products)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
