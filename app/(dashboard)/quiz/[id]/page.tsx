'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Clock, Trash2, ClipboardList, CheckCircle2, XCircle, Users, Trophy, TrendingUp, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Breadcrumb } from '@/shared/breadcrumb'
import { ConfirmDialog, ConfirmDialogHandle } from '@/shared/confirm-dialog'

export default function QuizDetailPage() {
  const params = useParams()
  const id = params.id
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  if (role === 'Guru' || role === 'Administrator') return <TeacherQuizDetail quizId={Number(id)} />
  if (role === 'Kepala Sekolah') return <PrincipalQuizDetail quizId={Number(id)} />
  return <StudentQuizTake quizId={Number(id)} />
}

function TeacherQuizDetail({ quizId }: { quizId: number }) {
  const queryClient = useQueryClient()
  const confirmRef = useRef<ConfirmDialogHandle>(null)
  const [tab, setTab] = useState<'soal' | 'hasil'>('soal')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ question: '', choices: ['', '', '', ''], correct: 0 })
  const [selectedAttempt, setSelectedAttempt] = useState<number | null>(null)

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => fetch(`/api/quizzes/${quizId}`).then(r => r.json()),
  })

  const { data: questions } = useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: () => fetch(`/api/quizzes/${quizId}/questions`).then(r => r.json()),
  })

  const { data: attemptsData } = useQuery({
    queryKey: ['quiz-attempts', quizId],
    queryFn: () => fetch(`/api/quizzes/${quizId}/attempts`).then(r => r.json()),
  })

  const { data: attemptDetail } = useQuery({
    queryKey: ['quiz-attempt-detail', quizId, selectedAttempt],
    queryFn: () => fetch(`/api/quizzes/${quizId}/attempts/${selectedAttempt}`).then(r => r.json()),
    enabled: selectedAttempt !== null,
  })

  const addQuestionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: form.question,
          type: 'multiple_choice',
          order_number: (questions?.length || 0) + 1,
          choices: form.choices.map((c, i) => ({ choice: c, is_correct: i === form.correct ? 1 : 0 })),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizId] })
      toast.success('Soal berhasil ditambahkan')
      setOpen(false)
      setForm({ question: '', choices: ['', '', '', ''], correct: 0 })
    },
    onError: () => toast.error('Gagal menambahkan soal'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (questionId: number) => {
      await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizId] })
      toast.success('Soal berhasil dihapus')
    },
  })

  if (isLoading) return <Skeleton className="h-64" />

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb items={[{ label: 'Quiz', href: '/quiz' }, { label: quiz?.title || 'Detail Quiz' }]} />
      <Link href="/quiz" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quiz?.title}</h1>
          <p className="text-gray-500">{quiz?.subject_name} • {quiz?.duration} menit</p>
        </div>
        <Badge variant={quiz?.published ? 'default' : 'secondary'}>
          {quiz?.published ? 'Published' : 'Draft'}
        </Badge>
      </div>

      <div className="flex items-center gap-1 border-b">
        <button onClick={() => setTab('soal')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'soal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Soal ({questions?.length || 0})
        </button>
        <button onClick={() => setTab('hasil')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'hasil' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Hasil Siswa ({attemptsData?.completedCount || 0})
        </button>
      </div>

      {tab === 'soal' ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Daftar Soal</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                <Plus className="mr-2 h-4 w-4" /> Tambah Soal
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Tambah Soal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Pertanyaan</Label>
                    <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
                  </div>
                  {form.choices.map((choice, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correct"
                        checked={form.correct === i}
                        onChange={() => setForm({ ...form, correct: i })}
                        className="h-4 w-4 text-blue-600"
                      />
                      <Input
                        value={choice}
                        onChange={(e) => {
                          const choices = [...form.choices]
                          choices[i] = e.target.value
                          setForm({ ...form, choices })
                        }}
                        placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                      />
                    </div>
                  ))}
                  <p className="text-xs text-gray-400">Pilih jawaban yang benar dengan mengklik radio button</p>
                  <Button onClick={() => addQuestionMutation.mutate()} className="w-full bg-blue-600" disabled={addQuestionMutation.isPending || !form.question}>
                    Simpan Soal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {!questions || questions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ClipboardList className="h-12 w-12 mx-auto mb-2" />
                <p>Belum ada soal. Tambah soal sekarang!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q: any, idx: number) => (
                  <div key={q.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium">Soal {idx + 1}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => confirmRef.current?.confirm({ description: 'Hapus soal ini?', onConfirm: () => deleteMutation.mutate(q.id) })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mb-3">{q.question}</p>
                    <div className="grid gap-2">
                      {q.choices?.map((c: any) => (
                        <div key={c.id} className={`flex items-center gap-2 text-sm p-2 rounded ${c.is_correct ? 'bg-green-50 text-green-700' : 'bg-gray-50'}`}>
                          {c.is_correct ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-300" />}
                          {c.choice}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Hasil Pengerjaan ({attemptsData?.completedCount || 0}/{attemptsData?.totalStudents || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!attemptsData?.attempts?.length ? (
              <div className="text-center py-8 text-gray-400">
                <ClipboardList className="h-12 w-12 mx-auto mb-2" />
                <p>Belum ada siswa yang mengerjakan quiz ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500">No</th>
                      <th className="pb-3 font-medium text-gray-500">Nama Siswa</th>
                      <th className="pb-3 font-medium text-gray-500">Kelas</th>
                      <th className="pb-3 font-medium text-gray-500">Nilai</th>
                      <th className="pb-3 font-medium text-gray-500">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attemptsData.attempts.map((a: any, i: number) => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="py-3 text-gray-400">{i + 1}</td>
                        <td className="py-3 font-medium">{a.student_name}</td>
                        <td className="py-3 text-gray-500">{a.classroom_name || '-'}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            a.score >= 80 ? 'bg-emerald-50 text-emerald-700' :
                            a.score >= 60 ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-700'
                          }`}>{a.score}</span>
                        </td>
                        <td className="py-3">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => setSelectedAttempt(a.id)}>
                            Lihat Jawaban
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={selectedAttempt !== null} onOpenChange={(open) => { if (!open) setSelectedAttempt(null) }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Jawaban {attemptDetail?.attempt?.student_name}
            </DialogTitle>
          </DialogHeader>
          {attemptDetail ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-600">Nilai: <strong className={attemptDetail.attempt.score >= 80 ? 'text-emerald-600' : attemptDetail.attempt.score >= 60 ? 'text-yellow-600' : 'text-red-600'}>{attemptDetail.attempt.score}</strong></span>
                <span className="text-gray-500">Benar {attemptDetail.correctCount}/{attemptDetail.totalQuestions}</span>
              </div>
              {attemptDetail.allQuestions?.map((q: any, idx: number) => {
                const answer = attemptDetail.answers?.find((a: any) => a.question_id === q.id)
                const isCorrect = answer?.is_correct
                return (
                  <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-sm">Soal {idx + 1}</p>
                        <p className="text-gray-700 mt-1">{q.question_text || q.question}</p>
                      </div>
                    </div>
                    <div className="ml-7 space-y-1 text-sm">
                      <p className={isCorrect ? 'text-emerald-600' : 'text-red-600'}>
                        Jawaban siswa: <strong>{answer?.chosen_answer || '-'}</strong>
                      </p>
                      {!isCorrect && (
                        <p className="text-emerald-600">
                          Jawaban benar: <strong>{q.correct_answer}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <Skeleton className="h-64" />
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog ref={confirmRef} />
    </div>
  )
}

function PrincipalQuizDetail({ quizId }: { quizId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['quiz-stats', quizId],
    queryFn: () => fetch(`/api/quizzes/${quizId}/stats`).then(r => r.json()),
  })

  if (isLoading) return <Skeleton className="h-96" />
  if (!data) return <div>Data tidak ditemukan</div>

  const { quiz, stats, attempts } = data

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb items={[{ label: 'Quiz', href: '/quiz' }, { label: quiz?.title || 'Detail Quiz' }]} />
      <Link href="/quiz" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{quiz?.title}</h1>
        <p className="text-gray-500">{quiz?.subject_name} • {quiz?.teacher_name}</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Peserta</p>
              <p className="text-xl font-bold">{stats.totalAttempts} siswa</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Rata-rata</p>
              <p className="text-xl font-bold">{stats.averageScore}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tertinggi</p>
              <p className="text-xl font-bold">{stats.highestScore}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Terendah</p>
              <p className="text-xl font-bold">{stats.lowestScore}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hasil Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ClipboardList className="h-12 w-12 mx-auto mb-2" />
              <p>Belum ada siswa yang mengerjakan quiz ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-gray-500">No</th>
                    <th className="pb-3 font-medium text-gray-500">Nama Siswa</th>
                    <th className="pb-3 font-medium text-gray-500">Nilai</th>
                    <th className="pb-3 font-medium text-gray-500">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a: any, i: number) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-3 text-gray-400">{i + 1}</td>
                      <td className="py-3 font-medium">{a.student_name}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          a.score >= 80 ? 'bg-green-50 text-green-700' :
                          a.score >= 60 ? 'bg-yellow-50 text-yellow-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {a.score}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{a.finished_at ? new Date(a.finished_at).toLocaleDateString('id-ID') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StudentQuizTake({ quizId }: { quizId: number }) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState<any>(null)

  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => fetch(`/api/quizzes/${quizId}`).then(r => r.json()),
  })

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: () => fetch(`/api/quizzes/${quizId}/questions`).then(r => r.json()),
  })

  const startQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/start`, { method: 'POST' })
      if (!res.ok) {
        toast.error('Gagal memulai quiz')
        return
      }
      const data = await res.json()
      setAttemptId(data.id)
    } catch {
      toast.error('Gagal memulai quiz')
    }
  }

  const handleAnswer = (questionId: number, choiceId: number) => {
    setAnswers({ ...answers, [questionId]: choiceId })
  }

  const handleSubmit = async () => {
    if (!attemptId) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: attemptId,
          answers: Object.entries(answers).map(([qId, cId]) => ({
            question_id: Number(qId),
            choice_id: cId,
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setResult(data)
      setFinished(true)
    } catch {
      toast.error('Gagal mengirim jawaban')
    } finally {
      setSubmitting(false)
    }
  }

  if (quizLoading || questionsLoading) return <Skeleton className="h-96" />
  if (!quiz || !questions) return <div>Quiz tidak ditemukan</div>

  if (finished && result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center p-8">
          <CardContent>
            {result.score >= 80 ? (
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
            ) : (
              <ClipboardList className="h-16 w-16 mx-auto text-orange-500 mb-4" />
            )}
            <h2 className="text-2xl font-bold mb-2">Quiz Selesai!</h2>
            <p className="text-5xl font-bold text-blue-600 mb-2">{result.score}</p>
            <p className="text-gray-500 mb-4">dari 100</p>
            <p className="text-sm text-gray-500 mb-6">
              Benar {result.correctCount} dari {result.totalQuestions} soal
            </p>

            <div className="h-3 rounded-full bg-gray-100 mb-8">
              <div className="h-3 rounded-full bg-blue-600 transition-all" style={{ width: `${result.score}%` }} />
            </div>

            <div className="space-y-3">
              {questions?.map((q: any, idx: number) => {
                const userChoice = answers[q.id]
                const correctChoice = q.choices?.find((c: any) => c.is_correct)
                const isCorrect = userChoice === correctChoice?.id

                return (
                  <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start gap-2">
                      {isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                      <div className="text-left">
                        <p className="font-medium text-sm">Soal {idx + 1}: {q.question}</p>
                        <p className="text-sm mt-1">
                          Jawaban benar: <span className="font-medium text-green-600">{correctChoice?.choice}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3 mt-6 justify-center">
              <Button variant="outline" onClick={() => router.push('/quiz')}>Kembali ke Quiz</Button>
              <Button onClick={() => router.push('/dashboard')}>Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!attemptId) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center p-12">
          <CardContent>
            <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-8 w-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-gray-500 mb-2">{quiz.subject_name}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
              <Clock className="h-4 w-4" /> {quiz.duration} menit • {questions?.length || 0} soal
            </div>
            <Button size="lg" onClick={startQuiz} className="bg-blue-600 hover:bg-blue-700">
              Mulai Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{quiz.title}</h1>
          <p className="text-sm text-gray-500">Soal {currentQuestion + 1} dari {questions.length}</p>
        </div>
        <span className="text-sm text-gray-400">
          {Object.keys(answers).length} / {questions.length} terjawab
        </span>
      </div>

      <div className="h-2 rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-6">{question.question}</h2>

          <RadioGroup
            value={String(answers[question.id] || '')}
            onValueChange={(v) => handleAnswer(question.id, Number(v))}
          >
            <div className="space-y-3">
              {question.choices?.map((choice: any) => (
                <div key={choice.id} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value={String(choice.id)} id={`choice-${choice.id}`} />
                  <Label htmlFor={`choice-${choice.id}`} className="flex-1 cursor-pointer font-normal">
                    {choice.choice}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Sebelumnya
        </Button>

        {currentQuestion < questions.length - 1 ? (
          <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
            Selanjutnya
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
            {submitting ? 'Mengirim...' : 'Selesai & Kirim'}
          </Button>
        )}
      </div>
    </div>
  )
}
