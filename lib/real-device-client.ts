import { Device } from "@/lib/types"

export interface DeviceReadingDTO {
  deviceId: string
  noiseLevel: number
  noiseMax?: number
  recordedAt: string
  receivedAt: string
  batteryLevel?: number
  temperature?: number
  humidity?: number
  status?: 'online' | 'offline' | 'warning'
  metadata?: {
    propertyId?: string
    propertyName?: string
    roomNumber?: string
    location?: string
    floor?: number
    notes?: string
  }
  thresholds?: {
    normal?: { min?: number; max?: number }
    night?: { min?: number; max?: number }
    holiday?: { min?: number; max?: number }
  }
  payload?: Record<string, unknown>
}

const DEFAULT_METADATA = {
  propertyId: "prototype-property",
  propertyName: "ALSOKプロトタイプ棟",
  roomNumber: "LAB-01",
  location: "テストラボ",
}

const DEFAULT_THRESHOLDS = {
  normal: { min: 30, max: 70 },
  night: { min: 30, max: 55 },
  holiday: { min: 30, max: 65 },
}

const STALE_THRESHOLD_MS = 90_000

const clampThreshold = (value: number | undefined, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  return fallback
}

export function mapReadingToDevice(reading: DeviceReadingDTO): Device {
  const metadata = { ...DEFAULT_METADATA, ...reading.metadata }
  const thresholds = {
    normal: {
      min: clampThreshold(reading.thresholds?.normal?.min, DEFAULT_THRESHOLDS.normal.min),
      max: clampThreshold(reading.thresholds?.normal?.max, DEFAULT_THRESHOLDS.normal.max),
    },
    night: {
      min: clampThreshold(reading.thresholds?.night?.min, DEFAULT_THRESHOLDS.night.min),
      max: clampThreshold(reading.thresholds?.night?.max, DEFAULT_THRESHOLDS.night.max),
    },
    holiday: {
      min: clampThreshold(reading.thresholds?.holiday?.min, DEFAULT_THRESHOLDS.holiday.min),
      max: clampThreshold(reading.thresholds?.holiday?.max, DEFAULT_THRESHOLDS.holiday.max),
    },
  }

  const recordedAt = new Date(reading.recordedAt)
  const receivedAt = new Date(reading.receivedAt)
  const now = Date.now()
  const isStale = now - receivedAt.getTime() > STALE_THRESHOLD_MS

  const status = reading.status ?? (isStale ? "offline" : "online")

  return {
    id: `real-${reading.deviceId}`,
    deviceId: reading.deviceId,
    propertyId: metadata.propertyId ?? DEFAULT_METADATA.propertyId,
    propertyName: metadata.propertyName ?? DEFAULT_METADATA.propertyName,
    roomNumber: metadata.roomNumber ?? DEFAULT_METADATA.roomNumber,
    location: metadata.location ?? DEFAULT_METADATA.location,
    status,
    lastCommunication: receivedAt,
    currentNoiseLevel: Math.round(reading.noiseLevel * 10) / 10,
    currentNoiseMax: reading.noiseMax !== undefined
      ? Math.round(reading.noiseMax * 10) / 10
      : Math.round(reading.noiseLevel * 10) / 10,
    thresholds,
  }
}

export async function fetchLatestDeviceReadings(signal?: AbortSignal): Promise<DeviceReadingDTO[]> {
  const response = await fetch('/api/device-readings', {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Accept': 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to load device readings (${response.status}): ${text}`)
  }

  const data = await response.json()
  return Array.isArray(data.devices) ? data.devices : []
}

interface FetchHistoryOptions {
  startDate?: Date
  endDate?: Date
  limit?: number
  signal?: AbortSignal
}

export async function fetchDeviceHistory(
  deviceId: string,
  options: FetchHistoryOptions = {}
): Promise<DeviceReadingDTO[]> {
  const params = new URLSearchParams()
  params.set('deviceId', deviceId)
  params.set('limit', String(options.limit ?? 200))
  if (options.startDate) {
    params.set('start', options.startDate.toISOString())
  }
  if (options.endDate) {
    params.set('end', options.endDate.toISOString())
  }

  const response = await fetch(`/api/device-readings?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Accept': 'application/json',
    },
    signal: options.signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to load device history (${response.status}): ${text}`)
  }

  const data = await response.json()
  if (Array.isArray(data.readings)) {
    return data.readings
  }
  return []
}
