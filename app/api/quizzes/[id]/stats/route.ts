import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getDatabase } from '@/database'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Kepala Sekolah' && session.role !== 'Administrator' && session.role !== 'Guru') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const db = getDatabase()

  const quiz = db.prepare('SELECT q.*, s.name as subject_name, t.full_name as teacher_name FROM quizzes q LEFT JOIN subjects s ON q.subject_id = s.id LEFT JOIN teachers t ON q.teacher_id = t.id WHERE q.id = ?').get(Number(id))

  const attempts = db.prepare(`
    SELECT qa.id, qa.score, qa.finished_at, qa.started_at,
           st.full_name as student_name, st.id as student_id
    FROM quiz_attempts qa
    JOIN students st ON qa.student_id = st.id
    WHERE qa.quiz_id = ? AND qa.finished_at IS NOT NULL
    ORDER BY qa.score DESC
  `).all(Number(id))

  const totalAttempts = (attempts as any[]).length
  const scores = (attempts as any[]).map(a => a.score).filter((s): s is number => s !== null)
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

  return NextResponse.json({
    quiz,
    stats: {
      totalAttempts,
      averageScore,
      highestScore,
      lowestScore,
    },
    attempts,
  })
}
