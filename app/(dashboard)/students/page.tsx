'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GraduationCap, Users, MapPin, Phone, Plus, BookOpen, ClipboardList, ArrowUpDown } from 'lucide-react'
import { Breadcrumb } from '@/shared/breadcrumb'
import { toast } from 'sonner'

export default function StudentsPage() {
  const user = useAuthStore((s) => s.user)
  const isGuru = user?.role === 'Guru'

  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => fetch('/api/students').then(r => r.json()),
  })

  const students = data?.students || []
  const classrooms = data?.classrooms || []

  if (isLoading) return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Siswa', href: '/students' }]} />
      <Skeleton className="h-96" />
    </div>
  )

  if (isGuru) return <GuruStudentsView students={students} classrooms={classrooms} />
  return <KepsekStudentsView students={students} />
}

function KepsekStudentsView({ students }: { students: any[] }) {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Siswa', href: '/students' }]} />
      <div>
        <h1 className="text-2xl font-bold">Daftar Siswa</h1>
        <p className="text-gray-500">Informasi seluruh siswa di SDN 1 Siliasih</p>
      </div>

      {!students?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada data siswa</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((s: any) => (
            <Card key={s.id} className="hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{s.full_name}</h3>
                    <p className="text-xs text-gray-400">{s.classroom_name || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.address?.substring(0, 20) || '-'}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {s.phone || '-'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function GuruStudentsView({ students, classrooms }: { students: any[]; classrooms: any[] }) {
  const queryClient = useQueryClient()
  const [selectedClassroom, setSelectedClassroom] = useState('all')
  const [scoreStudent, setScoreStudent] = useState<any | null>(null)
  const [scoreForm, setScoreForm] = useState({ score: '', type: 'Daily', subject_id: '' })
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newStudent, setNewStudent] = useState({ full_name: '', gender: 'Laki-laki', classroom_id: '' })
  const [addedResult, setAddedResult] = useState<any | null>(null)

  const addStudentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newStudent, classroom_id: Number(newStudent.classroom_id) }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error) }
      return res.json()
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      setAddedResult(result)
      setNewStudent({ full_name: '', gender: 'Laki-laki', classroom_id: '' })
      toast.success('Siswa berhasil ditambahkan!')
    },
    onError: (err) => toast.error(err.message),
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => fetch('/api/subjects').then(r => r.json()),
  })

  const inputScoreMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: scoreStudent?.id,
          subject_id: Number(scoreForm.subject_id),
          score: Number(scoreForm.score),
          type: scoreForm.type,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-scores'] })
      toast.success('Nilai berhasil disimpan')
      setScoreStudent(null)
      setScoreForm({ score: '', type: 'Daily', subject_id: '' })
    },
    onError: () => toast.error('Gagal menyimpan nilai'),
  })

  const filtered = selectedClassroom === 'all'
    ? students
    : students.filter((s: any) => s.classroom_id === Number(selectedClassroom))

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Siswa', href: '/students' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Murid Saya</h1>
          <p className="text-gray-500">{students.length} siswa di kelas binaan Anda</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedClassroom} onValueChange={(v) => v && setSelectedClassroom(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {classrooms.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => { setAddDialogOpen(true); setAddedResult(null) }}>
            <Plus className="h-4 w-4 mr-1" /> Tambah Siswa
          </Button>
        </div>
      </div>

      {!filtered.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada siswa</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-gray-500">No</th>
                <th className="pb-3 font-medium text-gray-500">Nama</th>
                <th className="pb-3 font-medium text-gray-500">Kelas</th>
                <th className="pb-3 font-medium text-gray-500">NIS</th>
                <th className="pb-3 font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any, i: number) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 text-gray-400">{i + 1}</td>
                  <td className="py-3 font-medium">{s.full_name}</td>
                  <td className="py-3 text-gray-500">{s.classroom_name || '-'}</td>
                  <td className="py-3 text-gray-500">{s.nis || '-'}</td>
                  <td className="py-3">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => { setScoreStudent(s); setScoreForm({ ...scoreForm, subject_id: subjects?.[0]?.id || '' }) }}>
                      <Plus className="h-3 w-3 mr-1" /> Input Nilai
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addDialogOpen} onOpenChange={(open) => { if (!open) { setAddDialogOpen(false); setAddedResult(null) } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
              Tambah Siswa Baru
            </DialogTitle>
          </DialogHeader>
          {addedResult ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-emerald-50 p-4 text-center space-y-2">
                <p className="text-emerald-700 font-medium">✅ Siswa berhasil ditambahkan!</p>
                <p className="text-sm text-gray-600">Username: <span className="font-mono font-bold">{addedResult.username}</span></p>
                <p className="text-sm text-gray-600">Password: <span className="font-mono font-bold">{addedResult.password}</span></p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => { setAddDialogOpen(false); setAddedResult(null) }}>
                Tutup
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input value={newStudent.full_name} onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })} placeholder="Nama siswa" />
              </div>
              <div>
                <label className="text-sm font-medium">Jenis Kelamin</label>
                <Select value={newStudent.gender} onValueChange={(v) => v && setNewStudent({ ...newStudent, gender: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Kelas</label>
                <Select value={newStudent.classroom_id} onValueChange={(v) => v && setNewStudent({ ...newStudent, classroom_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => addStudentMutation.mutate()} className="w-full bg-emerald-600" disabled={!newStudent.full_name || !newStudent.classroom_id || addStudentMutation.isPending}>
                {addStudentMutation.isPending ? 'Menyimpan...' : 'Tambah Siswa'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={scoreStudent !== null} onOpenChange={(open) => { if (!open) setScoreStudent(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Input Nilai - {scoreStudent?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mata Pelajaran</label>
              <Select value={scoreForm.subject_id} onValueChange={(v) => v && setScoreForm({ ...scoreForm, subject_id: v })}>
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
              <label className="text-sm font-medium">Jenis Nilai</label>
              <Select value={scoreForm.type} onValueChange={(v) => v && setScoreForm({ ...scoreForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Harian</SelectItem>
                  <SelectItem value="Assignment">Tugas</SelectItem>
                  <SelectItem value="Quiz">Quiz</SelectItem>
                  <SelectItem value="PTS">PTS</SelectItem>
                  <SelectItem value="PAS">PAS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Nilai</label>
              <Input type="number" min="0" max="100" value={scoreForm.score} onChange={(e) => setScoreForm({ ...scoreForm, score: e.target.value })} placeholder="0-100" />
            </div>
            <Button onClick={() => inputScoreMutation.mutate()} className="w-full bg-blue-600" disabled={!scoreForm.score || !scoreForm.subject_id || inputScoreMutation.isPending}>
              Simpan Nilai
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
