import { NextResponse } from 'next/server'
import { dashboardService } from '@/services'
import { requireAuth } from '@/lib/session'

export async function GET() {
  const session = await requireAuth()
  if (session.role !== 'Kepala Sekolah' && session.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const dashboard = dashboardService.getPrincipal()
  return NextResponse.json(dashboard)
}
