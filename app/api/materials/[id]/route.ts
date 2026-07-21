import { NextResponse } from 'next/server'
import { materialService } from '@/services'
import { requireAuth } from '@/lib/session'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const material = materialService.getById(Number(id))
  if (!material) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(material)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Guru' && session.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  materialService.update(Number(id), body, session.id)
  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (session.role !== 'Guru' && session.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  materialService.delete(Number(id), session.id)
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
    materialService.publish(Number(id), body.publish, session.id)
  }

  return NextResponse.json({ success: true })
}
