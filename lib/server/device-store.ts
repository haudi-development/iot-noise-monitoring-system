import { DeviceReading, DeviceReadingInput } from "@/lib/types"

const globalForDeviceStore = globalThis as typeof globalThis & {
  __alsokDeviceStore?: DeviceStore
}

class DeviceStore {
  private readings = new Map<string, DeviceReading[]>()
  private historyLimit = 500

  addReading(input: DeviceReadingInput) {
    const now = new Date()
    const recordedAt = input.recordedAt ? new Date(input.recordedAt) : now

    const reading: DeviceReading = {
      deviceId: input.deviceId,
      noiseLevel: input.noiseLevel,
      recordedAt,
      receivedAt: now,
      batteryLevel: input.batteryLevel,
      temperature: input.temperature,
      humidity: input.humidity,
      status: input.status,
      metadata: input.metadata,
      thresholds: input.thresholds,
      payload: input.payload,
    }

    const existing = this.readings.get(input.deviceId) ?? []
    existing.unshift(reading)

    if (existing.length > this.historyLimit) {
      existing.length = this.historyLimit
    }

    this.readings.set(input.deviceId, existing)

    return reading
  }

  getLatest(deviceId: string) {
    const entries = this.readings.get(deviceId) ?? []
    return entries[0] ?? null
  }

  getLatestAll() {
    return Array.from(this.readings.entries()).map(([deviceId, entries]) => ({
      deviceId,
      latest: entries[0] ?? null,
    })).filter(entry => entry.latest !== null) as Array<{
      deviceId: string
      latest: DeviceReading
    }>
  }

  getHistory(deviceId: string, limit = 100) {
    const entries = this.readings.get(deviceId) ?? []
    if (limit <= 0) {
      return []
    }
    return entries.slice(0, Math.min(limit, this.historyLimit))
  }
}

export const deviceStore = globalForDeviceStore.__alsokDeviceStore ??= new DeviceStore()
