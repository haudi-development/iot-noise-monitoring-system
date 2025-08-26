"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { getUser, logout } from "@/lib/auth"
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  Home,
  Wifi,
  Bell,
  Users,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const menuItems = [
  { icon: LayoutDashboard, label: "ダッシュボード", href: "/dashboard" },
  { icon: BarChart3, label: "データ分析", href: "/analytics" },
  { icon: Building2, label: "企業管理", href: "/companies" },
  { icon: Home, label: "物件管理", href: "/properties" },
  { icon: Wifi, label: "デバイス管理", href: "/devices" },
  { icon: Bell, label: "アラート管理", href: "/alerts" },
  { icon: Users, label: "ユーザー管理", href: "/users" },
  { icon: Settings, label: "システム設定", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getUser()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white border-r transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className={cn(
          "flex items-center space-x-2 transition-all",
          collapsed && "justify-center"
        )}>
          <div className="bg-alsok-blue text-white p-2 rounded">
            <Shield className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-alsok-blue">ALSOK</h1>
              <p className="text-xs text-muted-foreground">騒音監視システム</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && "ml-0")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                "hover:bg-gray-100",
                isActive && "bg-alsok-blue text-white hover:bg-blue-700",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        {!collapsed && user && (
          <div className="mb-3 px-3 py-2">
            <p className="text-sm font-medium">{user.username}</p>
            <p className="text-xs text-muted-foreground">
              {user.role === 'admin' ? '管理者' : 'オペレーター'}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
            collapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">ログアウト</span>}
        </Button>
      </div>
    </div>
  )
}