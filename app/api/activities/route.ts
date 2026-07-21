import { NextResponse } from 'next/server'
import { auditRepo } from '@/repositories'
import { requireAuth } from '@/lib/session'

export async function GET() {
  await requireAuth()
  const activities = auditRepo.findRecent(20)
  return NextResponse.json(activities)
}
