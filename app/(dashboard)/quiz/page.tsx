'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, ClipboardList, Clock, Globe, Lock, Trash2, Play, Users, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Breadcrumb } from '@/shared/breadcrumb'
import { ConfirmDialog, ConfirmDialogHandle } from '@/shared/confirm-dialog'

export default function QuizPage() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  if (role === 'Guru' || role === 'Administrator') return <TeacherQuiz />
  if (role === 'Kepala Sekolah') return <PrincipalQuiz />
  return <StudentQuiz />
}

function TeacherQuiz() {
  const queryClient = useQueryClient()
  const confirmRef = useRef<ConfirmDialogHandle>(null)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', subject_id: '', duration: '10' })

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => fetch('/api/quizzes').then(r => r.json()),
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => fetch('/api/subjects').then(r => r.json()),
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      toast.success('Quiz berhasil dibuat')
      setOpen(false)
      setForm({ title: '', subject_id: '', duration: '10' })
    },
    onError: () => toast.error('Gagal membuat quiz'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/quizzes/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      toast.success('Quiz berhasil dihapus')
    },
  })

  const publishMutation = useMutation({
    mutationFn: async ({ id, publish }: { id: number; publish: boolean }) => {
      await fetch(`/api/quizzes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      toast.success('Status publikasi diperbarui')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...form,
      subject_id: Number(form.subject_id),
      duration: Number(form.duration),
    })
  }

  const filtered = quizzes?.filter((q: any) =>
    q.title?.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Quiz', href: '/quiz' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quiz</h1>
          <p className="text-gray-500">Kelola quiz pembelajaran</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-blue-600 text-primary-foreground shadow hover:bg-blue-700 h-9 px-4 py-2">
            <Plus className="mr-2 h-4 w-4" /> Tambah Quiz
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Quiz Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Judul Quiz</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium">Mata Pelajaran</label>
                <Select value={form.subject_id} onValueChange={(v) => setForm({ ...form, subject_id: v || '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Durasi (menit)</label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <Button type="submit" className="w-full bg-blue-600" disabled={createMutation.isPending}>
                Simpan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Cari quiz..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada quiz</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((q: any) => (
            <Card key={q.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={q.published ? 'default' : 'secondary'}>
                    {q.published ? 'Published' : 'Draft'}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => publishMutation.mutate({ id: q.id, publish: !q.published })}>
                      {q.published ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => confirmRef.current?.confirm({ confirmText: 'Hapus', description: 'Hapus quiz ini?', onConfirm: () => deleteMutation.mutate(q.id) })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Link href={`/quiz/${q.id}`}>
                  <h3 className="font-semibold mb-1 hover:text-blue-600">{q.title}</h3>
                </Link>
                <p className="text-sm text-gray-500 mb-3">{q.subject_name}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {q.duration} menit</span>
                  <Link href={`/quiz/${q.id}`} className="text-blue-600 hover:underline flex items-center gap-1">
                    Atur Soal
                  </Link>
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

function PrincipalQuiz() {
  const [search, setSearch] = useState('')

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => fetch('/api/quizzes').then(r => r.json()),
  })

  const filtered = quizzes?.filter((q: any) =>
    q.title?.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Quiz', href: '/quiz' }]} />
      <div>
        <h1 className="text-2xl font-bold">Quiz</h1>
        <p className="text-gray-500">Pantau hasil quiz seluruh siswa</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Cari quiz..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada quiz tersedia</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((q: any) => (
            <Link key={q.id} href={`/quiz/${q.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-1">{q.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{q.teacher_name}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {q.duration} menit</span>
                    <span className="flex items-center gap-1 text-purple-600"><Users className="h-3 w-3" /> Lihat Hasil</span>
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

function StudentQuiz() {
  const [search, setSearch] = useState('')

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => fetch('/api/quizzes').then(r => r.json()),
  })

  const filtered = quizzes?.filter((q: any) =>
    q.published && q.title?.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Quiz', href: '/quiz' }]} />
      <div>
        <h1 className="text-2xl font-bold">Quiz</h1>
        <p className="text-gray-500">Kerjakan quiz yang tersedia</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Cari quiz..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada quiz tersedia</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((q: any) => (
            <Link key={q.id} href={`/quiz/${q.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
                    <ClipboardList className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-1">{q.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{q.teacher_name}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {q.duration} menit</span>
                    <span className="flex items-center gap-1 text-blue-600"><Play className="h-3 w-3" /> Kerjakan</span>
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
