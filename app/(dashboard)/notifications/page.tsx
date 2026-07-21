'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, Megaphone, ClipboardList, BookOpen, Award } from 'lucide-react'

import { Breadcrumb } from '@/shared/breadcrumb'

const iconMap: Record<string, any> = {
  'Materi Baru': BookOpen,
  'Kuis Baru': ClipboardList,
  default: Megaphone,
}

export default function NotificationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetch('/api/notifications').then(r => r.json()),
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <Breadcrumb items={[{ label: 'Notifikasi', href: '/notifications' }]} />
      <div>
        <h1 className="text-2xl font-bold">Notifikasi</h1>
        <p className="text-gray-500">Pemberitahuan dan pengumuman</p>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : !data?.notifications || data.notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.notifications.map((n: any) => {
                const Icon = iconMap[n.title] || iconMap.default
                return (
                  <div key={n.id} className={`flex items-start gap-4 py-4 ${!n.read ? 'bg-blue-50/50 -mx-4 px-4' : ''}`}>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${n.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                      <Icon className={`h-5 w-5 ${n.read ? 'text-gray-400' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${!n.read ? 'font-medium' : ''}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{new Date(n.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
