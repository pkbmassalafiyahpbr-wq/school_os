import { NextResponse } from 'next/server'
import { quizService } from '@/services'
import { requireAuth } from '@/lib/session'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quiz = quizService.getById(Number(id))
  if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(quiz)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Guru' && session.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  quizService.update(Number(id), body, session.id)
  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Guru' && session.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  quizService.delete(Number(id), session.id)
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Guru' && session.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()

  if (body.publish !== undefined) {
    quizService.publish(Number(id), body.publish, session.id)
  }

  return NextResponse.json({ success: true })
}
