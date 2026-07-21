import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getDatabase } from '@/database'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Guru' && session.role !== 'Administrator' && session.role !== 'Kepala Sekolah') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const db = getDatabase()

  const attempts = db.prepare(`
    SELECT qa.id, qa.score, qa.started_at, qa.finished_at,
           st.full_name as student_name, c.name as classroom_name
    FROM quiz_attempts qa
    JOIN students st ON qa.student_id = st.id
    LEFT JOIN classrooms c ON st.classroom_id = c.id
    WHERE qa.quiz_id = ? AND qa.finished_at IS NOT NULL
    ORDER BY qa.finished_at DESC
  `).all(Number(id))

  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get() as any
  const completedCount = db.prepare('SELECT COUNT(*) as count FROM quiz_attempts WHERE quiz_id = ? AND finished_at IS NOT NULL').get(Number(id)) as any

  return NextResponse.json({
    attempts,
    totalStudents: totalStudents.count,
    completedCount: completedCount.count,
  })
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Guru' && session.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const db = getDatabase()
  const body = await _request.json()

  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(Number(id)) as any
  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })

  const student = db.prepare('SELECT * FROM students WHERE full_name = ?').get(body.student_name) as any
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const existing = db.prepare('SELECT id FROM scores WHERE student_id = ? AND subject_id = ? AND type = ?').get(student.id, quiz.subject_id, 'Quiz')
  if (existing) {
    db.prepare('UPDATE scores SET score = ? WHERE id = ?').run(body.score, (existing as any).id)
  } else {
    const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(session.id) as any
    db.prepare('INSERT INTO scores (student_id, subject_id, teacher_id, type, score) VALUES (?, ?, ?, ?, ?)').run(student.id, quiz.subject_id, teacher?.id || quiz.teacher_id, 'Quiz', body.score)
  }

  db.prepare('INSERT INTO audit_logs (user_id, action, entity, entity_id) VALUES (?, ?, ?, ?)').run(session.id, 'Input Nilai Quiz', 'Score', (existing as any)?.id || 0)

  return NextResponse.json({ success: true })
}
