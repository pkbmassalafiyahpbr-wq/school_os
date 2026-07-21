import { NextResponse } from 'next/server'
import { materialService, subjectService } from '@/services'
import { requireAuth } from '@/lib/session'
import { getDatabase } from '@/database'

export async function GET() {
  const session = await requireAuth()
  let materials
  if (session.role === 'Siswa') {
    materials = materialService.getPublished()
  } else if (session.role === 'Guru') {
    const db = getDatabase()
    const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(session.id) as any
    if (teacher) {
      materials = materialService.getByTeacher(teacher.id)
    } else {
      materials = materialService.getAll()
    }
  } else {
    materials = materialService.getAll()
  }
  return NextResponse.json(materials)
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

    const id = materialService.create(
      {
        title: body.title,
        description: body.description,
        subject_id: body.subject_id,
        teacher_id: teacherId || session.id,
        video_url: body.video_url,
      },
      session.id
    )
    return NextResponse.json({ id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
