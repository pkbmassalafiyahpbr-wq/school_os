import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getDatabase } from '@/database'

export async function POST(request: Request) {
  const session = await requireAuth()
  if (session.role !== 'Guru' && session.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = getDatabase()
  const body = await request.json()
  const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(session.id) as any
  if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

  db.prepare('INSERT INTO scores (student_id, subject_id, teacher_id, type, score) VALUES (?, ?, ?, ?, ?)').run(
    body.student_id, body.subject_id, teacher.id, body.type, Number(body.score)
  )

  db.prepare('INSERT INTO audit_logs (user_id, action, entity, entity_id) VALUES (?, ?, ?, ?)').run(
    session.id, 'Input Nilai', 'Score', 0
  )

  return NextResponse.json({ success: true })
}

export async function GET() {
  const session = await requireAuth()
  const db = getDatabase()

  if (session.role === 'Siswa') {
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(session.id) as any
    if (!student) return NextResponse.json([])

    const attempts = db.prepare(`
      SELECT qa.id, qa.score, qa.finished_at, qa.started_at,
             q.title as quiz_title, q.duration,
             s.name as subject_name
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      WHERE qa.student_id = ? AND qa.finished_at IS NOT NULL
      ORDER BY qa.finished_at DESC
    `).all(student.id)

    return NextResponse.json(attempts)
  }

  if (session.role === 'Guru') {
    const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(session.id) as any
    if (!teacher) return NextResponse.json([])

    const scores = db.prepare(`
      SELECT sc.id, sc.score, sc.type, sc.created_at,
             s.name as subject_name,
             st.full_name as student_name
      FROM scores sc
      LEFT JOIN subjects s ON sc.subject_id = s.id
      LEFT JOIN students st ON sc.student_id = st.id
      WHERE sc.teacher_id = ?
      ORDER BY sc.created_at DESC
      LIMIT 50
    `).all(teacher.id)

    return NextResponse.json(scores)
  }

  return NextResponse.json([])
}
