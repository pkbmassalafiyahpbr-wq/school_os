import { cookies } from 'next/headers'
import { authService } from '@/services'
import type { User } from '@/types'

export async function createSession(user: User): Promise<void> {
  const cookieStore = await cookies()
  const sessionData = JSON.stringify({ id: user.id, name: user.name, role: user.role })
  cookieStore.set('school_os_session', Buffer.from(sessionData).toString('base64'), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24,
  })
}

export async function getSession(): Promise<{ id: number; name: string; role: string } | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('school_os_session')
  if (!sessionCookie) return null
  try {
    const data = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
    return data
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) return null
  return authService.getUser(session.id)
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('school_os_session')
}

export async function requireAuth(): Promise<{ id: number; name: string; role: string }> {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

export async function requireRole(roles: string[]): Promise<{ id: number; name: string; role: string }> {
  const session = await requireAuth()
  if (!roles.includes(session.role)) throw new Error('Forbidden')
  return session
}
