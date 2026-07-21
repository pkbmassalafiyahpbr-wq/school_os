import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getDatabase } from '@/database'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Siswa') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const db = getDatabase()

  const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(session.id) as any
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const existing = db.prepare('SELECT id FROM material_views WHERE material_id = ? AND student_id = ?').get(Number(id), student.id)
  if (!existing) {
    db.prepare('INSERT INTO material_views (material_id, student_id) VALUES (?, ?)').run(Number(id), student.id)
  }

  return NextResponse.json({ success: true })
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Guru' && session.role !== 'Administrator' && session.role !== 'Kepala Sekolah') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const db = getDatabase()

  const views = db.prepare(`
    SELECT mv.id, mv.viewed_at, st.full_name as student_name, c.name as classroom_name
    FROM material_views mv
    JOIN students st ON mv.student_id = st.id
    LEFT JOIN classrooms c ON st.classroom_id = c.id
    WHERE mv.material_id = ?
    ORDER BY mv.viewed_at DESC
  `).all(Number(id))

  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get() as any

  return NextResponse.json({
    views,
    totalStudents: totalStudents.count,
    viewedCount: (views as any[]).length,
  })
}
