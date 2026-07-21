export const ROLES = {
  ADMINISTRATOR: 'Administrator' as const,
  GURU: 'Guru' as const,
  KEPALA_SEKOLAH: 'Kepala Sekolah' as const,
  SISWA: 'Siswa' as const,
  ORANG_TUA: 'Orang Tua' as const,
}

export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  SICK: 'Sick',
  PERMISSION: 'Permission',
} as const

export const SCORE_TYPES = {
  DAILY: 'Daily',
  ASSIGNMENT: 'Assignment',
  QUIZ: 'Quiz',
  PTS: 'PTS',
  PAS: 'PAS',
} as const

export const NAV_ITEMS = {
  Guru: [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Materi', href: '/materials', icon: 'BookOpen' },
    { label: 'Quiz', href: '/quiz', icon: 'ClipboardList' },
    { label: 'Nilai', href: '/scores', icon: 'Award' },
    { label: 'Profil', href: '/profile', icon: 'User' },
  ],
  Siswa: [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Belajar', href: '/materials', icon: 'BookOpen' },
    { label: 'Quiz', href: '/quiz', icon: 'ClipboardList' },
    { label: 'Nilai', href: '/scores', icon: 'Award' },
    { label: 'Profil', href: '/profile', icon: 'User' },
  ],
  'Kepala Sekolah': [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Statistik', href: '/statistics', icon: 'BarChart3' },
    { label: 'Monitoring', href: '/monitoring', icon: 'Monitor' },
    { label: 'Profil', href: '/profile', icon: 'User' },
  ],
  Administrator: [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Guru', href: '/teachers', icon: 'Users' },
    { label: 'Siswa', href: '/students', icon: 'GraduationCap' },
    { label: 'Kelas', href: '/classrooms', icon: 'Building2' },
    { label: 'Laporan', href: '/reports', icon: 'FileText' },
  ],
} as const

export const DEMO_USERS = [
  { name: 'Kepala Sekolah', username: 'kepsek', password: '123', role: 'Kepala Sekolah' as const },
  { name: 'Bu Siti', username: 'siti', password: '123', role: 'Guru' as const },
  { name: 'Pak Ahmad', username: 'ahmad', password: '123', role: 'Guru' as const },
  { name: 'Bu Rina', username: 'rina', password: '123', role: 'Guru' as const },
  { name: 'Admin', username: 'admin', password: '123', role: 'Administrator' as const },
  { name: 'Budi Santos', username: 'budi', password: '123', role: 'Siswa' as const },
  { name: 'Siti Nurhaliza', username: 'sitin', password: '123', role: 'Siswa' as const },
  { name: 'Ahmad Rizki', username: 'rizki', password: '123', role: 'Siswa' as const },
  { name: 'Dewi Lestari', username: 'dewi', password: '123', role: 'Siswa' as const },
  { name: 'Rudi Hartono', username: 'rudi', password: '123', role: 'Siswa' as const },
]
