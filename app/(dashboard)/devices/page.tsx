"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDummyData, getRealtimeNoiseLevels } from '@/lib/data/dummy-data'
import { fetchLatestDeviceReadings, mapReadingToDevice, DeviceReadingDTO } from '@/lib/real-device-client'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Wifi,
  WifiOff,
  Search,
  Settings,
  Volume2,
  AlertTriangle,
  Clock,
  MapPin,
  Activity,
  Router,
  Plus
} from 'lucide-react'

export default function DevicesPage() {
  const data = getDummyData()
  const [dummyDevices, setDummyDevices] = useState(data.devices)
  const [realReadings, setRealReadings] = useState<DeviceReadingDTO[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'warning'>('all')

  const realDevices = useMemo(() => realReadings.map(mapReadingToDevice), [realReadings])
  const devices = useMemo(() => [...dummyDevices, ...realDevices], [dummyDevices, realDevices])
  const realReadingLookup = useMemo(() => {
    const map = new Map<string, DeviceReadingDTO>()
    realReadings.forEach(reading => {
      map.set(reading.deviceId, reading)
    })
    return map
  }, [realReadings])

  useEffect(() => {
    const interval = setInterval(() => {
      setDummyDevices(prev => getRealtimeNoiseLevels(prev))
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const readings = await fetchLatestDeviceReadings()
        const sorted = [...readings].sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
        if (!cancelled) {
          setRealReadings(sorted)
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('リアルデバイスデータの取得に失敗しました', error)
        }
      }
    }

    load()
    const interval = setInterval(load, 15000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.propertyName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = useMemo(() => ({
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    warning: devices.filter(d => d.status === 'warning').length,
    total: devices.length
  }), [devices])

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'bg-green-100 text-green-700'
      case 'offline': return 'bg-red-100 text-red-700'
      case 'warning': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getNoiseLevelColor = (level: number) => {
    if (level >= 85) return 'text-red-600'
    if (level >= 70) return 'text-orange-600'
    if (level >= 55) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">デバイス管理</h1>
          <p className="text-muted-foreground">IoTセンサーデバイスのステータス監視と設定</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-alsok-blue hover:bg-blue-700"
            onClick={() => window.location.href = '/devices/new'}
          >
            <Plus className="h-4 w-4 mr-2" />
            新規デバイス
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            一括設定
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">オンライン</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{stats.online}</div>
              <Wifi className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">オフライン</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-600">{stats.offline}</div>
              <WifiOff className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">警告</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">総デバイス数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total}</div>
              <Router className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="デバイスID・部屋番号で検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          className="px-3 py-2 border rounded-md"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
        >
          <option value="all">全ステータス</option>
          <option value="online">オンライン</option>
          <option value="offline">オフライン</option>
          <option value="warning">警告</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>デバイス一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">デバイスID</th>
                  <th className="text-left p-2">物件名</th>
                  <th className="text-left p-2">位置</th>
                  <th className="text-left p-2">ステータス</th>
                  <th className="text-left p-2">騒音レベル</th>
                  <th className="text-left p-2">最終通信</th>
                  <th className="text-left p-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map(device => {
                  const reading = realReadingLookup.get(device.deviceId)
                  const isRealDevice = Boolean(reading)
                  const recordedAt = reading ? new Date(reading.recordedAt) : null

                  return (
                    <tr key={device.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 align-top">
                        <div className="font-medium">{device.deviceId}</div>
                        {isRealDevice && (
                          <span className="mt-1 inline-block rounded-full bg-alsok-blue/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-alsok-blue">
                            実機デバイス
                          </span>
                        )}
                      </td>
                      <td className="p-2 align-top">
                        <div className="text-sm">{device.propertyName}</div>
                      </td>
                      <td className="p-2 align-top">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {device.location}
                        </div>
                        {reading?.metadata?.notes && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {reading.metadata.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-2 align-top">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(device.status)}`}>
                          {device.status === 'online' ? 'オンライン' :
                           device.status === 'offline' ? 'オフライン' : '警告'}
                        </span>
                      </td>
                      <td className="p-2 align-top">
                      <div className={`flex items-center ${getNoiseLevelColor(device.currentNoiseLevel)}`}>
                        <Volume2 className="h-4 w-4 mr-1" />
                        <span className="font-medium">{device.currentNoiseLevel.toFixed(1)} dB</span>
                        {device.status === 'online' && (
                          <Activity className="h-3 w-3 ml-1 text-green-500" />
                        )}
                      </div>
                      {(reading?.noiseMax ?? device.currentNoiseMax) !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          最大 {(reading?.noiseMax ?? device.currentNoiseMax)?.toFixed(1)} dB
                        </div>
                      )}
                      {reading && (
                        <div className="mt-1 space-x-2 text-xs text-muted-foreground">
                          {reading.temperature !== undefined && (
                            <span>温度 {reading.temperature.toFixed(1)}℃</span>
                          )}
                            {reading.humidity !== undefined && (
                              <span>湿度 {reading.humidity.toFixed(0)}%</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-2 align-top">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(device.lastCommunication, 'HH:mm', { locale: ja })}
                        </div>
                        {recordedAt && (
                          <div className="text-xs text-muted-foreground">
                            計測 {format(recordedAt, 'HH:mm:ss', { locale: ja })}
                          </div>
                        )}
                        {reading?.batteryLevel !== undefined && (
                          <div className="text-xs text-muted-foreground">
                            バッテリー {reading.batteryLevel.toFixed(0)}%
                          </div>
                        )}
                      </td>
                      <td className="p-2 align-top">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
