'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogIn, ShieldCheck, Users, GraduationCap, BookOpen, School, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const ACCOUNTS = [
  { label: 'Kepala Sekolah', username: 'kepsek', icon: ShieldCheck, desc: 'Pantau seluruh aktivitas sekolah', color: 'from-violet-500 to-purple-600', light: 'bg-violet-50 text-violet-700', border: 'hover:border-violet-300' },
  { label: 'Guru', username: 'siti', icon: Users, desc: 'Kelola materi, quiz & nilai', color: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-700', border: 'hover:border-blue-300' },
  { label: 'Siswa', username: 'budi_santoso', icon: GraduationCap, desc: 'Belajar & kerjakan quiz', color: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 text-emerald-700', border: 'hover:border-emerald-300' },
]

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (user) router.push('/dashboard') }, [user, router])

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

  if (!mounted) return null

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-400/10" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-400/10" />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-white/5" />
        </div>
        <div className="relative flex flex-col justify-center px-16 text-white">
          <div className="space-y-6">
            <div className="h-20 w-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              <img src="/logo.svg" alt="" className="h-10 w-10 brightness-0 invert" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">School OS</h1>
              <p className="text-xl text-blue-200">SDN 1 Siliasih</p>
            </div>
            <p className="text-base text-blue-200/80 leading-relaxed max-w-md">
              Sistem Akademik Digital untuk pembelajaran modern. Kelola materi, quiz, nilai, dan pantau perkembangan siswa dalam satu platform.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <BookOpen className="h-4 w-4" />
                <span>Materi</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <GraduationCap className="h-4 w-4" />
                <span>Quiz</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <ShieldCheck className="h-4 w-4" />
                <span>Nilai</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-12 left-16 text-sm text-blue-300/60">
            © 2025 SDN 1 Siliasih
          </div>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img src="/logo.svg" alt="School OS" className="h-7 w-7 brightness-0 invert" />
            </div>
            <h1 className="text-2xl font-bold">School OS</h1>
            <p className="text-sm text-gray-500 mt-1">SDN 1 Siliasih</p>
          </div>

          <div className="text-center lg:text-left space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Masuk ke Akun</h2>
            <p className="text-sm text-gray-500">Pilih role untuk login sebagai demo</p>
          </div>

          <div className="space-y-3">
            {ACCOUNTS.map((acc, idx) => {
              const Icon = acc.icon
              const isLoad = loading === acc.username
              return (
                <button
                  key={acc.username}
                  type="button"
                  disabled={!!loading}
                  onClick={() => handleLogin(acc.username, acc.label)}
                  className={`group relative w-full text-left rounded-xl bg-white p-4 border border-gray-200 transition-all duration-200
                    ${acc.border} hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${acc.color} flex items-center justify-center shrink-0 shadow-sm`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">{acc.label}</h3>
                        {isLoad ? (
                          <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
                        ) : (
                          <LogIn className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{acc.desc}</p>
                      <div className={`inline-flex items-center gap-1.5 mt-1.5 text-[11px] px-2 py-0.5 rounded-md ${acc.light}`}>
                        <span className="font-mono">@{acc.username}</span>
                        <span className="opacity-40">•</span>
                        <span className="font-mono opacity-70">123</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex-1 h-px bg-gray-200" />
            <span>Demo Akun — Password: 123</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-xs text-gray-400 leading-relaxed">
            Tekan salah satu role di atas untuk langsung masuk
            <br />ke dashboard sesuai peran masing-masing
          </p>
        </div>
      </div>
    </div>
  )
}
