'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, ShieldCheck, Users, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'

const ACCOUNTS = [
  { label: 'Kepala Sekolah', username: 'kepsek', icon: ShieldCheck, desc: 'Lihat dashboard & statistik sekolah', color: 'from-violet-500 to-purple-600', light: 'bg-violet-50 text-violet-700' },
  { label: 'Guru', username: 'siti', icon: Users, desc: 'Kelola materi, quiz & nilai', color: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-700' },
  { label: 'Siswa', username: 'budi_santoso', icon: GraduationCap, desc: 'Belajar & kerjakan quiz', color: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 text-emerald-700' },
]

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState('')

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  const handleLogin = async (username: string, label: string) => {
    setLoading(username)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: '123' }),
      })
      if (!res.ok) { toast.error(`Gagal login sebagai ${label}`); return }
      const data = await res.json()
      useAuthStore.getState().setUser(data)
      toast.success(`Selamat datang, ${data.name}!`)
      router.push('/dashboard')
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <img src="/logo.svg" alt="School OS" className="h-8 w-8 brightness-0 invert" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">School OS</h1>
          <p className="text-sm text-gray-500 mt-1">SDN 1 Siliasih — Sistem Akademik Digital</p>
        </div>

        <div className="grid gap-3">
          {ACCOUNTS.map(acc => {
            const Icon = acc.icon
            const isLoad = loading === acc.username
            return (
              <button
                key={acc.username}
                type="button"
                disabled={!!loading}
                onClick={() => handleLogin(acc.username, acc.label)}
                className="group relative overflow-hidden rounded-2xl bg-white p-5 text-left border border-gray-200/60 hover:border-gray-300/80 hover:shadow-md transition-all disabled:opacity-60"
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${acc.color} flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{acc.label}</h3>
                      {isLoad ? (
                        <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                      ) : (
                        <LogIn className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{acc.desc}</p>
                    <div className={`inline-flex items-center gap-1.5 mt-2 text-xs px-2 py-0.5 rounded-full ${acc.light}`}>
                      <span className="font-mono">@{acc.username}</span>
                      <span className="opacity-50">•</span>
                      <span className="font-mono opacity-70">pass: 123</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-center text-xs text-gray-400">
          Tekan salah satu role di atas untuk masuk ke dashboard
        </p>
      </div>
    </div>
  )
}
