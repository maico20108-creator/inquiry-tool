'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  MessageSquare, FileText, Settings, Users, LogOut, Store, LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  user: { name?: string | null; email?: string | null; role?: string | null; id?: string | null }
}

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/inquiries', label: '問い合わせ', icon: MessageSquare },
  { href: '/templates', label: 'テンプレート', icon: FileText },
]

const adminItems = [
  { href: '/settings/users', label: 'ユーザー管理', icon: Users },
  { href: '/settings/stores', label: '店舗設定', icon: Store },
]

export function Sidebar({ user }: Props) {
  const pathname = usePathname()
  const isAdmin = user.role === 'admin'

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-md">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-sm text-gray-900">EC問い合わせ管理</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider">管理者</p>
            </div>
            {adminItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname.startsWith(href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
            {user.name?.[0] ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500">{isAdmin ? '管理者' : 'スタッフ'}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-700 hover:text-red-600"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          ログアウト
        </Button>
      </div>
    </aside>
  )
}
