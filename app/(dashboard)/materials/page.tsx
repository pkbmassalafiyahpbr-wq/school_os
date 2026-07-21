'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, BookOpen, Video, Eye, Pencil, Trash2, Globe, Lock } from 'lucide-react'

const subjectColors: Record<string, string> = {
  Matematika: 'bg-blue-50 text-blue-700 border-blue-200',
  IPA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  IPS: 'bg-orange-50 text-orange-700 border-orange-200',
  'Bahasa Indonesia': 'bg-purple-50 text-purple-700 border-purple-200',
  PKN: 'bg-red-50 text-red-700 border-red-200',
  'Seni Budaya': 'bg-pink-50 text-pink-700 border-pink-200',
}
const defaultSubjectColor = 'bg-gray-50 text-gray-700 border-gray-200'
import { toast } from 'sonner'
import Link from 'next/link'
import { Breadcrumb } from '@/shared/breadcrumb'
import { ConfirmDialog, ConfirmDialogHandle } from '@/shared/confirm-dialog'

export default function MaterialsPage() {
  const user = useAuthStore((s) => s.user)
  const isTeacher = user?.role === 'Guru' || user?.role === 'Administrator'

  return isTeacher ? <TeacherMaterials /> : <StudentMaterials />
}

function TeacherMaterials() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const confirmRef = useRef<ConfirmDialogHandle>(null)
  const [form, setForm] = useState({ title: '', description: '', subject_id: '', video_url: '' })

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: () => fetch('/api/materials').then(r => r.json()),
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => fetch('/api/subjects').then(r => r.json()),
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-teacher'] })
      toast.success('Materi berhasil dibuat')
      setOpen(false)
      setForm({ title: '', description: '', subject_id: '', video_url: '' })
    },
    onError: () => toast.error('Gagal membuat materi'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      toast.success('Materi berhasil dihapus')
    },
    onError: () => toast.error('Gagal menghapus materi'),
  })

  const publishMutation = useMutation({
    mutationFn: async ({ id, publish }: { id: number; publish: boolean }) => {
      const res = await fetch(`/api/materials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish }),
      })
      if (!res.ok) throw new Error('Failed')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      toast.success('Status publikasi diperbarui')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...form,
      subject_id: Number(form.subject_id),
    })
  }

  const filtered = materials?.filter((m: any) =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Materi', href: '/materials' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Materi Pembelajaran</h1>
          <p className="text-gray-500">Kelola materi pembelajaran</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-blue-600 text-primary-foreground shadow hover:bg-blue-700 h-9 px-4 py-2">
            <Plus className="mr-2 h-4 w-4" /> Tambah Materi
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Materi Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Judul Materi</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium">Deskripsi</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Mata Pelajaran</label>
                <Select value={form.subject_id} onValueChange={(v) => setForm({ ...form, subject_id: v || '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">URL Video (opsional)</label>
                <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>
                Simpan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari materi..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada materi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m: any) => (
            <Card key={m.id} className="hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${subjectColors[m.subject_name] || defaultSubjectColor}`}>
                      {m.subject_name}
                    </span>
                    <Badge variant={m.published ? 'default' : 'secondary'}>
                      {m.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => publishMutation.mutate({ id: m.id, publish: !m.published })}>
                      {m.published ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => confirmRef.current?.confirm({ description: 'Hapus materi ini?', onConfirm: () => deleteMutation.mutate(m.id) })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{m.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{m.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{m.teacher_name}</span>
                  <div className="flex items-center gap-2">
                    {m.video_url && <Video className="h-3 w-3" />}
                    <Link href={`/materials/${m.id}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Lihat
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog ref={confirmRef} />
    </div>
  )
}

function StudentMaterials() {
  const [search, setSearch] = useState('')

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: () => fetch('/api/materials').then(r => r.json()),
  })

  const filtered = materials?.filter((m: any) =>
    m.published && m.title?.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Materi', href: '/materials' }]} />
      <div>
        <h1 className="text-2xl font-bold">Materi Pembelajaran</h1>
        <p className="text-gray-500">Belajar dari materi yang tersedia</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari materi..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada materi yang dipublikasikan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m: any) => (
            <Link key={m.id} href={`/materials/${m.id}`}>
              <Card className="hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${subjectColors[m.subject_name] || defaultSubjectColor}`}>
                      {m.subject_name}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{m.title}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{m.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{m.teacher_name}</span>
                    {m.video_url && <Video className="h-3 w-3 text-blue-500" />}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
