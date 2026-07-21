import { NextResponse } from 'next/server'
import { dashboardService, subjectService } from '@/services'
import { requireAuth, getCurrentUser } from '@/lib/session'
import { getDatabase } from '@/database'

export async function GET() {
  const session = await requireAuth()
  if (session.role !== 'Guru') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = getDatabase()
  const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(session.id) as any

  if (!teacher) {
    return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
  }

  const dashboard = dashboardService.getTeacher(teacher.id)
  const subjects = subjectService.getByTeacher(teacher.id)
  return NextResponse.json({ ...dashboard, subjects, teacher_id: teacher.id })
}
