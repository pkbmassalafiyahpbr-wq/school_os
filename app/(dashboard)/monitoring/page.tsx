'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, User, BookOpen, ClipboardList } from 'lucide-react'
import { Breadcrumb } from '@/shared/breadcrumb'

export default function MonitoringPage() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => fetch('/api/activities').then(r => r.json()),
  })

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Monitoring', href: '/monitoring' }]} />
      <div>
        <h1 className="text-2xl font-bold">Monitoring</h1>
        <p className="text-gray-500">Pantau aktivitas sekolah</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aktivitas Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : !activities || activities.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Activity className="h-12 w-12 mx-auto mb-2" />
              <p>Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((a: any) => (
                <div key={a.id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                    {a.entity === 'Material' ? (
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    ) : a.entity === 'Quiz' || a.entity === 'QuizAttempt' ? (
                      <ClipboardList className="h-4 w-4 text-orange-600" />
                    ) : (
                      <User className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{a.user_name}</span>
                      <span className="text-gray-500"> {a.action}</span>
                    </p>
                    <p className="text-xs text-gray-400">{a.entity}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
