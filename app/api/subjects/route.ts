import { NextResponse } from 'next/server'
import { subjectService } from '@/services'
import { requireAuth } from '@/lib/session'
import { getDatabase } from '@/database'

export async function GET() {
  const session = await requireAuth()
  let subjects
  if (session.role === 'Guru') {
    const db = getDatabase()
    const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(session.id) as any
    if (teacher) {
      subjects = subjectService.getByTeacher(teacher.id)
    } else {
      subjects = subjectService.getAll()
    }
  } else {
    subjects = subjectService.getAll()
  }
  return NextResponse.json(subjects)
}
