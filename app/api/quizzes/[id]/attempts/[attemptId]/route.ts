import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getDatabase } from '@/database'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; attemptId: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Guru' && session.role !== 'Administrator' && session.role !== 'Kepala Sekolah') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, attemptId } = await params
  const db = getDatabase()

  const attempt = db.prepare(`
    SELECT qa.*, st.full_name as student_name, c.name as classroom_name
    FROM quiz_attempts qa
    JOIN students st ON qa.student_id = st.id
    LEFT JOIN classrooms c ON st.classroom_id = c.id
    WHERE qa.id = ? AND qa.quiz_id = ?
  `).get(Number(attemptId), Number(id)) as any

  if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const answers = db.prepare(`
    SELECT sa.id, sa.question_id, sa.choice_id,
           q.question as question_text, q.order_number,
           c.choice as chosen_text,
           (SELECT choice FROM choices WHERE id = sa.choice_id) as chosen_answer,
           (SELECT choice FROM choices WHERE question_id = q.id AND is_correct = 1) as correct_answer,
           (SELECT is_correct FROM choices WHERE id = sa.choice_id) as is_correct
    FROM student_answers sa
    JOIN questions q ON sa.question_id = q.id
    JOIN choices c ON sa.choice_id = c.id
    WHERE sa.attempt_id = ?
    ORDER BY q.order_number
  `).all(Number(attemptId))

  const allQuestions = db.prepare(`
    SELECT q.*,
      (SELECT choice FROM choices WHERE question_id = q.id AND is_correct = 1) as correct_answer
    FROM questions q
    WHERE q.quiz_id = ?
    ORDER BY q.order_number
  `).all(Number(id))

  return NextResponse.json({
    attempt,
    answers,
    allQuestions,
    correctCount: (answers as any[]).filter(a => a.is_correct).length,
    totalQuestions: allQuestions.length,
  })
}
