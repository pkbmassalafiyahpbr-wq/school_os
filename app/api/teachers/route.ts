import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getDatabase } from '@/database'

export async function GET() {
  const session = await requireAuth()
  if (session.role !== 'Kepala Sekolah' && session.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = getDatabase()
  const teachers = db.prepare(`
    SELECT t.*, u.username,
      (SELECT COUNT(*) FROM subjects WHERE teacher_id = t.id) as subject_count,
      (SELECT COUNT(*) FROM materials WHERE teacher_id = t.id) as material_count
    FROM teachers t
    LEFT JOIN users u ON t.user_id = u.id
    ORDER BY t.full_name ASC
  `).all()

  return NextResponse.json(teachers)
}
