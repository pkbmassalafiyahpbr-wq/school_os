'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Award,
  User,
  Users,
  GraduationCap,
  Building2,
  FileText,
  BarChart3,
  Monitor,
  LogOut,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const roleNavItems: Record<string, { label: string; href: string; icon: any }[]> = {
  Guru: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Materi', href: '/materials', icon: BookOpen },
    { label: 'Quiz', href: '/quiz', icon: ClipboardList },
    { label: 'Nilai', href: '/scores', icon: Award },
    { label: 'Murid', href: '/students', icon: GraduationCap },
    { label: 'Profil', href: '/profile', icon: User },
  ],
  Siswa: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Belajar', href: '/materials', icon: BookOpen },
    { label: 'Quiz', href: '/quiz', icon: ClipboardList },
    { label: 'Nilai', href: '/scores', icon: Award },
    { label: 'Profil', href: '/profile', icon: User },
  ],
  'Kepala Sekolah': [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Materi', href: '/materials', icon: BookOpen },
    { label: 'Quiz', href: '/quiz', icon: ClipboardList },
    { label: 'Nilai', href: '/scores', icon: Award },
    { label: 'Guru', href: '/teachers', icon: Users },
    { label: 'Siswa', href: '/students', icon: GraduationCap },
    { label: 'Statistik', href: '/statistics', icon: BarChart3 },
    { label: 'Monitoring', href: '/monitoring', icon: Monitor },
    { label: 'Profil', href: '/profile', icon: User },
  ],
  Administrator: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Materi', href: '/materials', icon: BookOpen },
    { label: 'Quiz', href: '/quiz', icon: ClipboardList },
    { label: 'Nilai', href: '/scores', icon: Award },
    { label: 'Guru', href: '/teachers', icon: Users },
    { label: 'Siswa', href: '/students', icon: GraduationCap },
    { label: 'Kelas', href: '/classrooms', icon: Building2 },
    { label: 'Laporan', href: '/reports', icon: FileText },
  ],
}

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  const navItems = roleNavItems[user.role] || []

  return (
    <div className={cn(
      'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r shadow-sm transition-transform duration-200 lg:static lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    )}>
      <div className="flex items-center justify-between h-16 px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-blue-600">
          <img src="/logo.svg" alt="School OS" className="h-8 w-8" />
          School OS
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="h-6 w-6" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Separator className="my-4" />

        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{user.role}</p>
          <p className="text-sm font-medium text-gray-700 mt-1 truncate">{user.name}</p>
        </div>
      </ScrollArea>
    </div>
  )
}
