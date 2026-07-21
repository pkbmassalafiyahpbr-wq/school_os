import { NextResponse } from 'next/server'
import { quizService } from '@/services'
import { requireAuth } from '@/lib/session'
import { getDatabase } from '@/database'

export async function GET() {
  const session = await requireAuth()
  let quizzes
  if (session.role === 'Siswa') {
    quizzes = quizService.getPublished()
  } else if (session.role === 'Guru') {
    const db = getDatabase()
    const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(session.id) as any
    if (teacher) {
      quizzes = quizService.getByTeacher(teacher.id)
    } else {
      quizzes = quizService.getAll()
    }
  } else {
    quizzes = quizService.getAll()
  }
  return NextResponse.json(quizzes)
}

export async function POST(request: Request) {
  const session = await requireAuth()
  if (session.role !== 'Guru' && session.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    let teacherId = body.teacher_id
    if (!teacherId && session.role === 'Guru') {
      const db = getDatabase()
      const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(session.id) as any
      teacherId = teacher?.id
    }

    const id = quizService.create(
      {
        title: body.title,
        subject_id: body.subject_id,
        teacher_id: teacherId || session.id,
        duration: body.duration || 10,
      },
      session.id
    )
    return NextResponse.json({ id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
