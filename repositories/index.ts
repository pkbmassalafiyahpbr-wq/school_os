import { getDatabase } from '@/database'
import type { User, Material, Quiz, Question, Choice, QuizAttempt, StudentAnswer, Score, Teacher, Student, Classroom, Subject, Notification, AuditLog, ActivityItem, TeacherDashboard, PrincipalDashboard, StudentDashboard } from '@/types'

const db = () => getDatabase()

export const userRepo = {
  findByUsername(username: string): User | undefined {
    return db().prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined
  },

  findById(id: number): User | undefined {
    return db().prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined
  },

  findByName(name: string): User | undefined {
    return db().prepare('SELECT * FROM users WHERE name = ?').get(name) as User | undefined
  },
}

export const materialRepo = {
  findAll(): Material[] {
    return db().prepare(`
      SELECT m.*, s.name as subject_name, t.full_name as teacher_name
      FROM materials m
      LEFT JOIN subjects s ON m.subject_id = s.id
      LEFT JOIN teachers t ON m.teacher_id = t.id
      ORDER BY m.created_at DESC
    `).all() as Material[]
  },

  findById(id: number): Material | undefined {
    return db().prepare(`
      SELECT m.*, s.name as subject_name, t.full_name as teacher_name
      FROM materials m
      LEFT JOIN subjects s ON m.subject_id = s.id
      LEFT JOIN teachers t ON m.teacher_id = t.id
      WHERE m.id = ?
    `).get(id) as Material | undefined
  },

  findByTeacherId(teacherId: number): Material[] {
    return db().prepare(`
      SELECT m.*, s.name as subject_name
      FROM materials m
      LEFT JOIN subjects s ON m.subject_id = s.id
      WHERE m.teacher_id = ?
      ORDER BY m.created_at DESC
    `).all(teacherId) as Material[]
  },

  findPublished(): Material[] {
    return db().prepare(`
      SELECT m.*, s.name as subject_name, t.full_name as teacher_name
      FROM materials m
      LEFT JOIN subjects s ON m.subject_id = s.id
      LEFT JOIN teachers t ON m.teacher_id = t.id
      WHERE m.published = 1
      ORDER BY m.created_at DESC
    `).all() as Material[]
  },

  create(data: { title: string; description?: string; subject_id: number; teacher_id: number; video_url?: string }): number {
    const result = db().prepare(`
      INSERT INTO materials (title, description, subject_id, teacher_id, video_url)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.title, data.description || null, data.subject_id, data.teacher_id, data.video_url || null)
    return result.lastInsertRowid as number
  },

  update(id: number, data: { title?: string; description?: string; subject_id?: number; video_url?: string }): void {
    const fields: string[] = []
    const values: any[] = []
    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
    if (data.subject_id !== undefined) { fields.push('subject_id = ?'); values.push(data.subject_id) }
    if (data.video_url !== undefined) { fields.push('video_url = ?'); values.push(data.video_url) }
    if (fields.length === 0) return
    values.push(id)
    db().prepare(`UPDATE materials SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  },

  delete(id: number): void {
    db().prepare('DELETE FROM materials WHERE id = ?').run(id)
  },

  publish(id: number, published: number): void {
    db().prepare('UPDATE materials SET published = ? WHERE id = ?').run(published, id)
  },

  count(): number {
    return (db().prepare('SELECT COUNT(*) as count FROM materials').get() as any).count
  },

  countByTeacher(teacherId: number): number {
    return (db().prepare('SELECT COUNT(*) as count FROM materials WHERE teacher_id = ?').get(teacherId) as any).count
  },
}

export const quizRepo = {
  findAll(): Quiz[] {
    return db().prepare(`
      SELECT q.*, s.name as subject_name, t.full_name as teacher_name
      FROM quizzes q
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN teachers t ON q.teacher_id = t.id
      ORDER BY q.created_at DESC
    `).all() as Quiz[]
  },

  findById(id: number): Quiz | undefined {
    return db().prepare(`
      SELECT q.*, s.name as subject_name, t.full_name as teacher_name
      FROM quizzes q
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN teachers t ON q.teacher_id = t.id
      WHERE q.id = ?
    `).get(id) as Quiz | undefined
  },

  findByTeacherId(teacherId: number): Quiz[] {
    return db().prepare(`
      SELECT q.*, s.name as subject_name
      FROM quizzes q
      LEFT JOIN subjects s ON q.subject_id = s.id
      WHERE q.teacher_id = ?
      ORDER BY q.created_at DESC
    `).all(teacherId) as Quiz[]
  },

  findPublished(): Quiz[] {
    return db().prepare(`
      SELECT q.*, s.name as subject_name, t.full_name as teacher_name
      FROM quizzes q
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN teachers t ON q.teacher_id = t.id
      WHERE q.published = 1
      ORDER BY q.created_at DESC
    `).all() as Quiz[]
  },

  create(data: { title: string; subject_id: number; teacher_id: number; duration: number }): number {
    const result = db().prepare(`
      INSERT INTO quizzes (title, subject_id, teacher_id, duration)
      VALUES (?, ?, ?, ?)
    `).run(data.title, data.subject_id, data.teacher_id, data.duration)
    return result.lastInsertRowid as number
  },

  update(id: number, data: { title?: string; subject_id?: number; duration?: number }): void {
    const fields: string[] = []
    const values: any[] = []
    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
    if (data.subject_id !== undefined) { fields.push('subject_id = ?'); values.push(data.subject_id) }
    if (data.duration !== undefined) { fields.push('duration = ?'); values.push(data.duration) }
    if (fields.length === 0) return
    values.push(id)
    db().prepare(`UPDATE quizzes SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  },

  delete(id: number): void {
    db().prepare('DELETE FROM quizzes WHERE id = ?').run(id)
  },

  publish(id: number, published: number): void {
    db().prepare('UPDATE quizzes SET published = ? WHERE id = ?').run(published, id)
  },

  count(): number {
    return (db().prepare('SELECT COUNT(*) as count FROM quizzes').get() as any).count
  },
}

export const questionRepo = {
  findByQuizId(quizId: number): Question[] {
    return db().prepare(`
      SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_number ASC
    `).all(quizId) as Question[]
  },

  findById(id: number): Question | undefined {
    return db().prepare('SELECT * FROM questions WHERE id = ?').get(id) as Question | undefined
  },

  create(data: { quiz_id: number; question: string; type: string; order_number: number }): number {
    const result = db().prepare(`
      INSERT INTO questions (quiz_id, question, type, order_number)
      VALUES (?, ?, ?, ?)
    `).run(data.quiz_id, data.question, data.type, data.order_number)
    return result.lastInsertRowid as number
  },

  update(id: number, data: { question?: string; type?: string; order_number?: number }): void {
    const fields: string[] = []
    const values: any[] = []
    if (data.question !== undefined) { fields.push('question = ?'); values.push(data.question) }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type) }
    if (data.order_number !== undefined) { fields.push('order_number = ?'); values.push(data.order_number) }
    if (fields.length === 0) return
    values.push(id)
    db().prepare(`UPDATE questions SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  },

  delete(id: number): void {
    db().prepare('DELETE FROM questions WHERE id = ?').run(id)
  },

  deleteByQuizId(quizId: number): void {
    db().prepare('DELETE FROM questions WHERE quiz_id = ?').run(quizId)
  },
}

export const choiceRepo = {
  findByQuestionId(questionId: number): Choice[] {
    return db().prepare('SELECT * FROM choices WHERE question_id = ?').all(questionId) as Choice[]
  },

  findById(id: number): Choice | undefined {
    return db().prepare('SELECT * FROM choices WHERE id = ?').get(id) as Choice | undefined
  },

  findByQuizId(quizId: number): (Choice & { question_id: number })[] {
    return db().prepare(`
      SELECT c.* FROM choices c
      JOIN questions q ON c.question_id = q.id
      WHERE q.quiz_id = ?
    `).all(quizId) as (Choice & { question_id: number })[]
  },

  create(data: { question_id: number; choice: string; is_correct: number }): number {
    const result = db().prepare(`
      INSERT INTO choices (question_id, choice, is_correct)
      VALUES (?, ?, ?)
    `).run(data.question_id, data.choice, data.is_correct)
    return result.lastInsertRowid as number
  },

  deleteByQuestionId(questionId: number): void {
    db().prepare('DELETE FROM choices WHERE question_id = ?').run(questionId)
  },
}

export const attemptRepo = {
  create(data: { quiz_id: number; student_id: number }): number {
    const result = db().prepare(`
      INSERT INTO quiz_attempts (quiz_id, student_id)
      VALUES (?, ?)
    `).run(data.quiz_id, data.student_id)
    return result.lastInsertRowid as number
  },

  findById(id: number): QuizAttempt | undefined {
    return db().prepare('SELECT * FROM quiz_attempts WHERE id = ?').get(id) as QuizAttempt | undefined
  },

  findByStudentAndQuiz(studentId: number, quizId: number): QuizAttempt | undefined {
    return db().prepare(`
      SELECT * FROM quiz_attempts WHERE student_id = ? AND quiz_id = ?
    `).get(studentId, quizId) as QuizAttempt | undefined
  },

  findByStudentId(studentId: number): QuizAttempt[] {
    return db().prepare(`
      SELECT qa.*, q.title as quiz_title, q.subject_id, s.name as subject_name
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      WHERE qa.student_id = ?
      ORDER BY qa.started_at DESC
    `).all(studentId) as QuizAttempt[]
  },

  finish(id: number, score: number): void {
    db().prepare(`
      UPDATE quiz_attempts SET finished_at = datetime('now','localtime'), score = ? WHERE id = ?
    `).run(score, id)
  },
}

export const studentAnswerRepo = {
  create(data: { attempt_id: number; question_id: number; choice_id: number }): number {
    const result = db().prepare(`
      INSERT INTO student_answers (attempt_id, question_id, choice_id)
      VALUES (?, ?, ?)
    `).run(data.attempt_id, data.question_id, data.choice_id)
    return result.lastInsertRowid as number
  },

  findByAttemptId(attemptId: number): StudentAnswer[] {
    return db().prepare('SELECT * FROM student_answers WHERE attempt_id = ?').all(attemptId) as StudentAnswer[]
  },
}

export const scoreRepo = {
  create(data: { student_id: number; subject_id: number; teacher_id: number; type: string; score: number }): number {
    const result = db().prepare(`
      INSERT INTO scores (student_id, subject_id, teacher_id, type, score)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.student_id, data.subject_id, data.teacher_id, data.type, data.score)
    return result.lastInsertRowid as number
  },

  findByStudentId(studentId: number): Score[] {
    return db().prepare(`
      SELECT sc.*, s.name as subject_name
      FROM scores sc
      LEFT JOIN subjects s ON sc.subject_id = s.id
      WHERE sc.student_id = ?
      ORDER BY sc.created_at DESC
    `).all(studentId) as Score[]
  },

  findByTeacherId(teacherId: number): Score[] {
    return db().prepare(`
      SELECT sc.*, s.name as subject_name, st.full_name as student_name
      FROM scores sc
      LEFT JOIN subjects s ON sc.subject_id = s.id
      LEFT JOIN students st ON sc.student_id = st.id
      WHERE sc.teacher_id = ?
      ORDER BY sc.created_at DESC
    `).all(teacherId) as Score[]
  },

  average(): number {
    const result = db().prepare('SELECT AVG(score) as avg FROM scores').get() as any
    return result.avg || 0
  },
}

export const teacherRepo = {
  findAll(): Teacher[] {
    return db().prepare('SELECT * FROM teachers ORDER BY full_name ASC').all() as Teacher[]
  },

  findById(id: number): Teacher | undefined {
    return db().prepare('SELECT * FROM teachers WHERE id = ?').get(id) as Teacher | undefined
  },

  count(): number {
    return (db().prepare('SELECT COUNT(*) as count FROM teachers').get() as any).count
  },
}

export const studentRepo = {
  findAll(): Student[] {
    return db().prepare(`
      SELECT st.*, c.name as classroom_name
      FROM students st
      LEFT JOIN classrooms c ON st.classroom_id = c.id
      ORDER BY st.full_name ASC
    `).all() as Student[]
  },

  findById(id: number): Student | undefined {
    return db().prepare(`
      SELECT st.*, c.name as classroom_name
      FROM students st
      LEFT JOIN classrooms c ON st.classroom_id = c.id
      WHERE st.id = ?
    `).get(id) as Student | undefined
  },

  count(): number {
    return (db().prepare('SELECT COUNT(*) as count FROM students').get() as any).count
  },
}

export const classroomRepo = {
  findAll(): Classroom[] {
    return db().prepare('SELECT * FROM classrooms ORDER BY name ASC').all() as Classroom[]
  },

  findById(id: number): Classroom | undefined {
    return db().prepare('SELECT * FROM classrooms WHERE id = ?').get(id) as Classroom | undefined
  },
}

export const subjectRepo = {
  findAll(): Subject[] {
    return db().prepare(`
      SELECT s.*, t.full_name as teacher_name
      FROM subjects s
      LEFT JOIN teachers t ON s.teacher_id = t.id
    `).all() as Subject[]
  },

  findByTeacherId(teacherId: number): Subject[] {
    return db().prepare('SELECT * FROM subjects WHERE teacher_id = ?').all(teacherId) as Subject[]
  },

  findById(id: number): Subject | undefined {
    return db().prepare('SELECT * FROM subjects WHERE id = ?').get(id) as Subject | undefined
  },
}

export const notificationRepo = {
  findByRole(role: string): Notification[] {
    return db().prepare(`
      SELECT * FROM notifications
      WHERE target_role = ? OR target_role = 'all'
      ORDER BY created_at DESC
    `).all(role) as Notification[]
  },

  create(data: { title: string; message: string; target_role: string }): number {
    const result = db().prepare(`
      INSERT INTO notifications (title, message, target_role)
      VALUES (?, ?, ?)
    `).run(data.title, data.message, data.target_role)
    return result.lastInsertRowid as number
  },

  markRead(id: number): void {
    db().prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id)
  },

  unreadCount(role: string): number {
    return (db().prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE (target_role = ? OR target_role = 'all') AND read = 0
    `).get(role) as any).count
  },
}

export const auditRepo = {
  create(data: { user_id: number; action: string; entity: string; entity_id?: number }): number {
    const result = db().prepare(`
      INSERT INTO audit_logs (user_id, action, entity, entity_id)
      VALUES (?, ?, ?, ?)
    `).run(data.user_id, data.action, data.entity, data.entity_id || null)
    return result.lastInsertRowid as number
  },

  findRecent(limit = 10): ActivityItem[] {
    return db().prepare(`
      SELECT a.*, u.name as user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ?
    `).all(limit) as ActivityItem[]
  },

  findByUserId(userId: number, limit = 10): ActivityItem[] {
    return db().prepare(`
      SELECT a.*, u.name as user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT ?
    `).all(userId, limit) as ActivityItem[]
  },
}

export const dashboardRepo = {
  getTeacherDashboard(teacherId: number): TeacherDashboard {
    const totalMaterials = materialRepo.countByTeacher(teacherId)
    const totalQuizzes = quizRepo.findByTeacherId(teacherId).length

    const teacher = teacherRepo.findById(teacherId)
    let totalStudents = 0
    if (teacher) {
      const classrooms = db().prepare('SELECT id FROM classrooms WHERE teacher_id = ?').all(teacherId) as any[]
      for (const c of classrooms) {
        totalStudents += (db().prepare('SELECT COUNT(*) as count FROM students WHERE classroom_id = ?').get(c.id) as any).count
      }
    }

    const recentMaterials = db().prepare(`
      SELECT m.*, s.name as subject_name
      FROM materials m
      LEFT JOIN subjects s ON m.subject_id = s.id
      WHERE m.teacher_id = ?
      ORDER BY m.created_at DESC LIMIT 5
    `).all(teacherId) as Material[]

    const recentActivities = auditRepo.findByUserId(
      (db().prepare('SELECT id FROM users WHERE name = (SELECT full_name FROM teachers WHERE id = ?)').get(teacherId) as any)?.id || 0,
      5
    )

    return { totalMaterials, totalQuizzes, totalStudents, recentMaterials, recentActivities }
  },

  getStudentDashboard(studentId: number): StudentDashboard {
    const student = studentRepo.findById(studentId)
    if (!student) throw new Error('Student not found')

    const totalMaterials = materialRepo.findPublished().length
    const attempts = attemptRepo.findByStudentId(studentId)
    const totalQuizzes = attempts.length
    const completedQuizzes = attempts.filter(a => a.finished_at).length
    const averageScore = completedQuizzes > 0
      ? attempts.filter(a => a.score).reduce((sum, a) => sum + (a.score || 0), 0) / completedQuizzes
      : 0

    const recentMaterials = materialRepo.findPublished().slice(0, 5)
    const upcomingQuizzes = quizRepo.findPublished().slice(0, 5)

    return { totalMaterials, totalQuizzes, completedQuizzes, averageScore, recentMaterials, upcomingQuizzes }
  },

  getPrincipalDashboard(): PrincipalDashboard {
    const totalTeachers = teacherRepo.count()
    const totalStudents = studentRepo.count()
    const totalMaterials = materialRepo.count()
    const totalQuizzes = quizRepo.count()
    const totalSubjects = db().prepare('SELECT COUNT(*) as count FROM subjects').get() as any
    const averageScore = scoreRepo.average()

    const totalAttendance = db().prepare('SELECT COUNT(*) as count FROM attendances').get() as any
    const presentAttendance = db().prepare("SELECT COUNT(*) as count FROM attendances WHERE status = 'Present'").get() as any
    const attendanceRate = totalAttendance.count > 0 ? (presentAttendance.count / totalAttendance.count) * 100 : 0

    const teacherActivities = auditRepo.findRecent(10)
    const recentActivities = auditRepo.findRecent(10)
    const recentMaterials = materialRepo.findAll().slice(0, 5)

    const topTeachers = db().prepare(`
      SELECT t.id, t.full_name as name,
        (SELECT COUNT(*) FROM materials WHERE teacher_id = t.id) as materialsCount,
        (SELECT COUNT(*) FROM quizzes WHERE teacher_id = t.id) as quizzesCount,
        COALESCE((SELECT ROUND(AVG(sc.score)) FROM scores sc WHERE sc.teacher_id = t.id), 0) as averageScore
      FROM teachers t
      ORDER BY averageScore DESC
      LIMIT 5
    `).all() as any[]

    const topClasses = db().prepare(`
      SELECT c.id, c.name,
        (SELECT COUNT(*) FROM students WHERE classroom_id = c.id) as studentCount,
        COALESCE((SELECT ROUND(AVG(qa.score)) FROM quiz_attempts qa JOIN students s ON qa.student_id = s.id WHERE s.classroom_id = c.id), 0) as averageScore
      FROM classrooms c
      ORDER BY averageScore DESC
      LIMIT 5
    `).all() as any[]

    const semesterProgress = (() => {
      const now = new Date()
      const start = new Date(now.getFullYear(), 6, 1)
      const end = new Date(now.getFullYear(), 11, 31)
      if (now < start) return 0
      if (now > end) return 100
      return Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100)
    })()

    return { totalTeachers, totalStudents, totalMaterials, totalQuizzes, averageScore, attendanceRate, teacherActivities, recentActivities, topTeachers, topClasses, semesterProgress, totalSubjects: totalSubjects.count, recentMaterials }
  },
}
