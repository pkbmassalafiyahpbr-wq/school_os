import { NextResponse } from 'next/server'
import { quizService } from '@/services'
import { requireAuth } from '@/lib/session'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const questions = quizService.getQuestions(Number(id))
  return NextResponse.json(questions)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Guru' && session.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const questionId = quizService.addQuestion(Number(id), {
    question: body.question,
    type: body.type || 'multiple_choice',
    order_number: body.order_number || 1,
    choices: body.choices || [],
  })
  return NextResponse.json({ id: questionId }, { status: 201 })
}
