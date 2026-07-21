'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, ArrowLeft, Video, FileText, Users, Eye, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumb } from '@/shared/breadcrumb'
import { useAuthStore } from '@/hooks/use-auth'

export default function MaterialDetailPage() {
  const params = useParams()
  const id = params.id
  const user = useAuthStore((s) => s.user)

  const { data: material, isLoading } = useQuery({
    queryKey: ['material', id],
    queryFn: () => fetch(`/api/materials/${id}`).then(r => r.json()),
  })

  const { data: viewsData } = useQuery({
    queryKey: ['material-views', id],
    queryFn: () => fetch(`/api/materials/${id}/views`).then(r => r.json()),
    enabled: user?.role === 'Guru' || user?.role === 'Administrator' || user?.role === 'Kepala Sekolah',
  })

  useEffect(() => {
    if (user?.role === 'Siswa' && id) {
      fetch(`/api/materials/${id}/views`, { method: 'POST' })
    }
  }, [user?.role, id])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!material) {
    return <div>Materi tidak ditemukan</div>
  }

  const isTeacher = user?.role === 'Guru' || user?.role === 'Administrator'

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb items={[{ label: 'Materi', href: '/materials' }, { label: material?.title || 'Detail' }]} />
      <Link href="/materials" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{material.title}</h1>
            <p className="text-sm text-gray-500">{material.teacher_name} • {material.subject_name}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Deskripsi</h3>
          <p className="text-gray-600">{material.description || 'Tidak ada deskripsi'}</p>
        </CardContent>
      </Card>

      {material.video_url && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Video Pembelajaran</h3>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={material.video_url}
                className="w-full h-full"
                allowFullScreen
                title={material.title}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {isTeacher && viewsData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Siswa yang Belajar ({viewsData.viewedCount}/{viewsData.totalStudents})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewsData.views?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Eye className="h-12 w-12 mx-auto mb-2" />
                <p>Belum ada siswa yang membuka materi ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500">No</th>
                      <th className="pb-3 font-medium text-gray-500">Nama Siswa</th>
                      <th className="pb-3 font-medium text-gray-500">Kelas</th>
                      <th className="pb-3 font-medium text-gray-500">Status</th>
                      <th className="pb-3 font-medium text-gray-500">Terakhir Lihat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewsData.views.map((v: any, i: number) => (
                      <tr key={v.id} className="border-b last:border-0">
                        <td className="py-3 text-gray-400">{i + 1}</td>
                        <td className="py-3 font-medium">{v.student_name}</td>
                        <td className="py-3 text-gray-500">{v.classroom_name || '-'}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> Sudah
                          </span>
                        </td>
                        <td className="py-3 text-gray-400">{new Date(v.viewed_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Informasi</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Status</p>
              <p className="font-medium">{material.published ? 'Dipublikasikan' : 'Draft'}</p>
            </div>
            <div>
              <p className="text-gray-400">Dibuat</p>
              <p className="font-medium">{new Date(material.created_at).toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
