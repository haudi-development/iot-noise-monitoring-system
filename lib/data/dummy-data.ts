import { Company, Property, Room, Device, Alert, Priority } from '@/lib/types'
import { addDays, subDays, subHours, subMinutes } from 'date-fns'

const companyNames = [
  '東京不動産管理株式会社',
  'グリーンパーク管理組合',
  '関東マンション管理',
  'サンシャイン不動産',
  '都心プロパティ管理'
]

const propertyNames = [
  'グランドタワー',
  'パークサイドレジデンス',
  'サンライズマンション',
  'リバーサイドコート',
  'ガーデンヒルズ',
  'スカイビュータワー',
  'セントラルプレイス',
  'ハーバービュー',
  'フォレストガーデン',
  'オーシャンビュー'
]

const addresses = [
  '東京都港区芝公園',
  '東京都新宿区西新宿',
  '東京都渋谷区恵比寿',
  '東京都品川区大崎',
  '東京都目黒区中目黒',
  '東京都世田谷区三軒茶屋',
  '東京都杉並区高円寺',
  '東京都豊島区池袋',
  '東京都文京区本郷',
  '東京都台東区浅草'
]

export function generateCompanies(count: number = 5): Company[] {
  const companies: Company[] = []
  const plans: ('basic' | 'standard' | 'premium')[] = ['basic', 'standard', 'premium']
  
  for (let i = 0; i < count; i++) {
    companies.push({
      id: `company-${i + 1}`,
      name: companyNames[i % companyNames.length],
      plan: plans[i % plans.length],
      propertyCount: Math.floor(Math.random() * 10) + 1,
      deviceCount: Math.floor(Math.random() * 100) + 10,
      contactPerson: `担当者${i + 1}`,
      email: `contact${i + 1}@company.co.jp`,
      phone: `03-${String(Math.floor(Math.random() * 9000) + 1000)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      contractDate: subDays(new Date(), Math.floor(Math.random() * 365) + 30),
      status: Math.random() > 0.1 ? 'active' : 'inactive'
    })
  }
  
  return companies
}

export function generateProperties(count: number = 10, companies: Company[]): Property[] {
  const properties: Property[] = []
  
  for (let i = 0; i < count; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)]
    properties.push({
      id: `property-${i + 1}`,
      companyId: company.id,
      companyName: company.name,
      name: `${propertyNames[i % propertyNames.length]} ${i + 1}号棟`,
      address: `${addresses[i % addresses.length]} ${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 30) + 1}`,
      floors: Math.floor(Math.random() * 15) + 5,
      totalRooms: Math.floor(Math.random() * 100) + 20,
      manager: {
        name: `管理人${i + 1}`,
        phone: `090-${String(Math.floor(Math.random() * 9000) + 1000)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        email: `manager${i + 1}@property.co.jp`
      },
      createdAt: subDays(new Date(), Math.floor(Math.random() * 180) + 30)
    })
  }
  
  return properties
}

export function generateRooms(count: number = 100, properties: Property[]): Room[] {
  const rooms: Room[] = []
  const types: ('residential' | 'commercial' | 'common')[] = ['residential', 'commercial', 'common']
  
  for (let i = 0; i < count; i++) {
    const property = properties[Math.floor(Math.random() * properties.length)]
    const floor = Math.floor(Math.random() * property.floors) + 1
    rooms.push({
      id: `room-${i + 1}`,
      propertyId: property.id,
      floor,
      roomNumber: `${floor}${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
      type: types[Math.floor(Math.random() * types.length)],
      area: Math.floor(Math.random() * 100) + 30,
      occupancyStatus: Math.random() > 0.2 ? 'occupied' : 'vacant'
    })
  }
  
  return rooms
}

export function generateDevices(count: number = 100, rooms: Room[], properties: Property[]): Device[] {
  const devices: Device[] = []
  const statuses: ('online' | 'offline' | 'warning')[] = ['online', 'offline', 'warning']
  
  for (let i = 0; i < count; i++) {
    const room = rooms[i % rooms.length]
    const property = properties.find(p => p.id === room.propertyId)
    const status = statuses[Math.random() < 0.8 ? 0 : Math.random() < 0.5 ? 2 : 1]
    
    devices.push({
      id: `device-${i + 1}`,
      deviceId: `IOT-${String(i + 1).padStart(6, '0')}`,
      propertyId: room.propertyId,
      propertyName: property?.name,
      roomNumber: room.roomNumber,
      location: `${room.roomNumber}号室`,
      status,
      lastCommunication: status === 'online' 
        ? subMinutes(new Date(), Math.floor(Math.random() * 15))
        : subHours(new Date(), Math.floor(Math.random() * 24) + 1),
      currentNoiseLevel: Math.round((Math.random() * 60 + 30) * 10) / 10,
      thresholds: {
        normal: { min: 30, max: 70 },
        night: { min: 30, max: 55 },
        holiday: { min: 30, max: 65 }
      }
    })
  }
  
  return devices
}

export function calculatePriority(noiseLevel: number, duration: number): Priority {
  if (noiseLevel >= 95 || duration >= 30) return 'critical'
  if (noiseLevel >= 85 || duration >= 15) return 'high'
  if (noiseLevel >= 70 || duration >= 5) return 'medium'
  return 'low'
}

export function generateAlerts(count: number = 500, devices: Device[], days: number = 30): Alert[] {
  const alerts: Alert[] = []
  const statuses: ('new' | 'acknowledged' | 'resolved')[] = ['new', 'acknowledged', 'resolved']
  
  for (let i = 0; i < count; i++) {
    const device = devices[Math.floor(Math.random() * devices.length)]
    const noiseLevel = Math.round((Math.random() * 50 + 60) * 10) / 10
    const duration = Math.floor(Math.random() * 45) + 1
    const startTime = subDays(new Date(), Math.floor(Math.random() * days))
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    alerts.push({
      id: `alert-${i + 1}`,
      deviceId: device.deviceId,
      propertyName: device.propertyName || '',
      roomNumber: device.roomNumber,
      noiseLevel,
      duration,
      startTime,
      endTime: status === 'resolved' ? addDays(startTime, Math.random()) : undefined,
      priority: calculatePriority(noiseLevel, duration),
      status,
      assignedTo: status !== 'new' ? `operator${Math.floor(Math.random() * 3) + 1}` : undefined
    })
  }
  
  return alerts.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
}

let cachedData: {
  companies: Company[]
  properties: Property[]
  rooms: Room[]
  devices: Device[]
  alerts: Alert[]
} | null = null

export function getDummyData() {
  if (!cachedData) {
    const companies = generateCompanies(5)
    const properties = generateProperties(10, companies)
    const rooms = generateRooms(100, properties)
    const devices = generateDevices(100, rooms, properties)
    const alerts = generateAlerts(500, devices, 30)
    
    cachedData = {
      companies,
      properties,
      rooms,
      devices,
      alerts
    }
  }
  
  return cachedData
}

export function getRealtimeNoiseLevels(devices: Device[]): Device[] {
  return devices.map(device => ({
    ...device,
    currentNoiseLevel: device.status === 'online' 
      ? Math.round(Math.max(30, Math.min(110, device.currentNoiseLevel + (Math.random() - 0.5) * 10)) * 10) / 10
      : device.currentNoiseLevel
  }))
}