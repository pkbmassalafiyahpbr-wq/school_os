import { userRepo, materialRepo, quizRepo, questionRepo, choiceRepo, attemptRepo, studentAnswerRepo, scoreRepo, subjectRepo, notificationRepo, auditRepo, dashboardRepo } from '@/repositories'
import { getDatabase } from '@/database'
import type { User, Role } from '@/types'

export const authService = {
  login(username: string, password: string): User | null {
    const user = userRepo.findByUsername(username)
    if (!user || user.password !== password || !user.is_active) return null
    auditRepo.create({ user_id: user.id, action: 'Login', entity: 'User', entity_id: user.id })
    return user
  },

  getUser(id: number): User | null {
    return userRepo.findById(id) || null
  },

  getDemoAccounts() {
    const db = getDatabase()
    const users = db.prepare('SELECT name, username, role FROM users WHERE is_active = 1 ORDER BY role, name').all() as { name: string; username: string; role: string }[]
    return users.map(u => ({
      name: u.name.length > 25 ? u.name.substring(0, 22) + '...' : u.name,
      username: u.username,
      role: u.role as Role,
    }))
  },
}

export const materialService = {
  getAll() {
    return materialRepo.findAll()
  },

  getById(id: number) {
    return materialRepo.findById(id)
  },

  getByTeacher(teacherId: number) {
    return materialRepo.findByTeacherId(teacherId)
  },

  getPublished() {
    return materialRepo.findPublished()
  },

  create(data: { title: string; description?: string; subject_id: number; teacher_id: number; video_url?: string }, userId: number) {
    const id = materialRepo.create(data)
    auditRepo.create({ user_id: userId, action: 'Buat Materi', entity: 'Material', entity_id: id })
    notificationRepo.create({ title: 'Materi Baru', message: `Materi "${data.title}" telah tersedia`, target_role: 'Siswa' })
    return id
  },

  update(id: number, data: { title?: string; description?: string; subject_id?: number; video_url?: string }, userId: number) {
    materialRepo.update(id, data)
    auditRepo.create({ user_id: userId, action: 'Ubah Materi', entity: 'Material', entity_id: id })
  },

  delete(id: number, userId: number) {
    materialRepo.delete(id)
    auditRepo.create({ user_id: userId, action: 'Hapus Materi', entity: 'Material', entity_id: id })
  },

  publish(id: number, publish: boolean, userId: number) {
    materialRepo.publish(id, publish ? 1 : 0)
    auditRepo.create({ user_id: userId, action: publish ? 'Publikasi Materi' : 'Unpublish Materi', entity: 'Material', entity_id: id })
  },
}

export const quizService = {
  getAll() {
    return quizRepo.findAll()
  },

  getById(id: number) {
    return quizRepo.findById(id)
  },

  getByTeacher(teacherId: number) {
    return quizRepo.findByTeacherId(teacherId)
  },

  getPublished() {
    return quizRepo.findPublished()
  },

  getQuestions(quizId: number) {
    const questions = questionRepo.findByQuizId(quizId)
    return questions.map(q => ({
      ...q,
      choices: choiceRepo.findByQuestionId(q.id),
    }))
  },

  create(data: { title: string; subject_id: number; teacher_id: number; duration: number }, userId: number) {
    const id = quizRepo.create(data)
    auditRepo.create({ user_id: userId, action: 'Buat Quiz', entity: 'Quiz', entity_id: id })
    return id
  },

  update(id: number, data: { title?: string; subject_id?: number; duration?: number }, userId: number) {
    quizRepo.update(id, data)
    auditRepo.create({ user_id: userId, action: 'Ubah Quiz', entity: 'Quiz', entity_id: id })
  },

  delete(id: number, userId: number) {
    quizRepo.delete(id)
    auditRepo.create({ user_id: userId, action: 'Hapus Quiz', entity: 'Quiz', entity_id: id })
  },

  publish(id: number, publish: boolean, userId: number) {
    quizRepo.publish(id, publish ? 1 : 0)
    auditRepo.create({ user_id: userId, action: publish ? 'Publikasi Quiz' : 'Unpublish Quiz', entity: 'Quiz', entity_id: id })
  },

  addQuestion(quizId: number, data: { question: string; type: string; order_number: number; choices: { choice: string; is_correct: number }[] }) {
    const questionId = questionRepo.create({ quiz_id: quizId, ...data })
    for (const c of data.choices) {
      choiceRepo.create({ question_id: questionId, ...c })
    }
    return questionId
  },

  removeQuestion(questionId: number) {
    choiceRepo.deleteByQuestionId(questionId)
    questionRepo.delete(questionId)
  },

  startAttempt(quizId: number, studentId: number) {
    const existing = attemptRepo.findByStudentAndQuiz(studentId, quizId)
    if (existing && !existing.finished_at) return existing
    const id = attemptRepo.create({ quiz_id: quizId, student_id: studentId })
    return attemptRepo.findById(id)!
  },

  getAttempt(attemptId: number) {
    return attemptRepo.findById(attemptId)
  },

  submitAttempt(attemptId: number, answers: { question_id: number; choice_id: number }[]) {
    for (const a of answers) {
      studentAnswerRepo.create({ attempt_id: attemptId, ...a })
    }

    const attempt = attemptRepo.findById(attemptId)!
    const questions = questionRepo.findByQuizId(attempt.quiz_id)
    let correctCount = 0

    for (const q of questions) {
      const choices = choiceRepo.findByQuestionId(q.id)
      const correctChoice = choices.find(c => c.is_correct)
      const studentChoice = answers.find(a => a.question_id === q.id)
      if (correctChoice && studentChoice && studentChoice.choice_id === correctChoice.id) {
        correctCount++
      }
    }

    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
    attemptRepo.finish(attemptId, score)

    const quiz = quizRepo.findById(attempt.quiz_id)!
    scoreRepo.create({
      student_id: attempt.student_id,
      subject_id: quiz.subject_id,
      teacher_id: quiz.teacher_id,
      type: 'Quiz',
      score,
    })

    auditRepo.create({ user_id: attempt.student_id, action: 'Submit Quiz', entity: 'QuizAttempt', entity_id: attemptId })

    return { ...attempt, score, correctCount, totalQuestions: questions.length }
  },
}

export const dashboardService = {
  getTeacher(teacherId: number) {
    return dashboardRepo.getTeacherDashboard(teacherId)
  },

  getStudent(studentId: number) {
    return dashboardRepo.getStudentDashboard(studentId)
  },

  getPrincipal() {
    return dashboardRepo.getPrincipalDashboard()
  },
}

export const subjectService = {
  getAll() {
    return subjectRepo.findAll()
  },

  getByTeacher(teacherId: number) {
    return subjectRepo.findByTeacherId(teacherId)
  },
}
