"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { getDummyData } from '@/lib/data/dummy-data'
import { fetchLatestDeviceReadings, mapReadingToDevice, DeviceReadingDTO } from '@/lib/real-device-client'
import { format, subHours, differenceInHours, differenceInMinutes, eachHourOfInterval, eachDayOfInterval, eachMinuteOfInterval } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  BarChart
} from 'recharts'
import {
  TrendingUp,
  Download,
  Activity,
  Wifi,
  Filter,
  Check,
  X,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  TrendingDown,
  AlertCircle
} from 'lucide-react'

// デバイスの色パレット（最大20色）
const DEVICE_COLORS = [
  '#0066CC', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#F4A460', '#6C5CE7', '#00CEC9',
  '#FD79A8', '#A29BFE', '#FDCB6E', '#6C63FF', '#FF6348',
  '#30336B', '#20BF6B', '#FC5C65', '#45AAF2', '#FFA502'
]

// アラートカテゴリの色
const ALERT_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e'
}

export default function AnalyticsPage() {
  const data = getDummyData()
  const [startDate, setStartDate] = useState(subHours(new Date(), 24))
  const [endDate, setEndDate] = useState(new Date())
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [showDeviceSelector, setShowDeviceSelector] = useState(false)
  const [graphMode, setGraphMode] = useState<'actual' | 'average' | 'alerts'>('average')
  const [selectedAlertCategories, setSelectedAlertCategories] = useState<string[]>(['critical', 'high', 'medium', 'low'])
  const [showAlertFilter, setShowAlertFilter] = useState(false)
  const [realReadings, setRealReadings] = useState<DeviceReadingDTO[]>([])

  const realDevices = useMemo(() => realReadings.map(mapReadingToDevice), [realReadings])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const readings = await fetchLatestDeviceReadings()
        if (!cancelled) {
          const sorted = [...readings].sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
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

  // フィルター対象のデバイスを取得（初期は空）
  const filteredDevices = selectedDevices.length > 0 
    ? data.devices.filter(d => selectedDevices.includes(d.deviceId))
    : []

  const handleDateChange = (start: Date, end: Date) => {
    setStartDate(start)
    setEndDate(end)
  }

  // 物件単位でデバイスを選択/解除
  const handlePropertyToggle = (propertyId: string) => {
    const propertyDevices = data.devices.filter(d => d.propertyId === propertyId)
    const propertyDeviceIds = propertyDevices.map(d => d.deviceId)
    const isAllSelected = propertyDeviceIds.every(id => selectedDevices.includes(id))
    
    if (isAllSelected) {
      // すべて選択済みなら解除
      setSelectedDevices(selectedDevices.filter(id => !propertyDeviceIds.includes(id)))
    } else {
      // 未選択があれば全て選択
      const newSelection = Array.from(new Set([...selectedDevices, ...propertyDeviceIds]))
      setSelectedDevices(newSelection)
    }
  }

  // 時間間隔に基づいてデータポイントを生成
  const getTimeSeriesData = () => {
    const hours = differenceInHours(endDate, startDate)
    const minutes = differenceInMinutes(endDate, startDate)
    
    let intervals: Date[] = []
    let timeFormat = 'HH:mm'
    
    if (minutes <= 60) {
      intervals = eachMinuteOfInterval({ start: startDate, end: endDate }, { step: 5 })
      timeFormat = 'HH:mm'
    } else if (hours <= 24) {
      intervals = eachMinuteOfInterval({ start: startDate, end: endDate }, { step: 15 })
      timeFormat = 'MM/dd HH:mm'
    } else if (hours <= 168) {
      intervals = eachHourOfInterval({ start: startDate, end: endDate })
      timeFormat = 'MM/dd HH:mm'
    } else {
      intervals = eachDayOfInterval({ start: startDate, end: endDate })
      timeFormat = 'MM/dd'
    }

    return intervals.map(date => {
      const dataPoint: any = {
        time: format(date, timeFormat)
      }

      if (graphMode === 'actual') {
        // 実測モード：各デバイスの個別データ
        filteredDevices.forEach((device, index) => {
          const baseNoise = device.currentNoiseLevel
          const variation = Math.sin(date.getHours() / 4) * 5 + (Math.random() - 0.5) * 10
          dataPoint[`device_${device.deviceId}`] = Math.round((baseNoise + variation) * 10) / 10
        })
      } else if (graphMode === 'average') {
        // 平均モード：選択デバイスの平均値
        if (filteredDevices.length > 0) {
          const deviceNoises = filteredDevices.map(d => {
            const baseNoise = d.currentNoiseLevel
            const variation = Math.sin(date.getHours() / 4) * 5 + (Math.random() - 0.5) * 10
            return baseNoise + variation
          })
          const avgNoise = deviceNoises.reduce((a, b) => a + b, 0) / deviceNoises.length
          dataPoint.average = Math.round(avgNoise * 10) / 10
        } else {
          dataPoint.average = 0
        }
      } else if (graphMode === 'alerts') {
        // アラートモード：デバイス別のアラート数（カテゴリごと）
        filteredDevices.slice(0, 10).forEach(device => {
          selectedAlertCategories.forEach(category => {
            const key = `${device.roomNumber}_${category}`
            if (category === 'critical') dataPoint[key] = Math.floor(Math.random() * 2)
            else if (category === 'high') dataPoint[key] = Math.floor(Math.random() * 3)
            else if (category === 'medium') dataPoint[key] = Math.floor(Math.random() * 4)
            else if (category === 'low') dataPoint[key] = Math.floor(Math.random() * 5)
          })
        })
      }

      return dataPoint
    })
  }

  const timeSeriesData = getTimeSeriesData()

  const alertsByPriority = [
    { name: '緊急', value: data.alerts.filter(a => a.priority === 'critical').length, color: '#ef4444' },
    { name: '高', value: data.alerts.filter(a => a.priority === 'high').length, color: '#f97316' },
    { name: '中', value: data.alerts.filter(a => a.priority === 'medium').length, color: '#eab308' },
    { name: '低', value: data.alerts.filter(a => a.priority === 'low').length, color: '#22c55e' }
  ]

  // レーダーチャート用データ
  const radarData = [
    { metric: '平均騒音', value: 65, fullMark: 100 },
    { metric: 'デバイス稼働率', value: 85, fullMark: 100 },
    { metric: '応答時間', value: 92, fullMark: 100 },
    { metric: 'アラート解決率', value: 78, fullMark: 100 },
    { metric: '誤検知率', value: 95, fullMark: 100 },
    { metric: 'システム安定性', value: 88, fullMark: 100 }
  ]

  const realSummary = useMemo(() => {
    if (realReadings.length === 0) {
      return {
        count: 0,
        avg: null as number | null,
        maxEntry: null as DeviceReadingDTO | null,
      }
    }

    const avg = realReadings.reduce((sum, item) => sum + item.noiseLevel, 0) / realReadings.length
    const maxEntry = realReadings.reduce((prev, curr) => {
      const prevLevel = prev?.noiseMax ?? prev?.noiseLevel ?? 0
      const currLevel = curr.noiseMax ?? curr.noiseLevel
      return currLevel > prevLevel ? curr : prev
    })

    return {
      count: realReadings.length,
      avg,
      maxEntry,
    }
  }, [realReadings])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            let displayName = entry.name
            
            if (graphMode === 'alerts') {
              const parts = entry.name.split('_')
              const room = parts[0]
              const category = parts[1]
              const categoryLabel = category === 'critical' ? '緊急' : 
                                  category === 'high' ? '高' :
                                  category === 'medium' ? '中' : '低'
              displayName = `${room}号室 (${categoryLabel})`
            } else if (entry.name.startsWith('device_')) {
              const deviceId = entry.name.replace('device_', '')
              const device = filteredDevices.find(d => d.deviceId === deviceId)
              displayName = device ? `${device.roomNumber}号室` : deviceId
            } else if (entry.name === 'average') {
              displayName = '平均値'
            }
            
            const unit = graphMode === 'alerts' ? '件' : 'dB'
            return (
              <p key={index} className="text-xs" style={{ color: entry.color }}>
                {displayName}: {entry.value} {unit}
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  // グラフコンポーネントの選択
  const renderMainChart = () => {
    if (graphMode === 'actual') {
      // 実測モード：複数の折れ線
      return (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
            <XAxis 
              dataKey="time" 
              stroke="#888" 
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#888" 
              fontSize={11}
              label={{ value: '騒音レベル (dB)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => {
                if (value.startsWith('device_')) {
                  const deviceId = value.replace('device_', '')
                  const device = filteredDevices.find(d => d.deviceId === deviceId)
                  return device ? `${device.roomNumber}号室` : deviceId
                }
                return value
              }}
            />
            {filteredDevices.map((device, index) => (
              <Line
                key={device.deviceId}
                type="monotone"
                dataKey={`device_${device.deviceId}`}
                stroke={DEVICE_COLORS[index % DEVICE_COLORS.length]}
                strokeWidth={2}
                dot={false}
                name={`device_${device.deviceId}`}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      )
    } else if (graphMode === 'average') {
      // 平均モード：1本の折れ線とエリア
      return (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={timeSeriesData}>
            <defs>
              <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066CC" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#0066CC" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
            <XAxis 
              dataKey="time" 
              stroke="#888" 
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#888" 
              fontSize={11}
              label={{ value: '騒音レベル (dB)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="average"
              stroke="#0066CC"
              strokeWidth={2}
              fill="url(#avgGradient)"
              name="平均騒音レベル"
            />
          </ComposedChart>
        </ResponsiveContainer>
      )
    } else {
      // アラートモード：デバイス別の積み上げ棒グラフ
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
            <XAxis 
              dataKey="time" 
              stroke="#888" 
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#888" 
              fontSize={11}
              label={{ value: 'アラート数', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => {
                const parts = value.split('_')
                const room = parts[0]
                const category = parts[1]
                const categoryLabel = category === 'critical' ? '緊急' : 
                                    category === 'high' ? '高' :
                                    category === 'medium' ? '中' : '低'
                return `${room}号室 (${categoryLabel})`
              }}
            />
            {filteredDevices.slice(0, 10).map((device, deviceIndex) => (
              selectedAlertCategories.map(category => {
                const key = `${device.roomNumber}_${category}`
                return (
                  <Bar 
                    key={key}
                    dataKey={key}
                    stackId={`device_${device.deviceId}`}
                    fill={ALERT_COLORS[category as keyof typeof ALERT_COLORS]}
                    name={key}
                  />
                )
              })
            )).flat()}
          </BarChart>
        </ResponsiveContainer>
      )
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">データ分析</h1>
        <p className="text-muted-foreground">騒音データとアラートの詳細分析</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              実機データサマリー
            </CardTitle>
            <CardDescription>最新受信分から算出した実測統計</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">受信デバイス</p>
              <p className="text-2xl font-semibold">{realSummary.count}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">平均騒音</p>
              <p className="text-2xl font-semibold">
                {realSummary.avg !== null ? `${realSummary.avg.toFixed(1)} dB` : '---'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">最大騒音</p>
              <p className="text-2xl font-semibold">
                {realSummary.maxEntry
                  ? `${(realSummary.maxEntry.noiseMax ?? realSummary.maxEntry.noiseLevel).toFixed(1)} dB`
                  : '---'}
              </p>
              {realSummary.maxEntry && (
                <p className="text-xs text-muted-foreground mt-1">
                  {realSummary.maxEntry.deviceId}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              最新実機ログ
            </CardTitle>
            <CardDescription>直近 5 件の受信データ</CardDescription>
          </CardHeader>
          <CardContent>
            {realReadings.length === 0 ? (
              <p className="text-sm text-muted-foreground">実機からのデータがまだありません。</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="p-2 text-left">受信</th>
                      <th className="p-2 text-left">デバイスID</th>
                      <th className="p-2 text-left">騒音</th>
                      <th className="p-2 text-left">最大</th>
                      <th className="p-2 text-left">温度</th>
                      <th className="p-2 text-left">湿度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {realReadings.slice(0, 5).map((reading, index) => (
                      <tr key={`${reading.deviceId}-${reading.receivedAt}-${index}`} className="border-b last:border-none">
                        <td className="p-2 whitespace-nowrap">{format(new Date(reading.receivedAt), 'MM/dd HH:mm:ss', { locale: ja })}</td>
                        <td className="p-2">{reading.deviceId}</td>
                        <td className="p-2">{reading.noiseLevel.toFixed(1)} dB</td>
                        <td className="p-2">{reading.noiseMax !== undefined ? `${reading.noiseMax.toFixed(1)} dB` : '-'}</td>
                        <td className="p-2">{reading.temperature !== undefined ? `${reading.temperature.toFixed(1)}℃` : '-'}</td>
                        <td className="p-2">{reading.humidity !== undefined ? `${reading.humidity.toFixed(0)}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            レポート出力
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap items-center">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />

        <div className="relative">
          <Button 
            variant="outline"
            onClick={() => setShowDeviceSelector(!showDeviceSelector)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            デバイス選択 {selectedDevices.length > 0 && `(${selectedDevices.length})`}
          </Button>
          
          {showDeviceSelector && (
            <div className="absolute top-10 left-0 z-50 bg-white/95 backdrop-blur-sm border rounded-lg shadow-xl p-4 w-96 max-h-[500px] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">表示デバイス選択</h4>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setSelectedDevices(data.devices.map(d => d.deviceId))}
                  >
                    全選択
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setSelectedDevices([])}
                  >
                    クリア
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDeviceSelector(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {data.properties.slice(0, 5).map(property => {
                  const propertyDevices = data.devices.filter(d => d.propertyId === property.id)
                  const propertyDeviceIds = propertyDevices.map(d => d.deviceId)
                  const selectedCount = propertyDevices.filter(d => selectedDevices.includes(d.deviceId)).length
                  const isAllSelected = propertyDeviceIds.every(id => selectedDevices.includes(id))
                  const isPartiallySelected = selectedCount > 0 && selectedCount < propertyDevices.length
                  
                  return (
                    <div key={property.id} className="border-b pb-3">
                      <div className="flex justify-between items-center mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = isPartiallySelected
                            }}
                            onChange={() => handlePropertyToggle(property.id)}
                            className="rounded"
                          />
                          <h5 className="text-sm font-medium">{property.name}</h5>
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {selectedCount}/{propertyDevices.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pl-6">
                        {propertyDevices.slice(0, 10).map(device => (
                          <label 
                            key={device.id}
                            className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={selectedDevices.includes(device.deviceId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDevices([...selectedDevices, device.deviceId])
                                } else {
                                  setSelectedDevices(selectedDevices.filter(id => id !== device.deviceId))
                                }
                              }}
                              className="rounded-sm"
                            />
                            <span className="flex items-center gap-1">
                              {device.roomNumber}
                              <span className={`w-2 h-2 rounded-full ${
                                device.status === 'online' ? 'bg-green-500' :
                                device.status === 'offline' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`} />
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {graphMode === 'alerts' && (
          <div className="relative">
            <Button 
              variant="outline"
              onClick={() => setShowAlertFilter(!showAlertFilter)}
              className="flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              アラートカテゴリ ({selectedAlertCategories.length})
            </Button>
            
            {showAlertFilter && (
              <div className="absolute top-10 left-0 z-50 bg-white/95 backdrop-blur-sm border rounded-lg shadow-xl p-4">
                <h4 className="font-medium mb-3">表示するアラートカテゴリ</h4>
                <div className="space-y-2">
                  {['critical', 'high', 'medium', 'low'].map(category => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAlertCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAlertCategories([...selectedAlertCategories, category])
                          } else {
                            setSelectedAlertCategories(selectedAlertCategories.filter(c => c !== category))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {category === 'critical' ? '緊急' :
                         category === 'high' ? '高' :
                         category === 'medium' ? '中' : '低'}
                      </span>
                      <span 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: ALERT_COLORS[category as keyof typeof ALERT_COLORS] }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          {filteredDevices.length}台のデバイスを表示中
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>騒音レベル推移</CardTitle>
                <CardDescription>選択期間の騒音レベルとアラート発生状況</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={graphMode === 'actual' ? 'default' : 'outline'}
                  onClick={() => setGraphMode('actual')}
                  className={graphMode === 'actual' ? 'bg-alsok-blue hover:bg-blue-700' : ''}
                >
                  <LineChartIcon className="h-4 w-4 mr-2" />
                  実測
                </Button>
                <Button
                  size="sm"
                  variant={graphMode === 'average' ? 'default' : 'outline'}
                  onClick={() => setGraphMode('average')}
                  className={graphMode === 'average' ? 'bg-alsok-blue hover:bg-blue-700' : ''}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  平均
                </Button>
                <Button
                  size="sm"
                  variant={graphMode === 'alerts' ? 'default' : 'outline'}
                  onClick={() => setGraphMode('alerts')}
                  className={graphMode === 'alerts' ? 'bg-alsok-blue hover:bg-blue-700' : ''}
                >
                  <BarChartIcon className="h-4 w-4 mr-2" />
                  アラート
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDevices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <Filter className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">デバイスを選択してください</p>
                <p className="text-sm mt-2">左上の「デバイス選択」ボタンからデバイスを選択すると、グラフが表示されます</p>
              </div>
            ) : (
              <>
                {graphMode === 'actual' && filteredDevices.length > 20 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      20台以上のデバイスが選択されています。グラフが見づらくなる可能性があります。
                    </p>
                  </div>
                )}
                {graphMode === 'alerts' && filteredDevices.length > 10 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      アラートモードでは最大10台のデバイスが表示されます。
                    </p>
                  </div>
                )}
                {renderMainChart()}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>システムパフォーマンス</CardTitle>
            <CardDescription>各指標のスコア</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="metric" fontSize={11} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                <Radar
                  name="スコア"
                  dataKey="value"
                  stroke="#0066CC"
                  fill="#0066CC"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>アラート分布</CardTitle>
            <CardDescription>優先度別の割合</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={alertsByPriority}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {alertsByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">平均騒音レベル</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredDevices.length > 0 
                ? (filteredDevices.reduce((acc, d) => acc + d.currentNoiseLevel, 0) / filteredDevices.length).toFixed(1)
                : '---'} dB
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredDevices.length > 0 ? '正常範囲内' : 'デバイス未選択'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">アラート発生率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              3.2%
            </div>
            <p className="text-xs text-green-600 mt-1">
              前期比 -12%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">平均解決時間</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              18.5分
            </div>
            <p className="text-xs text-green-600 mt-1">
              改善傾向
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">デバイス稼働率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredDevices.length > 0
                ? ((filteredDevices.filter(d => d.status === 'online').length / filteredDevices.length) * 100).toFixed(1)
                : '---'}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredDevices.length > 0 ? '目標: 95%' : 'デバイス未選択'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
