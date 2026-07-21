import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const isVercel = process.env.VERCEL === '1'
const DB_PATH = isVercel ? '/tmp/school.db' : path.join(process.cwd(), 'data', 'school.db')

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (db) return db

  try {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const exists = fs.existsSync(DB_PATH)
    db = new Database(DB_PATH)
    db.pragma('journal_mode = DELETE')
    db.pragma('foreign_keys = ON')

    if (!exists || isVercel) {
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql')
      const schema = fs.readFileSync(schemaPath, 'utf-8')
      db.exec(schema)
      seedData()
    }

    return db
  } catch (err: any) {
    console.error('[DB] Init error:', err?.message || err)
    throw err
  }
}

export function seedData() {
  if (!db) return

  const teachers = [
    { nip: '196501011990011001', full_name: 'Siti Rahmawati, S.Pd.', gender: 'Perempuan', phone: '081234567891', email: 'siti@sdnsiliasih.sch.id', address: 'Jl. Merdeka No. 1, Siliasih' },
    { nip: '197002021995021002', full_name: 'Ahmad Hidayat, S.Pd.', gender: 'Laki-laki', phone: '081234567892', email: 'ahmad@sdnsiliasih.sch.id', address: 'Jl. Merdeka No. 2, Siliasih' },
    { nip: '198003032000031003', full_name: 'Rina Marlina, S.Pd.', gender: 'Perempuan', phone: '081234567893', email: 'rina@sdnsiliasih.sch.id', address: 'Jl. Merdeka No. 3, Siliasih' },
  ]
  const insertTeacher = db.prepare('INSERT INTO teachers (nip, full_name, gender, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)')
  for (const t of teachers) insertTeacher.run(t.nip, t.full_name, t.gender, t.phone, t.email, t.address)

  const insertClassroom = db.prepare('INSERT INTO classrooms (name, grade, teacher_id, academic_year) VALUES (?, ?, ?, ?)')
  for (const c of [
    { name: '1A', grade: '1', teacher_id: 1, academic_year: '2025/2026' },
    { name: '2A', grade: '2', teacher_id: 2, academic_year: '2025/2026' },
    { name: '3A', grade: '3', teacher_id: 3, academic_year: '2025/2026' },
    { name: '4A', grade: '4', teacher_id: 1, academic_year: '2025/2026' },
    { name: '5A', grade: '5', teacher_id: 2, academic_year: '2025/2026' },
    { name: '6A', grade: '6', teacher_id: 3, academic_year: '2025/2026' },
  ]) insertClassroom.run(c.name, c.grade, c.teacher_id, c.academic_year)

  const studentNames = [
    'Ahmad Fauzi', 'Budi Santoso', 'Citra Dewi', 'Dian Permata', 'Eko Prasetyo',
    'Fitri Handayani', 'Gilang Ramadhan', 'Hesti Puspita', 'Indra Lesmana', 'Joko Susilo',
    'Kartika Sari', 'Lukman Hakim', 'Mega Wati', 'Nugroho Adi', 'Olivia Hernanda',
    'Pramudya Kurniawan', 'Qisthi Aulia', 'Rizky Pratama', 'Sari Dewi', 'Teguh Wibowo',
    'Umi Kalsum', 'Vina Amalia', 'Wahyu Setiawan', 'Xaverius Dwi', 'Yuni Astuti',
    'Zainul Arifin', 'Ani Rahayu', 'Bambang Supriyadi', 'Cici Parmawati', 'Deni Kurniawan',
  ]
  const insertStudent = db.prepare('INSERT INTO students (nis, nisn, full_name, gender, classroom_id) VALUES (?, ?, ?, ?, ?)')
  for (let i = 0; i < studentNames.length; i++) insertStudent.run(`2025${String(i + 1).padStart(4, '0')}`, `00${String(i + 1).padStart(8, '0')}`, studentNames[i], i % 2 === 0 ? 'Laki-laki' : 'Perempuan', (i % 6) + 1)

  const insertSubject = db.prepare('INSERT INTO subjects (name, description, teacher_id, classroom_id) VALUES (?, ?, ?, ?)')
  for (const s of [
    { name: 'Bahasa Indonesia', teacher_id: 1, classroom_id: 1 },
    { name: 'Matematika', teacher_id: 1, classroom_id: 1 },
    { name: 'IPA', teacher_id: 2, classroom_id: 2 },
    { name: 'IPS', teacher_id: 2, classroom_id: 2 },
    { name: 'PPKn', teacher_id: 3, classroom_id: 3 },
    { name: 'SBdP', teacher_id: 3, classroom_id: 3 },
  ]) insertSubject.run(s.name, `${s.name} description`, s.teacher_id, s.classroom_id)

  const insertUser = db.prepare('INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)')
  const userIds: number[] = []
  for (const u of [
    { name: 'Kepala Sekolah', username: 'kepsek', role: 'Kepala Sekolah' },
    { name: 'Siti Rahmawati, S.Pd.', username: 'siti', role: 'Guru' },
    { name: 'Ahmad Hidayat, S.Pd.', username: 'ahmad', role: 'Guru' },
    { name: 'Rina Marlina, S.Pd.', username: 'rina', role: 'Guru' },
    { name: 'Administrator', username: 'admin', role: 'Administrator' },
  ]) userIds.push(insertUser.run(u.name, u.username, '123', u.role).lastInsertRowid as number)
  db.prepare('UPDATE teachers SET user_id = ? WHERE id = ?').run(userIds[1], 1)
  db.prepare('UPDATE teachers SET user_id = ? WHERE id = ?').run(userIds[2], 2)
  db.prepare('UPDATE teachers SET user_id = ? WHERE id = ?').run(userIds[3], 3)

  const usedUsernames = new Set<string>()
  for (const name of studentNames) {
    let username = name.toLowerCase().replace(/\s+/g, '_')
    while (usedUsernames.has(username)) username += '_1'
    usedUsernames.add(username)
    const id = insertUser.run(name, username, '123', 'Siswa').lastInsertRowid as number
    db.prepare('UPDATE students SET user_id = ? WHERE full_name = ?').run(id, name)
  }

  const insertMaterial = db.prepare('INSERT INTO materials (title, description, subject_id, teacher_id, video_url, published) VALUES (?, ?, ?, ?, ?, ?)')
  for (const m of [
    { title: 'Pengertian Bilangan', subject_id: 2, teacher_id: 1, published: 1, video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { title: 'Penjumlahan dan Pengurangan', subject_id: 2, teacher_id: 1, published: 1, video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { title: 'Perkalian dan Pembagian', subject_id: 2, teacher_id: 1, published: 1 },
    { title: 'Tata Surya', subject_id: 3, teacher_id: 2, published: 1, video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { title: 'Sistem Pencernaan Manusia', subject_id: 3, teacher_id: 2, published: 1 },
    { title: 'Ekosistem', subject_id: 3, teacher_id: 2, published: 0 },
    { title: 'Pahlawan Nasional', subject_id: 4, teacher_id: 2, published: 1 },
    { title: 'Keragaman Budaya Indonesia', subject_id: 4, teacher_id: 2, published: 1 },
    { title: 'Pancasila', subject_id: 5, teacher_id: 3, published: 1, video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { title: 'Seni Melipat Kertas', subject_id: 6, teacher_id: 3, published: 1 },
  ]) insertMaterial.run(m.title, `${m.title} description`, m.subject_id, m.teacher_id, m.video_url || null, m.published)

  const insertQuiz = db.prepare('INSERT INTO quizzes (title, subject_id, teacher_id, duration, published) VALUES (?, ?, ?, ?, ?)')
  for (const q of [
    { title: 'Kuis Matematika - Bilangan', subject_id: 2, teacher_id: 1, duration: 10, published: 1 },
    { title: 'Kuis IPA - Tata Surya', subject_id: 3, teacher_id: 2, duration: 10, published: 1 },
    { title: 'Kuis PPKn - Pancasila', subject_id: 5, teacher_id: 3, duration: 5, published: 1 },
  ]) insertQuiz.run(q.title, q.subject_id, q.teacher_id, q.duration, q.published)

  const questionsData = [
    { quiz_id: 1, questions: [
      { q: 'Berapakah hasil dari 5 + 3?', choices: ['6', '7', '8', '9'], correct: 2 },
      { q: 'Berapakah hasil dari 10 - 4?', choices: ['5', '6', '7', '8'], correct: 1 },
      { q: 'Berapakah hasil dari 3 × 4?', choices: ['10', '11', '12', '13'], correct: 2 },
      { q: 'Berapakah hasil dari 15 ÷ 3?', choices: ['3', '5', '7', '9'], correct: 1 },
      { q: 'Manakah yang merupakan bilangan genap?', choices: ['3', '5', '7', '8'], correct: 3 },
    ]},
    { quiz_id: 2, questions: [
      { q: 'Berapa jumlah planet dalam tata surya?', choices: ['7', '8', '9', '10'], correct: 1 },
      { q: 'Planet terdekat dengan matahari adalah?', choices: ['Venus', 'Merkurius', 'Bumi', 'Mars'], correct: 1 },
      { q: 'Planet terbesar dalam tata surya adalah?', choices: ['Saturnus', 'Neptunus', 'Jupiter', 'Uranus'], correct: 2 },
      { q: 'Bumi membutuhkan waktu berapa hari untuk mengelilingi matahari?', choices: ['365', '360', '24', '7'], correct: 0 },
      { q: 'Satelit alami Bumi adalah?', choices: ['Mars', 'Venus', 'Bulan', 'Matahari'], correct: 2 },
    ]},
    { quiz_id: 3, questions: [
      { q: 'Pancasila terdiri dari berapa sila?', choices: ['3', '4', '5', '6'], correct: 2 },
      { q: 'Sila pertama Pancasila berbunyi?', choices: ['Kemanusiaan', 'Persatuan', 'Ketuhanan Yang Maha Esa', 'Keadilan'], correct: 2 },
      { q: 'Lambang sila kedua Pancasila adalah?', choices: ['Bintang', 'Rantai', 'Pohon Beringin', 'Kepala Banteng'], correct: 1 },
      { q: 'Warna putih pada lambang Garuda melambangkan?', choices: ['Keberanian', 'Kesucian', 'Persatuan', 'Keadilan'], correct: 1 },
      { q: 'Tanggal Pancasila ditetapkan?', choices: ['17 Agustus 1945', '1 Juni 1945', '18 Agustus 1945', '28 Oktober 1928'], correct: 1 },
    ]},
  ]
  const insertQuestion = db.prepare('INSERT INTO questions (quiz_id, question, type, order_number) VALUES (?, ?, ?, ?)')
  const insertChoice = db.prepare('INSERT INTO choices (question_id, choice, is_correct) VALUES (?, ?, ?)')
  for (const qGroup of questionsData) {
    for (let i = 0; i < qGroup.questions.length; i++) {
      const q = qGroup.questions[i]
      const result = insertQuestion.run(qGroup.quiz_id, q.q, 'multiple_choice', i + 1)
      const questionId = result.lastInsertRowid as number
      for (let j = 0; j < q.choices.length; j++) insertChoice.run(questionId, q.choices[j], j === q.correct ? 1 : 0)
    }
  }

  const insertNotif = db.prepare('INSERT INTO notifications (title, message, target_role) VALUES (?, ?, ?)')
  insertNotif.run('Selamat Datang di School OS', 'Platform pembelajaran digital SDN 1 Siliasih siap digunakan', 'all')
  insertNotif.run('Materi Baru: Tata Surya', 'Materi baru Tata Surya telah dipublikasikan', 'Siswa')
  insertNotif.run('Kuis Baru: Matematika', 'Kerjakan kuis Matematika tentang Bilangan', 'Siswa')

  const insertAttempt = db.prepare('INSERT INTO quiz_attempts (quiz_id, student_id, score, started_at, finished_at) VALUES (?, ?, ?, ?, ?)')
  const insertStudentAnswer = db.prepare('INSERT INTO student_answers (attempt_id, question_id, choice_id) VALUES (?, ?, ?)')
  const questions = db.prepare('SELECT * FROM questions').all() as any[]
  const allChoices = db.prepare('SELECT * FROM choices').all() as any[]

  function getCorrectChoice(questionId: number) { return allChoices.find((c: any) => c.question_id === questionId && c.is_correct) }
  function getRandomIncorrectChoice(questionId: number, correctId: number) {
    const wrong = allChoices.filter((c: any) => c.question_id === questionId && c.id !== correctId)
    return wrong[Math.floor(Math.random() * wrong.length)]
  }

  const seedStudents = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
  for (let quizId = 1; quizId <= 3; quizId++) {
    const quizQuestions = questions.filter((q: any) => q.quiz_id === quizId)
    const questionCount = quizQuestions.length
    const shuffled = [...seedStudents].sort(() => Math.random() - 0.5)
    const participants = shuffled.slice(0, 8 + Math.floor(Math.random() * 10))

    for (const studentId of participants) {
      let correctCount = 0
      const answers: { questionId: number; choiceId: number }[] = []
      for (const question of quizQuestions) {
        const correctChoice = getCorrectChoice(question.id)
        if (!correctChoice) continue
        const isCorrect = Math.random() < 0.55 + Math.random() * 0.3
        if (isCorrect) { correctCount++; answers.push({ questionId: question.id, choiceId: correctChoice.id }) }
        else { const w = getRandomIncorrectChoice(question.id, correctChoice.id); answers.push({ questionId: question.id, choiceId: w?.id || correctChoice.id }) }
      }
      const score = Math.round((correctCount / questionCount) * 100)
      const now = new Date()
      const d = Math.floor(Math.random() * 14)
      const s = new Date(now.getTime() - d * 86400000 - 600000)
      const f = new Date(s.getTime() + 300000 + Math.random() * 300000)
      const r = insertAttempt.run(quizId, studentId, score, s.toISOString(), f.toISOString())
      for (const a of answers) insertStudentAnswer.run(r.lastInsertRowid as number, a.questionId, a.choiceId)
    }
  }

  const insertScore = db.prepare('INSERT INTO scores (student_id, quiz_id, attempt_id, score, type, teacher_id, subject_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
  const attempts = db.prepare('SELECT qa.id, qa.student_id, qa.quiz_id, qa.score, q.teacher_id, q.subject_id FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id WHERE qa.finished_at IS NOT NULL').all() as any[]
  for (const a of attempts) insertScore.run(a.student_id, a.quiz_id, a.id, a.score, 'quiz', a.teacher_id, a.subject_id)

  const insertAudit = db.prepare('INSERT INTO audit_logs (user_id, action, entity, entity_id) VALUES (?, ?, ?, ?)')
  insertAudit.run(1, 'Login', 'User', 1)
  insertAudit.run(2, 'Buat Materi', 'Material', 1)
  insertAudit.run(3, 'Buat Quiz', 'Quiz', 1)
  insertAudit.run(5, 'Generate Data Demo', 'System', 0)
}

export function initializeSchema() {
  getDatabase()
}
