import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/shared/auth-provider'
import { Providers } from '@/shared/providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'School OS - SDN 1 Siliasih',
  description: 'Sistem Administrasi Akademik & Platform Pembelajaran Digital',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
