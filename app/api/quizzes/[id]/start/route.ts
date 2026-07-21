import { NextResponse } from 'next/server'
import { quizService } from '@/services'
import { requireAuth } from '@/lib/session'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Siswa') {
    return NextResponse.json({ error: 'Only students can start quizzes' }, { status: 403 })
  }

  const { id } = await params
  const attempt = quizService.startAttempt(Number(id), session.id)
  return NextResponse.json(attempt)
}
