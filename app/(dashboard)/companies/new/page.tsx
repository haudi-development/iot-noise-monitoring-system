"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Building2, Mail, Phone, User, Calendar, CreditCard } from 'lucide-react'

export default function NewCompanyPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    plan: 'basic',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('この機能は開発中です。')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/companies')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">新規企業登録</h1>
            <p className="text-muted-foreground">新しい契約企業を追加</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">企業名 *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="例: 東京不動産管理株式会社"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">契約プラン *</label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="basic">ベーシック</option>
                  <option value="standard">スタンダード</option>
                  <option value="premium">プレミアム</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">郵便番号</label>
                <Input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="例: 100-0001"
                />
              </div>

              <div>
                <label className="text-sm font-medium">住所</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="例: 東京都千代田区千代田1-1-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                担当者情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">担当者名 *</label>
                <Input
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="例: 山田太郎"
                  required
                />
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
                    placeholder="例: yamada@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">電話番号 *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="例: 03-1234-5678"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">備考</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="特記事項があれば入力してください"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              契約情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">契約開始日</label>
                <Input
                  type="date"
                  name="startDate"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium">契約期間</label>
                <select
                  name="period"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="1year">1年間</option>
                  <option value="2year">2年間</option>
                  <option value="3year">3年間</option>
                  <option value="unlimited">無期限</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">支払い方法</label>
                <select
                  name="payment"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="monthly">月額</option>
                  <option value="yearly">年額</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/companies')}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            className="bg-alsok-blue hover:bg-blue-700"
          >
            企業を登録
          </Button>
        </div>
      </form>
    </div>
  )
}