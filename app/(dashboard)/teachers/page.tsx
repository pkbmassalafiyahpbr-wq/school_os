'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, BookOpen, ClipboardList, GraduationCap } from 'lucide-react'
import { Breadcrumb } from '@/shared/breadcrumb'

export default function TeachersPage() {
  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => fetch('/api/teachers').then(r => r.json()),
  })

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Guru', href: '/teachers' }]} />
      <div>
        <h1 className="text-2xl font-bold">Daftar Guru</h1>
        <p className="text-gray-500">Informasi seluruh guru di SDN 1 Siliasih</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : !teachers?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada data guru</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t: any) => (
            <Card key={t.id} className="hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{t.full_name}</h3>
                    <p className="text-xs text-gray-400">{t.nip ? `NIP. ${t.nip}` : '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {t.subject_count} mapel</span>
                  <span className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> {t.material_count} materi</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
