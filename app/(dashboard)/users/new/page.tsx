"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDummyData } from '@/lib/data/dummy-data'
import { 
  ArrowLeft, 
  User,
  Mail,
  Phone,
  Shield,
  Building,
  Key
} from 'lucide-react'

export default function NewUserPage() {
  const router = useRouter()
  const data = getDummyData()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'operator',
    companyId: '',
    fullName: '',
    phone: '',
    department: '',
    notifications: {
      email: true,
      sms: false,
      critical: true,
      high: true,
      medium: false,
      low: false
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('パスワードが一致しません')
      return
    }
    alert('この機能は開発中です。')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCheckboxChange = (category: string, field: string) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [field]: !formData.notifications[field as keyof typeof formData.notifications]
      }
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/users')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">新規ユーザー登録</h1>
            <p className="text-muted-foreground">システムユーザーを追加</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">氏名 *</label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="例: 山田太郎"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">ユーザー名 *</label>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="例: yamada_t"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ログイン時に使用する英数字のID
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">メールアドレス *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="例: yamada@alsok.co.jp"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">電話番号</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="例: 090-1234-5678"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">部署</label>
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="例: セキュリティ管理部"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                アカウント設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">パスワード *</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="8文字以上の英数字"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  8文字以上の英数字を含むパスワード
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">パスワード確認 *</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="パスワードを再入力"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">権限 *</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-10 py-2 border rounded-md"
                    required
                  >
                    <option value="admin">管理者</option>
                    <option value="operator">オペレーター</option>
                  </select>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  管理者: 全機能へのアクセス権限
                  <br />
                  オペレーター: アラート対応と閲覧権限
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">所属企業</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    className="w-full px-10 py-2 border rounded-md"
                  >
                    <option value="">全企業（ALSOK）</option>
                    {data.companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  特定企業のみアクセスを制限する場合に選択
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-3">通知方法</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.notifications.email}
                        onChange={() => handleCheckboxChange('method', 'email')}
                        className="rounded"
                      />
                      <span className="text-sm">メール通知</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.notifications.sms}
                        onChange={() => handleCheckboxChange('method', 'sms')}
                        className="rounded"
                      />
                      <span className="text-sm">SMS通知</span>
                    </label>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">アラート優先度</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.notifications.critical}
                        onChange={() => handleCheckboxChange('priority', 'critical')}
                        className="rounded"
                      />
                      <span className="text-sm">緊急</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.notifications.high}
                        onChange={() => handleCheckboxChange('priority', 'high')}
                        className="rounded"
                      />
                      <span className="text-sm">高</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.notifications.medium}
                        onChange={() => handleCheckboxChange('priority', 'medium')}
                        className="rounded"
                      />
                      <span className="text-sm">中</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.notifications.low}
                        onChange={() => handleCheckboxChange('priority', 'low')}
                        className="rounded"
                      />
                      <span className="text-sm">低</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/users')}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            className="bg-alsok-blue hover:bg-blue-700"
          >
            ユーザーを登録
          </Button>
        </div>
      </form>
    </div>
  )
}