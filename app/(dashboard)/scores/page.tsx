'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Award, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumb } from '@/shared/breadcrumb'

export default function ScoresPage() {
  const user = useAuthStore((s) => s.user)
  return user?.role === 'Siswa' ? <StudentScores /> : <TeacherScores />
}

function StudentScores() {
  const { data: attempts, isLoading } = useQuery({
    queryKey: ['my-scores'],
    queryFn: () => fetch('/api/scores').then(r => r.json()),
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Nilai', href: '/scores' }]} />
      <div>
        <h1 className="text-xl font-bold text-gray-900">Nilai Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">Hasil quiz yang sudah Anda kerjakan</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : !attempts?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Belum ada nilai</p>
            <p className="text-sm text-gray-400 mt-1">Kerjakan quiz untuk melihat nilai</p>
            <Link href="/quiz" className="inline-flex items-center gap-1 mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
              Lihat Quiz Tersedia →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {attempts.map((a: any) => (
            <Card key={a.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                      a.score >= 80 ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' :
                      a.score >= 60 ? 'bg-gradient-to-br from-amber-50 to-amber-100' :
                      'bg-gradient-to-br from-red-50 to-red-100'
                    }`}>
                      {a.score >= 80 ? <CheckCircle2 className={`h-6 w-6 text-emerald-600`} /> :
                       a.score >= 60 ? <Award className="h-6 w-6 text-amber-600" /> :
                       <XCircle className="h-6 w-6 text-red-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{a.quiz_title}</p>
                      <p className="text-sm text-gray-500">{a.subject_name}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className={`text-2xl font-bold ${
                      a.score >= 80 ? 'text-emerald-600' :
                      a.score >= 60 ? 'text-amber-600' :
                      'text-red-500'
                    }`}>{a.score}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5 justify-end">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(a.finished_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function TeacherScores() {
  const { data: scores, isLoading } = useQuery({
    queryKey: ['teacher-scores'],
    queryFn: () => fetch('/api/scores').then(r => r.json()),
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Nilai', href: '/scores' }]} />
      <div>
        <h1 className="text-xl font-bold text-gray-900">Nilai Siswa</h1>
        <p className="text-sm text-gray-500 mt-0.5">Nilai otomatis dari quiz yang dikerjakan siswa</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !scores?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Belum ada nilai</p>
            <p className="text-sm text-gray-400 mt-1">Nilai akan muncul setelah siswa mengerjakan quiz</p>
            <div className="inline-flex items-center gap-2 mt-4 text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              Nilai otomatis tersimpan saat siswa submit quiz
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Siswa</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Mapel</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Tipe</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Nilai</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {scores.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-900">{s.student_name || '-'}</td>
                  <td className="px-5 py-3 text-gray-600">{s.subject_name || '-'}</td>
                  <td className="px-5 py-3">
                    <Badge variant="outline" className="text-xs">{s.type}</Badge>
                  </td>
                  <td className={`px-5 py-3 text-right font-bold ${
                    s.score >= 80 ? 'text-emerald-600' : s.score >= 60 ? 'text-amber-600' : 'text-red-500'
                  }`}>{s.score}</td>
                  <td className="px-5 py-3 text-right text-gray-400 text-xs">{new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
