"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDummyData } from '@/lib/data/dummy-data'
import { 
  ArrowLeft, 
  Wifi, 
  MapPin,
  Volume2,
  Settings,
  AlertCircle
} from 'lucide-react'

export default function NewDevicePage() {
  const router = useRouter()
  const data = getDummyData()
  
  const [formData, setFormData] = useState({
    deviceId: '',
    propertyId: '',
    roomNumber: '',
    location: '',
    normalMin: '30',
    normalMax: '70',
    nightMin: '30',
    nightMax: '55',
    holidayMin: '30',
    holidayMax: '65',
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

  const selectedProperty = data.properties.find(p => p.id === formData.propertyId)
  const rooms = selectedProperty ? data.rooms.filter(r => r.propertyId === selectedProperty.id) : []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/devices')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">新規デバイス登録</h1>
            <p className="text-muted-foreground">新しい騒音監視デバイスを追加</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                デバイス基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">デバイスID *</label>
                <Input
                  name="deviceId"
                  value={formData.deviceId}
                  onChange={handleChange}
                  placeholder="例: IOT-000101"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  デバイス本体に記載されているIDを入力してください
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">設置物件 *</label>
                <select
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">選択してください</option>
                  {data.properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.name} ({property.companyName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">設置部屋 *</label>
                <select
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={!formData.propertyId}
                >
                  <option value="">選択してください</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.roomNumber}>
                      {room.roomNumber}号室 ({room.floor}F)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">設置場所詳細</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="例: リビング天井中央"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                騒音レベル閾値設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  各時間帯の騒音レベル閾値を設定してください（単位: dB）
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">通常時間帯</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      name="normalMin"
                      value={formData.normalMin}
                      onChange={handleChange}
                      placeholder="最小"
                      min="0"
                      max="150"
                    />
                    <Input
                      type="number"
                      name="normalMax"
                      value={formData.normalMax}
                      onChange={handleChange}
                      placeholder="最大"
                      min="0"
                      max="150"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">夜間時間帯</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      name="nightMin"
                      value={formData.nightMin}
                      onChange={handleChange}
                      placeholder="最小"
                      min="0"
                      max="150"
                    />
                    <Input
                      type="number"
                      name="nightMax"
                      value={formData.nightMax}
                      onChange={handleChange}
                      placeholder="最大"
                      min="0"
                      max="150"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">休日時間帯</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      name="holidayMin"
                      value={formData.holidayMin}
                      onChange={handleChange}
                      placeholder="最小"
                      min="0"
                      max="150"
                    />
                    <Input
                      type="number"
                      name="holidayMax"
                      value={formData.holidayMax}
                      onChange={handleChange}
                      placeholder="最大"
                      min="0"
                      max="150"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                追加設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">アラート遅延時間</label>
                  <select
                    name="alertDelay"
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="1">1分</option>
                    <option value="3">3分</option>
                    <option value="5">5分</option>
                    <option value="10">10分</option>
                    <option value="15">15分</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    騒音が継続した場合にアラートを発生させる時間
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">データ送信間隔</label>
                  <select
                    name="dataInterval"
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="15">15秒</option>
                    <option value="30">30秒</option>
                    <option value="60">1分</option>
                    <option value="300">5分</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">初期ステータス</label>
                  <select
                    name="initialStatus"
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="active">アクティブ</option>
                    <option value="inactive">非アクティブ</option>
                    <option value="test">テストモード</option>
                  </select>
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
                  placeholder="設置に関する注意事項など"
                />
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">設置前の確認事項</p>
                    <ul className="text-sm text-yellow-700 mt-2 space-y-1 ml-4 list-disc">
                      <li>デバイスの電源接続を確認してください</li>
                      <li>Wi-Fi接続設定が完了していることを確認してください</li>
                      <li>設置場所が騒音を適切に検知できる位置であることを確認してください</li>
                    </ul>
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
            onClick={() => router.push('/devices')}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            className="bg-alsok-blue hover:bg-blue-700"
          >
            デバイスを登録
          </Button>
        </div>
      </form>
    </div>
  )
}