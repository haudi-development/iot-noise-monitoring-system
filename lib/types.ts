export interface Company {
  id: string
  name: string
  plan: 'basic' | 'standard' | 'premium'
  propertyCount: number
  deviceCount: number
  contactPerson: string
  email: string
  phone: string
  contractDate: Date
  status: 'active' | 'inactive'
}

export interface Property {
  id: string
  companyId: string
  companyName?: string
  name: string
  address: string
  floors: number
  totalRooms: number
  floorPlanUrl?: string
  manager: {
    name: string
    phone: string
    email: string
  }
  createdAt: Date
}

export interface Room {
  id: string
  propertyId: string
  floor: number
  roomNumber: string
  type: 'residential' | 'commercial' | 'common'
  area?: number
  occupancyStatus: 'occupied' | 'vacant'
}

export interface Device {
  id: string
  deviceId: string
  propertyId: string
  propertyName?: string
  roomNumber: string
  location: string
  status: 'online' | 'offline' | 'warning'
  lastCommunication: Date
  currentNoiseLevel: number
  thresholds: {
    normal: { min: number; max: number }
    night: { min: number; max: number }
    holiday: { min: number; max: number }
  }
}

export interface Alert {
  id: string
  deviceId: string
  propertyName: string
  roomNumber: string
  noiseLevel: number
  duration: number
  startTime: Date
  endTime?: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'acknowledged' | 'resolved'
  assignedTo?: string
}

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export interface DeviceReadingMetadata {
  propertyId?: string
  propertyName?: string
  roomNumber?: string
  location?: string
  floor?: number
  notes?: string
}

export interface DeviceReadingThresholds {
  normal?: { min?: number; max?: number }
  night?: { min?: number; max?: number }
  holiday?: { min?: number; max?: number }
}

export interface DeviceReading {
  deviceId: string
  noiseLevel: number
  recordedAt: Date
  receivedAt: Date
  batteryLevel?: number
  temperature?: number
  humidity?: number
  status?: 'online' | 'offline' | 'warning'
  metadata?: DeviceReadingMetadata
  thresholds?: DeviceReadingThresholds
  payload?: Record<string, unknown>
}

export interface DeviceReadingInput {
  deviceId: string
  noiseLevel: number
  recordedAt?: string
  batteryLevel?: number
  temperature?: number
  humidity?: number
  status?: 'online' | 'offline' | 'warning'
  metadata?: DeviceReadingMetadata
  thresholds?: DeviceReadingThresholds
  payload?: Record<string, unknown>
}
