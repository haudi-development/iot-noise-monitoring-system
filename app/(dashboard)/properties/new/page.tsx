"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDummyData } from '@/lib/data/dummy-data'
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Layers,
  Home,
  Upload
} from 'lucide-react'

export default function NewPropertyPage() {
  const router = useRouter()
  const data = getDummyData()
  
  const [formData, setFormData] = useState({
    companyId: '',
    name: '',
    address: '',
    postalCode: '',
    floors: '',
    totalRooms: '',
    buildingType: 'apartment',
    constructionYear: '',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    notes: ''
  })

  const [floorPlans, setFloorPlans] = useState<File[]>([])

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFloorPlans(Array.from(e.target.files))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/properties')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">新規物件登録</h1>
            <p className="text-muted-foreground">新しい管理物件を追加</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                物件基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">契約企業 *</label>
                <select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">選択してください</option>
                  {data.companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">物件名 *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="例: グランドタワー新宿"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">建物タイプ</label>
                <select
                  name="buildingType"
                  value={formData.buildingType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="apartment">マンション</option>
                  <option value="office">オフィスビル</option>
                  <option value="complex">複合施設</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">階数 *</label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      name="floors"
                      value={formData.floors}
                      onChange={handleChange}
                      placeholder="例: 15"
                      className="pl-10"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">総部屋数 *</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      name="totalRooms"
                      value={formData.totalRooms}
                      onChange={handleChange}
                      placeholder="例: 120"
                      className="pl-10"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">建築年</label>
                <Input
                  type="number"
                  name="constructionYear"
                  value={formData.constructionYear}
                  onChange={handleChange}
                  placeholder="例: 2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                所在地情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">郵便番号</label>
                <Input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="例: 160-0023"
                />
              </div>

              <div>
                <label className="text-sm font-medium">住所 *</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="例: 東京都新宿区西新宿2-8-1"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">アクセス情報</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="最寄り駅や目印となる建物など"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                管理者情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">管理者名 *</label>
                <Input
                  name="managerName"
                  value={formData.managerName}
                  onChange={handleChange}
                  placeholder="例: 佐藤花子"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">電話番号 *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    name="managerPhone"
                    value={formData.managerPhone}
                    onChange={handleChange}
                    placeholder="例: 090-1234-5678"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">メールアドレス *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    name="managerEmail"
                    value={formData.managerEmail}
                    onChange={handleChange}
                    placeholder="例: sato@property.co.jp"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                図面アップロード
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">フロア図面</label>
                  <div className="mt-2">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      id="floor-plans"
                    />
                    <label
                      htmlFor="floor-plans"
                      className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          クリックしてファイルを選択
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          PDF, JPG, PNG (最大10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                  {floorPlans.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">選択されたファイル:</p>
                      {floorPlans.map((file, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/properties')}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            className="bg-alsok-blue hover:bg-blue-700"
          >
            物件を登録
          </Button>
        </div>
      </form>
    </div>
  )
}