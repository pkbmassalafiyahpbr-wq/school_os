'use client'

import { useAuthStore } from '@/hooks/use-auth'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, ClipboardList, Users, GraduationCap, TrendingUp, Activity, BookCheck, UserCheck, ArrowRight, Clock, Eye, BarChart3, Calendar, Megaphone } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumb } from '@/shared/breadcrumb'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  if (user?.role === 'Guru') return <TeacherDashboard />
  if (user?.role === 'Siswa') return <StudentDashboard />
  if (user?.role === 'Kepala Sekolah' || user?.role === 'Administrator') return <PrincipalDashboard />
  return null
}

const statCardLinks: Record<string, string> = {
  Materi: '/materials',
  Quiz: '/quiz',
  'Nilai': '/scores',
  Siswa: '/students',
  Guru: '/teachers',
  Mapel: '/subjects',
}

function StatCard({ title, value, icon: Icon, color = 'blue' }: { title: string; value: string | number; icon: any; color?: string }) {
  const colors: Record<string, { card: string; icon: string; text: string }> = {
    blue: { card: 'bg-blue-50 border-blue-100', icon: 'bg-blue-500 text-white', text: 'text-blue-700' },
    green: { card: 'bg-emerald-50 border-emerald-100', icon: 'bg-emerald-500 text-white', text: 'text-emerald-700' },
    orange: { card: 'bg-orange-50 border-orange-100', icon: 'bg-orange-500 text-white', text: 'text-orange-700' },
    purple: { card: 'bg-purple-50 border-purple-100', icon: 'bg-purple-500 text-white', text: 'text-purple-700' },
  }
  const link = statCardLinks[title]
  const content = (
    <div className={`rounded-xl border ${colors[color].card} p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colors[color].icon} shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className={`text-3xl font-bold ${colors[color].text}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
    </div>
  )
  return link ? <Link href={link}>{content}</Link> : content
}

function SectionCard({ title, icon: Icon, color = 'blue', children }: { title: string; icon: any; color?: string; children: React.ReactNode }) {
  const colors: Record<string, string> = { blue: 'text-blue-600', green: 'text-emerald-600', orange: 'text-orange-600', purple: 'text-purple-600' }
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
        <Icon className={`h-4 w-4 ${colors[color]}`} />
        <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  )
}

function TeacherDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-teacher'],
    queryFn: () => fetch('/api/dashboard/teacher').then(r => r.json()),
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Selamat datang, berikut ringkasan aktivitas mengajar Anda.</p>
        </div>
        <Link href="/materials" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Kelola Materi <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? <SkeletonGrid /> : (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard title="Materi" value={data?.totalMaterials || 0} icon={BookOpen} color="blue" />
            <StatCard title="Quiz" value={data?.totalQuizzes || 0} icon={ClipboardList} color="orange" />
            <StatCard title="Siswa" value={data?.totalStudents || 0} icon={GraduationCap} color="green" />
            <StatCard title="Mapel" value={data?.subjects?.length || 0} icon={BookCheck} color="purple" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Materi Terbaru" icon={BookOpen} color="blue">
              {data?.recentMaterials?.length ? data.recentMaterials.slice(0, 5).map((m: any, i: number) => (
                <Link key={m.id} href={`/materials/${m.id}`} className={`flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/80 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{m.title}</p>
                      <p className="text-xs text-gray-400">{m.subject_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.published ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      {m.published ? 'Aktif' : 'Draft'}
                    </span>
                    <Eye className="h-4 w-4 text-gray-300" />
                  </div>
                </Link>
              )) : <p className="text-sm text-gray-400 text-center py-8">Belum ada materi</p>}
            </SectionCard>

            <SectionCard title="Aktivitas Terbaru" icon={Activity} color="orange">
              {data?.recentActivities?.length ? data.recentActivities.slice(0, 5).map((a: any, i: number) => (
                <div key={a.id} className={`flex items-center gap-3 px-5 py-3.5 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className="h-2 w-2 rounded-full bg-orange-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 truncate">{a.action}</p>
                    <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-gray-400 text-center py-8">Belum ada aktivitas</p>}
            </SectionCard>
          </div>

          {data?.subjects?.length ? (
            <SectionCard title="Mata Pelajaran" icon={BookCheck} color="purple">
              <div className="p-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.subjects.map((s: any) => (
                    <div key={s.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400 truncate">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Kalender Akademik" icon={Calendar} color="blue">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Semester Ganjil</span>
                  <span className="font-medium text-gray-900">Juli - Desember 2025</span>
                </div>
                <ProgressBar label="Progres Semester" value={data?.semesterProgress || 65} color="blue" />
                <div className="border-t pt-3 space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>UTS Ganjil</span>
                    <span className="text-gray-800 font-medium">28 Sep - 5 Okt 2025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>UAS Ganjil</span>
                    <span className="text-gray-800 font-medium">7 - 14 Des 2025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pembagian Raport</span>
                    <span className="text-gray-800 font-medium">20 Des 2025</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Pengumuman" icon={Megaphone} color="orange">
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50">
                  <Megaphone className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Rapat Dewan Guru</p>
                    <p className="text-xs text-gray-500">Senin, 24 Juli 2025 - Ruang Guru</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                  <Megaphone className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Jadwal UTS Ganjil</p>
                    <p className="text-xs text-gray-500">28 Sep - 5 Okt 2025, sesuai jadwal masing-masing</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  )
}

function StudentDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-student'],
    queryFn: () => fetch('/api/dashboard/student').then(r => r.json()),
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Semangat belajar! Berikut progres pembelajaran Anda.</p>
      </div>

      {isLoading ? <SkeletonGrid /> : (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard title="Materi" value={data?.totalMaterials || 0} icon={BookOpen} color="blue" />
            <StatCard title="Quiz" value={data?.totalQuizzes || 0} icon={ClipboardList} color="orange" />
            <StatCard title="Selesai" value={data?.completedQuizzes || 0} icon={UserCheck} color="green" />
            <StatCard title="Rata-rata" value={data?.averageScore ? Math.round(data.averageScore) : '-'} icon={TrendingUp} color="purple" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Materi Terbaru" icon={BookOpen} color="blue">
              {data?.recentMaterials?.length ? data.recentMaterials.slice(0, 4).map((m: any, i: number) => (
                <Link key={m.id} href={`/materials/${m.id}`} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{m.title}</p>
                    <p className="text-xs text-gray-400">{m.teacher_name}</p>
                  </div>
                  <Eye className="h-4 w-4 text-gray-300 shrink-0" />
                </Link>
              )) : <p className="text-sm text-gray-400 text-center py-8">Belum ada materi</p>}
            </SectionCard>

            <SectionCard title="Quiz Tersedia" icon={ClipboardList} color="orange">
              {data?.upcomingQuizzes?.length ? data.upcomingQuizzes.slice(0, 4).map((q: any, i: number) => (
                <Link key={q.id} href={`/quiz/${q.id}`} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center shrink-0">
                    <ClipboardList className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{q.title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {q.duration} menit</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 shrink-0" />
                </Link>
              )) : <p className="text-sm text-gray-400 text-center py-8">Tidak ada quiz</p>}
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Jadwal Hari Ini" icon={Calendar} color="blue">
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                  <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Matematika</p>
                      <p className="text-xs text-gray-500">Budi Santoso, S.Pd.</p>
                    </div>
                    <span className="text-xs text-gray-500">07:30 - 09:00</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50">
                  <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Bahasa Indonesia</p>
                      <p className="text-xs text-gray-500">Siti Rahmawati, S.Pd.</p>
                    </div>
                    <span className="text-xs text-gray-500">09:15 - 10:45</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
                  <Clock className="h-4 w-4 text-orange-600 shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">IPA</p>
                      <p className="text-xs text-gray-500">Ahmad Hidayat, S.Pd.</p>
                    </div>
                    <span className="text-xs text-gray-500">11:00 - 12:30</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Pengumuman" icon={Megaphone} color="orange">
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50">
                  <Megaphone className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">UTS Ganjil Akan Segera Dimulai</p>
                    <p className="text-xs text-gray-500">Persiapkan diri untuk UTS pada 28 Sep - 5 Okt 2025</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                  <Megaphone className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Kunjungan Perpustakaan</p>
                    <p className="text-xs text-gray-500">Jumat, 24 Juli 2025 - Bawa buku catatan</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  )
}

function ProgressBar({ label, value, color = 'blue' }: { label: string; value: number; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-emerald-400 to-emerald-600',
    orange: 'from-orange-400 to-orange-600',
    purple: 'from-purple-400 to-purple-600',
  }
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-semibold text-gray-900">{value}{typeof value === 'number' && value <= 100 ? '%' : ''}</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100">
        <div className={`h-2.5 rounded-full bg-gradient-to-r ${colors[color]} transition-all duration-500`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  )
}

function PrincipalDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-principal'],
    queryFn: () => fetch('/api/dashboard/principal').then(r => r.json()),
  })

  if (isLoading) return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
      <SkeletonGrid />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview kinerja SDN 1 Siliasih</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full border shadow-sm">
          <img src="/logo.svg" alt="" className="h-3.5 w-3.5" /> 2025/2026
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Guru" value={data?.totalTeachers || 0} icon={Users} color="blue" />
        <StatCard title="Siswa" value={data?.totalStudents || 0} icon={GraduationCap} color="green" />
        <StatCard title="Materi" value={data?.totalMaterials || 0} icon={BookOpen} color="purple" />
        <StatCard title="Quiz" value={data?.totalQuizzes || 0} icon={ClipboardList} color="orange" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Metrik Akademik" icon={BarChart3} color="blue">
          <div className="p-5 space-y-5">
            <ProgressBar label="Rata-rata Nilai" value={data?.averageScore ? Math.round(data.averageScore) : 0} color="blue" />
            <ProgressBar label="Kehadiran" value={data?.attendanceRate ? Math.round(data.attendanceRate) : 0} color="green" />
            <ProgressBar label="Progres Semester" value={data?.semesterProgress || 0} color="purple" />
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Mapel</span>
                <span className="font-semibold text-gray-900">{data?.totalSubjects || 0}</span>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Top Guru" icon={Users} color="purple">
          {data?.topTeachers?.length ? data.topTeachers.map((t: any, i: number) => (
            <div key={t.id} className={`flex items-center gap-3 px-5 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-50 text-yellow-600' : i === 1 ? 'bg-gray-100 text-gray-500' : i === 2 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
                <p className="text-xs text-gray-400">{t.materialsCount} materi &middot; {t.quizzesCount} quiz &middot; rata {t.averageScore}</p>
              </div>
            </div>
          )) : <p className="text-sm text-gray-400 text-center py-8">Belum ada data</p>}
        </SectionCard>

        <SectionCard title="Top Kelas" icon={GraduationCap} color="green">
          {data?.topClasses?.length ? data.topClasses.map((c: any, i: number) => (
            <div key={c.id} className={`flex items-center gap-3 px-5 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-50 text-yellow-600' : i === 1 ? 'bg-gray-100 text-gray-500' : i === 2 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                <p className="text-xs text-gray-400">{c.studentCount} siswa &middot; rata {c.averageScore}</p>
              </div>
            </div>
          )) : <p className="text-sm text-gray-400 text-center py-8">Belum ada data</p>}
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Materi Terbaru" icon={BookOpen} color="purple">
          {data?.recentMaterials?.length ? data.recentMaterials.slice(0, 5).map((m: any, i: number) => (
            <Link key={m.id} href={`/materials/${m.id}`} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{m.title}</p>
                <p className="text-xs text-gray-400">{m.teacher_name}</p>
              </div>
              <Eye className="h-4 w-4 text-gray-300 shrink-0" />
            </Link>
          )) : <p className="text-sm text-gray-400 text-center py-8">Belum ada materi</p>}
        </SectionCard>

        <SectionCard title="Aktivitas Terbaru" icon={Activity} color="green">
          {data?.recentActivities?.length ? data.recentActivities.slice(0, 6).map((a: any, i: number) => (
            <div key={a.id} className={`flex items-center gap-3 px-5 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700 truncate"><span className="font-medium text-gray-900">{a.user_name}</span> {a.action}</p>
                <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          )) : <p className="text-sm text-gray-400 text-center py-8">Belum ada aktivitas</p>}
        </SectionCard>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6 shadow-md">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm">
            <img src="/logo.svg" alt="School OS" className="h-6 w-6 brightness-0 invert" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">SDN 1 Siliasih</h3>
            <p className="text-blue-200 text-sm mt-1 leading-relaxed">
              {data?.totalTeachers || 0} Guru &middot; {data?.totalStudents || 0} Siswa &middot; {data?.totalMaterials || 0} Materi &middot; {data?.totalQuizzes || 0} Quiz &middot; Rata-rata <span className="font-semibold text-white">{data?.averageScore ? Math.round(data.averageScore) : 0}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}
