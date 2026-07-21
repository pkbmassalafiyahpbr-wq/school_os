export type Role = 'Administrator' | 'Guru' | 'Kepala Sekolah' | 'Siswa' | 'Orang Tua'

export interface User {
  id: number
  name: string
  username: string
  password: string
  role: Role
  is_active: number
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: number
  nip: string
  full_name: string
  gender: string
  phone: string
  email: string
  address: string
  status: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: number
  nis: string
  nisn: string
  full_name: string
  gender: string
  birth_date: string
  address: string
  parent_name: string
  phone: string
  status: string
  classroom_id: number
  created_at: string
  updated_at: string
}

export interface Classroom {
  id: number
  name: string
  grade: string
  teacher_id: number
  academic_year: string
  created_at: string
}

export interface Subject {
  id: number
  name: string
  description: string
  teacher_id: number
  classroom_id: number
}

export interface Material {
  id: number
  title: string
  description: string
  subject_id: number
  teacher_id: number
  file_url: string
  video_url: string
  published: number
  created_at: string
}

export interface Assignment {
  id: number
  title: string
  description: string
  subject_id: number
  teacher_id: number
  deadline: string
  created_at: string
}

export interface AssignmentSubmission {
  id: number
  assignment_id: number
  student_id: number
  file_url: string
  submitted_at: string
  score: number | null
}

export interface Quiz {
  id: number
  title: string
  subject_id: number
  teacher_id: number
  duration: number
  published: number
  created_at: string
}

export interface Question {
  id: number
  quiz_id: number
  question: string
  type: string
  order_number: number
}

export interface Choice {
  id: number
  question_id: number
  choice: string
  is_correct: number
}

export interface QuizAttempt {
  id: number
  quiz_id: number
  student_id: number
  started_at: string
  finished_at: string | null
  score: number | null
}

export interface StudentAnswer {
  id: number
  attempt_id: number
  question_id: number
  choice_id: number
}

export interface Attendance {
  id: number
  student_id: number
  classroom_id: number
  date: string
  status: string
  remark: string
}

export interface Score {
  id: number
  student_id: number
  subject_id: number
  teacher_id: number
  type: string
  score: number
  created_at: string
}

export interface Notification {
  id: number
  title: string
  message: string
  target_role: string
  read: number
  created_at: string
}

export interface AuditLog {
  id: number
  user_id: number
  action: string
  entity: string
  entity_id: number
  created_at: string
}

export interface TeacherDashboard {
  totalMaterials: number
  totalQuizzes: number
  totalStudents: number
  recentMaterials: Material[]
  recentActivities: ActivityItem[]
}

export interface PrincipalDashboard {
  totalTeachers: number
  totalStudents: number
  totalMaterials: number
  totalQuizzes: number
  averageScore: number
  attendanceRate: number
  teacherActivities: ActivityItem[]
  recentActivities: ActivityItem[]
  topTeachers: { id: number; name: string; materialsCount: number; quizzesCount: number; averageScore: number }[]
  topClasses: { id: number; name: string; studentCount: number; averageScore: number }[]
  semesterProgress: number
  totalSubjects: number
  recentMaterials: Material[]
}

export interface StudentDashboard {
  totalMaterials: number
  totalQuizzes: number
  completedQuizzes: number
  averageScore: number
  recentMaterials: Material[]
  upcomingQuizzes: Quiz[]
}

export interface ActivityItem {
  id: number
  action: string
  entity: string
  user_name: string
  created_at: string
}
