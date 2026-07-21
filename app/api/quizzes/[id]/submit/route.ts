import { NextResponse } from 'next/server'
import { quizService } from '@/services'
import { requireAuth } from '@/lib/session'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Siswa') {
    return NextResponse.json({ error: 'Only students can submit quizzes' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const result = quizService.submitAttempt(body.attempt_id, body.answers)
  return NextResponse.json(result)
}
