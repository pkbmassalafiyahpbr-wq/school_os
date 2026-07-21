'use client'

import { useAuthStore } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Shield, Calendar } from 'lucide-react'
import { Breadcrumb } from '@/shared/breadcrumb'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className="max-w-2xl space-y-6">
      <Breadcrumb items={[{ label: 'Profil', href: '/profile' }]} />
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-gray-500">Informasi akun Anda</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Username</p>
                <p className="text-sm font-medium">{user.name.toLowerCase().replace(/\s+/g, '_')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Role</p>
                <p className="text-sm font-medium">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">ID Akun</p>
                <p className="text-sm font-medium">#{user.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
