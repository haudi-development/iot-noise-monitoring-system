"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDummyData, getRealtimeNoiseLevels } from '@/lib/data/dummy-data'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Home,
  MapPin,
  Building,
  Users,
  Phone,
  Mail,
  Wifi,
  WifiOff,
  AlertTriangle,
  Volume2,
  Activity,
  ArrowLeft,
  Layers,
  Bell,
  Download,
  Upload,
  Settings
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar
} from 'recharts'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const data = getDummyData()
  const property = data.properties.find(p => p.id === params.id)
  
  const [devices, setDevices] = useState(data.devices.filter(d => d.propertyId === params.id))
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev => getRealtimeNoiseLevels(prev))
    }, 15000)
    
    return () => clearInterval(interval)
  }, [])

  if (!property) {
    return (
      <div className="p-6">
        <p>物件が見つかりません</p>
      </div>
    )
  }

  const company = data.companies.find(c => c.id === property.companyId)
  const rooms = data.rooms.filter(r => r.propertyId === property.id)
  const alerts = data.alerts.filter(a => {
    const device = devices.find(d => d.deviceId === a.deviceId)
    return device !== undefined
  })

  const activeDevices = devices.filter(d => d.status === 'online')
  const offlineDevices = devices.filter(d => d.status === 'offline')
  const warningDevices = devices.filter(d => d.status === 'warning')

  // フロアごとのデータ集計
  const floorData = Array.from({ length: property.floors }, (_, i) => {
    const floor = i + 1
    const floorRooms = rooms.filter(r => r.floor === floor)
    const floorDevices = devices.filter(d => {
      const room = floorRooms.find(r => r.roomNumber === d.roomNumber)
      return room !== undefined
    })
    
    return {
      floor,
      roomCount: floorRooms.length,
      deviceCount: floorDevices.length,
      activeCount: floorDevices.filter(d => d.status === 'online').length,
      avgNoise: floorDevices.length > 0 
        ? (floorDevices.reduce((acc, d) => acc + d.currentNoiseLevel, 0) / floorDevices.length).toFixed(1)
        : 0
    }
  })

  // 24時間の騒音レベル推移（ダミーデータ）
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}時`,
    avg: Math.round((45 + Math.random() * 20 + Math.sin(hour / 4) * 10) * 10) / 10,
    max: Math.round((55 + Math.random() * 30 + Math.sin(hour / 4) * 10) * 10) / 10,
    min: Math.round((35 + Math.random() * 15 + Math.sin(hour / 4) * 10) * 10) / 10
  }))

  // 最近のアラート
  const recentAlerts = alerts.slice(0, 5)

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
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <p className="text-muted-foreground">{company?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            図面アップロード
          </Button>
          <Button className="bg-alsok-blue hover:bg-blue-700">
            <Settings className="h-4 w-4 mr-2" />
            物件設定
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>物件情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">住所</p>
                    <p className="text-sm text-muted-foreground">{property.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">階数</p>
                    <p className="text-sm text-muted-foreground">{property.floors}階建て</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">総部屋数</p>
                    <p className="text-sm text-muted-foreground">{property.totalRooms}室</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">管理者</p>
                    <p className="text-sm text-muted-foreground">{property.manager.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">電話番号</p>
                    <p className="text-sm text-muted-foreground">{property.manager.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">メールアドレス</p>
                    <p className="text-sm text-muted-foreground text-xs">{property.manager.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>デバイスステータス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm">オンライン</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{activeDevices.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-red-600" />
                  <span className="text-sm">オフライン</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{offlineDevices.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">警告</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{warningDevices.length}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">総デバイス数</span>
                  <span className="text-2xl font-bold">{devices.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>24時間騒音レベル推移</CardTitle>
          <CardDescription>物件全体の平均騒音レベル</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={hourlyData}>
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066CC" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0066CC" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB800" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FFB800" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="max"
                stroke="#FFB800"
                fill="url(#colorMax)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="avg"
                stroke="#0066CC"
                fill="url(#colorAvg)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="min"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>フロア別状況</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {floorData.reverse().map(floor => (
                <div
                  key={floor.floor}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedFloor === floor.floor ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedFloor(floor.floor)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{floor.floor}F</span>
                      <span className="text-sm text-muted-foreground">
                        {floor.roomCount}室 / {floor.deviceCount}台
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{floor.avgNoise} dB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          floor.activeCount === floor.deviceCount ? 'bg-green-500' :
                          floor.activeCount > 0 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm">
                          {floor.activeCount}/{floor.deviceCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              最新アラート
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map(alert => (
                <div key={alert.id} className="flex justify-between items-start p-2 rounded hover:bg-gray-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        alert.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        alert.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {alert.priority === 'critical' ? '緊急' :
                         alert.priority === 'high' ? '高' :
                         alert.priority === 'medium' ? '中' : '低'}
                      </span>
                      <span className="text-sm font-medium">{alert.roomNumber}号室</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{alert.noiseLevel.toFixed(1)} dB</span>
                      <span>{alert.duration}分</span>
                      <span>{format(alert.startTime, 'MM/dd HH:mm')}</span>
                    </div>
                  </div>
                </div>
              ))}
              {recentAlerts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  アラートはありません
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}