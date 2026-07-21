import { NextResponse } from 'next/server'
import { quizService } from '@/services'
import { requireAuth } from '@/lib/session'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; questionId: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Guru' && session.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { questionId } = await params
  quizService.removeQuestion(Number(questionId))
  return NextResponse.json({ success: true })
}
