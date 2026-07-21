'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, GraduationCap, BookOpen, ClipboardList, TrendingUp, Activity } from 'lucide-react'
import { Breadcrumb } from '@/shared/breadcrumb'

export default function StatisticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-principal'],
    queryFn: () => fetch('/api/dashboard/principal').then(r => r.json()),
  })

  if (isLoading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Statistik', href: '/statistics' }]} />
      <div>
        <h1 className="text-2xl font-bold">Statistik Sekolah</h1>
        <p className="text-gray-500">Data statistik SDN 1 Siliasih</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Guru</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.totalTeachers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Siswa</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.totalStudents || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Materi</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.totalMaterials || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Quiz</CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.totalQuizzes || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Rata-rata Nilai</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.averageScore ? Math.round(data.averageScore) : 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Kehadiran</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.attendanceRate ? Math.round(data.attendanceRate) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">Ringkasan Sekolah</h3>
          <p className="text-blue-100 text-sm">
            SDN 1 Siliasih memiliki {data?.totalTeachers || 0} tenaga pengajar yang mendidik {data?.totalStudents || 0} siswa.
            Terdapat {data?.totalMaterials || 0} materi dan {data?.totalQuizzes || 0} quiz yang tersedia.
            Rata-rata nilai siswa mencapai {data?.averageScore ? Math.round(data.averageScore) : 0} dengan tingkat kehadiran {data?.attendanceRate ? Math.round(data.attendanceRate) : 0}%.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
