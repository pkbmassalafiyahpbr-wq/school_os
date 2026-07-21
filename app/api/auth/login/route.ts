import { NextResponse } from 'next/server'
import { authService } from '@/services'
import { createSession } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    const user = authService.login(username, password)
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    await createSession(user)
    return NextResponse.json({ id: user.id, name: user.name, role: user.role })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
