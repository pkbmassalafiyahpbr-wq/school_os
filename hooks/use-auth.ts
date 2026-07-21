'use client'

import { useRouter } from 'next/navigation'
import { create } from 'zustand'

interface AuthState {
  user: { id: number; name: string; role: string } | null
  setUser: (user: { id: number; name: string; role: string } | null) => void
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoading: true,
  setLoading: (loading) => set({ isLoading: loading }),
}))

export function useAuth() {
  const router = useRouter()
  const { user, setUser, isLoading, setLoading } = useAuthStore()

  const login = async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    setUser(data)
    router.push('/dashboard')
    return data
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return { user, isLoading, login, logout, checkSession }
}
