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

  const username = body.full_name.toLowerCase().replace(/\s+/g, '_')
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existingUser) return NextResponse.json({ error: `Username "${username}" sudah ada` }, { status: 409 })

  const insertUser = db.prepare('INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)')
  const userResult = insertUser.run(body.full_name, username, '123', 'Siswa')
  const userId = userResult.lastInsertRowid as number

  const count = (db.prepare('SELECT COUNT(*) as c FROM students').get() as any).c
  const nis = `2025${String(count + 1).padStart(4, '0')}`

  const insertStudent = db.prepare('INSERT INTO students (nis, nisn, full_name, gender, classroom_id) VALUES (?, ?, ?, ?, ?)')
  const studentResult = insertStudent.run(nis, nis, body.full_name, body.gender || 'Laki-laki', Number(body.classroom_id))
  const studentId = studentResult.lastInsertRowid as number

  db.prepare('UPDATE students SET user_id = ? WHERE id = ?').run(userId, studentId)

  db.prepare('INSERT INTO audit_logs (user_id, action, entity, entity_id) VALUES (?, ?, ?, ?)').run(session.id, 'Tambah Siswa', 'Student', studentId)

  const classroom = db.prepare('SELECT name FROM classrooms WHERE id = ?').get(Number(body.classroom_id)) as any
  db.prepare('INSERT INTO notifications (title, message, target_role) VALUES (?, ?, ?)').run('Siswa Baru', `${body.full_name} telah terdaftar di ${classroom?.name || '-'}`, 'all')

  return NextResponse.json({ id: studentId, username, password: '123' }, { status: 201 })
}

export async function GET() {
  const session = await requireAuth()
  if (session.role !== 'Kepala Sekolah' && session.role !== 'Administrator' && session.role !== 'Guru') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = getDatabase()

  if (session.role === 'Guru') {
    const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(session.id) as any
    if (!teacher) return NextResponse.json([])

    const classrooms = db.prepare(`
      SELECT id, name FROM classrooms WHERE teacher_id = ?
      UNION
      SELECT DISTINCT c.id, c.name FROM subjects s JOIN classrooms c ON s.classroom_id = c.id WHERE s.teacher_id = ?
    `).all(teacher.id, teacher.id) as any[]

    if (!classrooms.length) return NextResponse.json([])

    const classroomIds = classrooms.map((c: any) => c.id)
    const placeholders = classroomIds.map(() => '?').join(',')

    const students = db.prepare(`
      SELECT st.*, c.name as classroom_name, c.id as classroom_id
      FROM students st
      JOIN classrooms c ON st.classroom_id = c.id
      WHERE st.classroom_id IN (${placeholders})
      ORDER BY c.name, st.full_name ASC
    `).all(...classroomIds)

    return NextResponse.json({ students, classrooms })
  }

  const students = db.prepare(`
    SELECT st.*, c.name as classroom_name, c.id as classroom_id
    FROM students st
    LEFT JOIN classrooms c ON st.classroom_id = c.id
    ORDER BY st.full_name ASC
  `).all()

  return NextResponse.json({ students })
}
