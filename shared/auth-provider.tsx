'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/hooks/use-auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => {
        if (data?.id) setUser(data)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [setUser, setLoading])

  return <>{children}</>
}
