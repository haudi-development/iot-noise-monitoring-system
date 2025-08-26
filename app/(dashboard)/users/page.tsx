"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface SystemUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'operator'
  companyId?: string
  companyName?: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
}

const generateUsers = (): SystemUser[] => {
  return [
    {
      id: '1',
      username: 'admin',
      email: 'admin@alsok.co.jp',
      role: 'admin',
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(2024, 0, 1)
    },
    {
      id: '2',
      username: 'operator1',
      email: 'operator1@alsok.co.jp',
      role: 'operator',
      companyName: '東京不動産管理株式会社',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000),
      createdAt: new Date(2024, 2, 15)
    },
    {
      id: '3',
      username: 'operator2',
      email: 'operator2@alsok.co.jp',
      role: 'operator',
      companyName: 'グリーンパーク管理組合',
      isActive: true,
      lastLogin: new Date(Date.now() - 7200000),
      createdAt: new Date(2024, 3, 20)
    },
    {
      id: '4',
      username: 'supervisor1',
      email: 'supervisor1@alsok.co.jp',
      role: 'admin',
      isActive: true,
      lastLogin: new Date(Date.now() - 86400000),
      createdAt: new Date(2024, 1, 10)
    },
    {
      id: '5',
      username: 'operator3',
      email: 'operator3@alsok.co.jp',
      role: 'operator',
      companyName: '関東マンション管理',
      isActive: false,
      lastLogin: new Date(Date.now() - 604800000),
      createdAt: new Date(2024, 4, 5)
    }
  ]
}

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>(generateUsers())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'operator'>('all')

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.companyName && user.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(user =>
      user.id === userId
        ? { ...user, isActive: !user.isActive }
        : user
    ))
  }

  const handleDelete = (userId: string) => {
    if (confirm('このユーザーを削除してもよろしいですか？')) {
      setUsers(prev => prev.filter(user => user.id !== userId))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ユーザー管理</h1>
          <p className="text-muted-foreground">システムユーザーの権限管理</p>
        </div>
        <Button 
          className="bg-alsok-blue hover:bg-blue-700"
          onClick={() => window.location.href = '/users/new'}
        >
          <Plus className="h-4 w-4 mr-2" />
          新規ユーザー追加
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{users.length}</div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">アクティブユーザー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.isActive).length}
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">管理者</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <Shield className="h-5 w-5 text-alsok-blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ユーザー名・メール・企業名で検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          className="px-3 py-2 border rounded-md"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as any)}
        >
          <option value="all">全ロール</option>
          <option value="admin">管理者</option>
          <option value="operator">オペレーター</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ユーザー一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">ユーザー</th>
                  <th className="text-left p-3">ロール</th>
                  <th className="text-left p-3">企業</th>
                  <th className="text-left p-3">ステータス</th>
                  <th className="text-left p-3">最終ログイン</th>
                  <th className="text-left p-3">登録日</th>
                  <th className="text-left p-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-200 rounded-full p-2">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'admin' ? '管理者' : 'オペレーター'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">
                        {user.companyName || '-'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? 'アクティブ' : '無効'}
                      </span>
                    </td>
                    <td className="p-3">
                      {user.lastLogin && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(user.lastLogin, 'MM/dd HH:mm', { locale: ja })}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(user.createdAt, 'yyyy/MM/dd', { locale: ja })}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.isActive ? (
                            <XCircle className="h-4 w-4 text-orange-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}