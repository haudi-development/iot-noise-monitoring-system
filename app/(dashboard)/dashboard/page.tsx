"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDummyData, getRealtimeNoiseLevels } from '@/lib/data/dummy-data'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Bell,
  Wifi,
  Volume2,
  AlertCircle,
  TrendingUp,
  Building2,
  Activity
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts'

export default function DashboardPage() {
  const [data, setData] = useState(getDummyData())
  const [devices, setDevices] = useState(data.devices)

  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev => getRealtimeNoiseLevels(prev))
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const todayAlerts = data.alerts.filter(
    alert => alert.startTime.toDateString() === new Date().toDateString()
  )
  
  const activeDevices = devices.filter(d => d.status === 'online')
  const averageNoiseLevel = (
    activeDevices.reduce((acc, d) => acc + d.currentNoiseLevel, 0) / activeDevices.length
  ).toFixed(1)
  const pendingAlerts = data.alerts.filter(a => a.status === 'new')

  const companyAlertData = data.companies.map(company => {
    const companyProperties = data.properties.filter(p => p.companyId === company.id)
    const propertyIds = companyProperties.map(p => p.id)
    const companyDevices = devices.filter(d => propertyIds.includes(d.propertyId))
    const deviceIds = companyDevices.map(d => d.deviceId)
    const alertCount = data.alerts.filter(a => deviceIds.includes(a.deviceId)).length
    
    return {
      name: company.name.substring(0, 10),
      alerts: alertCount
    }
  })

  const hourlyNoiseData = Array.from({ length: 24 }, (_, hour) => {
    const hourDevices = devices.filter(d => d.status === 'online')
    const avgNoise = hourDevices.length > 0
      ? Math.round(hourDevices.reduce((acc, d) => acc + d.currentNoiseLevel + (Math.random() - 0.5) * 20, 0) / hourDevices.length)
      : 0
    
    return {
      hour: `${hour}時`,
      noise: Math.max(30, Math.min(90, avgNoise))
    }
  })

  const latestAlerts = data.alerts.slice(0, 10)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">システム全体の状況をリアルタイムで確認</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本日のアラート</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              前日比 {Math.random() > 0.5 ? '+' : '-'}{Math.floor(Math.random() * 10)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブデバイス</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDevices.length}/{devices.length}</div>
            <p className="text-xs text-muted-foreground">
              稼働率 {Math.round(activeDevices.length / devices.length * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均騒音レベル</CardTitle>
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageNoiseLevel} dB</div>
            <p className="text-xs text-muted-foreground">
              正常範囲内
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">対応待ち</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              要対応アラート
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              企業別アラート発生状況
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={companyAlertData}>
                <defs>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066CC" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#0066CC" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="alerts" fill="url(#colorAlerts)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              時間帯別騒音レベル推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyNoiseData}>
                <defs>
                  <linearGradient id="colorNoise" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB800" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FFB800" stopOpacity={0.1}/>
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
                  dataKey="noise" 
                  stroke="#FFB800" 
                  strokeWidth={2}
                  fill="url(#colorNoise)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            最新アラート一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">発生時刻</th>
                  <th className="text-left p-2">物件名</th>
                  <th className="text-left p-2">部屋番号</th>
                  <th className="text-left p-2">騒音レベル</th>
                  <th className="text-left p-2">優先度</th>
                  <th className="text-left p-2">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {latestAlerts.map(alert => (
                  <tr key={alert.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      {format(alert.startTime, 'MM/dd HH:mm', { locale: ja })}
                    </td>
                    <td className="p-2">{alert.propertyName}</td>
                    <td className="p-2">{alert.roomNumber}</td>
                    <td className="p-2">{alert.noiseLevel.toFixed(1)} dB</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        alert.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        alert.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {alert.priority === 'critical' ? '緊急' :
                         alert.priority === 'high' ? '高' :
                         alert.priority === 'medium' ? '中' : '低'}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        alert.status === 'new' ? 'bg-blue-100 text-blue-700' :
                        alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {alert.status === 'new' ? '新規' :
                         alert.status === 'acknowledged' ? '確認済' : '解決済'}
                      </span>
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