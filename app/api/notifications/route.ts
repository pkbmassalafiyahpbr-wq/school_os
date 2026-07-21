import { NextResponse } from 'next/server'
import { notificationRepo } from '@/repositories'
import { requireAuth } from '@/lib/session'

export async function GET() {
  const session = await requireAuth()
  const notifications = notificationRepo.findByRole(session.role)
  const unreadCount = notificationRepo.unreadCount(session.role)
  return NextResponse.json({ notifications, unreadCount })
}
