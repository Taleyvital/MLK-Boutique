import { createServerClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return Response.json([])

  const supabase = createServerClient()
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, price, compare_price, images')
    .eq('is_active', true)
    .ilike('name', `%${q}%`)
    .order('created_at', { ascending: false })
    .limit(10)

  return Response.json(data ?? [])
}
