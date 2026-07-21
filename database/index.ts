import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
const SCHEMA = `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,username TEXT NOT NULL UNIQUE,password TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('Administrator','Guru','Kepala Sekolah','Siswa','Orang Tua')),is_active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime')));CREATE TABLE IF NOT EXISTS teachers (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER,nip TEXT NOT NULL UNIQUE,full_name TEXT NOT NULL,gender TEXT NOT NULL DEFAULT 'Laki-laki',phone TEXT,email TEXT,address TEXT,status TEXT NOT NULL DEFAULT 'Aktif',created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime')));CREATE TABLE IF NOT EXISTS classrooms (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,grade TEXT NOT NULL,teacher_id INTEGER NOT NULL,academic_year TEXT NOT NULL DEFAULT '2025/2026',created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),FOREIGN KEY (teacher_id) REFERENCES teachers(id));CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER,nis TEXT NOT NULL UNIQUE,nisn TEXT NOT NULL UNIQUE,full_name TEXT NOT NULL,gender TEXT NOT NULL DEFAULT 'Laki-laki',birth_date TEXT,address TEXT,parent_name TEXT,phone TEXT,status TEXT NOT NULL DEFAULT 'Aktif',classroom_id INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),FOREIGN KEY (classroom_id) REFERENCES classrooms(id));CREATE TABLE IF NOT EXISTS subjects (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,description TEXT,teacher_id INTEGER NOT NULL,classroom_id INTEGER,FOREIGN KEY (teacher_id) REFERENCES teachers(id),FOREIGN KEY (classroom_id) REFERENCES classrooms(id));CREATE TABLE IF NOT EXISTS materials (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,description TEXT,subject_id INTEGER NOT NULL,teacher_id INTEGER NOT NULL,file_url TEXT,video_url TEXT,published INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),FOREIGN KEY (subject_id) REFERENCES subjects(id),FOREIGN KEY (teacher_id) REFERENCES teachers(id));CREATE TABLE IF NOT EXISTS assignments (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,description TEXT,subject_id INTEGER NOT NULL,teacher_id INTEGER NOT NULL,deadline TEXT,created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),FOREIGN KEY (subject_id) REFERENCES subjects(id),FOREIGN KEY (teacher_id) REFERENCES teachers(id));CREATE TABLE IF NOT EXISTS assignment_submissions (id INTEGER PRIMARY KEY AUTOINCREMENT,assignment_id INTEGER NOT NULL,student_id INTEGER NOT NULL,file_url TEXT,submitted_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),score REAL,FOREIGN KEY (assignment_id) REFERENCES assignments(id),FOREIGN KEY (student_id) REFERENCES students(id));CREATE TABLE IF NOT EXISTS quizzes (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,subject_id INTEGER NOT NULL,teacher_id INTEGER NOT NULL,duration INTEGER NOT NULL DEFAULT 10,published INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),FOREIGN KEY (subject_id) REFERENCES subjects(id),FOREIGN KEY (teacher_id) REFERENCES teachers(id));CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT,quiz_id INTEGER NOT NULL,question TEXT NOT NULL,type TEXT NOT NULL DEFAULT 'multiple_choice',order_number INTEGER NOT NULL DEFAULT 0,FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE);CREATE TABLE IF NOT EXISTS choices (id INTEGER PRIMARY KEY AUTOINCREMENT,question_id INTEGER NOT NULL,choice TEXT NOT NULL,is_correct INTEGER NOT NULL DEFAULT 0,FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE);CREATE TABLE IF NOT EXISTS quiz_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT,quiz_id INTEGER NOT NULL,student_id INTEGER NOT NULL,started_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),finished_at TEXT,score REAL,FOREIGN KEY (quiz_id) REFERENCES quizzes(id),FOREIGN KEY (student_id) REFERENCES students(id));CREATE TABLE IF NOT EXISTS student_answers (id INTEGER PRIMARY KEY AUTOINCREMENT,attempt_id INTEGER NOT NULL,question_id INTEGER NOT NULL,choice_id INTEGER NOT NULL,FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id),FOREIGN KEY (question_id) REFERENCES questions(id),FOREIGN KEY (choice_id) REFERENCES choices(id));CREATE TABLE IF NOT EXISTS attendances (id INTEGER PRIMARY KEY AUTOINCREMENT,student_id INTEGER NOT NULL,classroom_id INTEGER NOT NULL,date TEXT NOT NULL DEFAULT (date('now','localtime')),status TEXT NOT NULL CHECK(status IN ('Present','Absent','Sick','Permission')),remark TEXT,FOREIGN KEY (student_id) REFERENCES students(id),FOREIGN KEY (classroom_id) REFERENCES classrooms(id));CREATE TABLE IF NOT EXISTS scores (id INTEGER PRIMARY KEY AUTOINCREMENT,student_id INTEGER NOT NULL,subject_id INTEGER NOT NULL,teacher_id INTEGER NOT NULL,type TEXT NOT NULL CHECK(type IN ('Daily','Assignment','Quiz','PTS','PAS')),score REAL NOT NULL,created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),FOREIGN KEY (student_id) REFERENCES students(id),FOREIGN KEY (subject_id) REFERENCES subjects(id),FOREIGN KEY (teacher_id) REFERENCES teachers(id));CREATE TABLE IF NOT EXISTS material_views (id INTEGER PRIMARY KEY AUTOINCREMENT,material_id INTEGER NOT NULL,student_id INTEGER NOT NULL,viewed_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),FOREIGN KEY (material_id) REFERENCES materials(id),FOREIGN KEY (student_id) REFERENCES students(id));CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,message TEXT NOT NULL,target_role TEXT,read INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')));CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,action TEXT NOT NULL,entity TEXT NOT NULL,entity_id INTEGER,created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),FOREIGN KEY (user_id) REFERENCES users(id));CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);CREATE INDEX IF NOT EXISTS idx_students_classroom ON students(classroom_id);CREATE INDEX IF NOT EXISTS idx_teachers_nip ON teachers(nip);CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject_id);CREATE INDEX IF NOT EXISTS idx_materials_teacher ON materials(teacher_id);CREATE INDEX IF NOT EXISTS idx_quizzes_subject ON quizzes(subject_id);CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id);CREATE INDEX IF NOT EXISTS idx_scores_student ON scores(student_id);CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(date);`

const isVercel = process.env.VERCEL === '1'
const DB_PATH = isVercel ? '/tmp/school.db' : path.join(process.cwd(), 'data', 'school.db')

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (db) return db

  try {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    db = new Database(DB_PATH)
    db.pragma('journal_mode = DELETE')
    db.pragma('foreign_keys = ON')
    db.exec(SCHEMA)

    const existing = db.prepare('SELECT COUNT(*) as c FROM users').get() as any
    if (!existing?.c) seedData()

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
