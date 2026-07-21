import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface Crumb {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
      <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          {item.href ? (
            <Link href={item.href} className="hover:text-blue-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
