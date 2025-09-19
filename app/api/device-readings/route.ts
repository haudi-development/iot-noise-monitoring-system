import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { deviceStore } from "@/lib/server/device-store"
import { getSupabaseServiceClient } from "@/lib/server/supabase"
import { DeviceReading } from "@/lib/types"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const rangeSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
}).partial()

const metadataSchema = z.object({
  propertyId: z.string().optional(),
  propertyName: z.string().optional(),
  roomNumber: z.string().optional(),
  location: z.string().optional(),
  floor: z.number().optional(),
  notes: z.string().optional(),
}).partial()

const thresholdsSchema = z.object({
  normal: rangeSchema.optional(),
  night: rangeSchema.optional(),
  holiday: rangeSchema.optional(),
}).partial()

const readingSchema = z.object({
  deviceId: z.string().min(1),
  recordedAt: z.string().datetime().optional(),
  noiseLevel: z.number().min(0).max(150),
  batteryLevel: z.number().min(0).max(100).optional(),
  temperature: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
  status: z.enum(["online", "offline", "warning"]).optional(),
  metadata: metadataSchema.optional(),
  thresholds: thresholdsSchema.optional(),
  payload: z.record(z.unknown()).optional(),
})

const API_KEY_HEADER = "x-api-key"
const SUPABASE_TABLE = "device_readings"

interface SupabaseReadingRow {
  id: string
  device_id: string
  recorded_at: string
  received_at: string
  noise_level: number
  battery_level?: number | null
  temperature?: number | null
  humidity?: number | null
  status?: string | null
  metadata?: Record<string, unknown> | null
  thresholds?: Record<string, unknown> | null
  payload?: Record<string, unknown> | null
  created_at?: string
}

function serialiseReading(reading: DeviceReading) {
  return {
    deviceId: reading.deviceId,
    noiseLevel: reading.noiseLevel,
    recordedAt: reading.recordedAt.toISOString(),
    receivedAt: reading.receivedAt.toISOString(),
    batteryLevel: reading.batteryLevel,
    temperature: reading.temperature,
    humidity: reading.humidity,
    status: reading.status,
    metadata: reading.metadata,
    thresholds: reading.thresholds,
    payload: reading.payload,
  }
}

function mapRowToReading(row: SupabaseReadingRow): DeviceReading {
  return {
    deviceId: row.device_id,
    noiseLevel: row.noise_level,
    recordedAt: new Date(row.recorded_at),
    receivedAt: new Date(row.received_at),
    batteryLevel: row.battery_level ?? undefined,
    temperature: row.temperature ?? undefined,
    humidity: row.humidity ?? undefined,
    status: (row.status as DeviceReading["status"]) ?? undefined,
    metadata: (row.metadata as DeviceReading["metadata"]) ?? undefined,
    thresholds: (row.thresholds as DeviceReading["thresholds"]) ?? undefined,
    payload: (row.payload as DeviceReading["payload"]) ?? undefined,
  }
}

function isUnauthorised(request: NextRequest) {
  const expectedKey = process.env.DEVICE_API_KEY
  if (!expectedKey) return false

  const headerKey = request.headers.get(API_KEY_HEADER)
  if (headerKey && headerKey === expectedKey) {
    return false
  }

  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length)
    if (token === expectedKey) {
      return false
    }
  }

  return true
}

export async function POST(request: NextRequest) {
  if (isUnauthorised(request)) {
    return NextResponse.json({
      error: "unauthorised",
      message: "Invalid or missing API key",
    }, { status: 401 })
  }

  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({
      error: "invalid_payload",
      message: "Request body must be valid JSON",
    }, { status: 400 })
  }

  const result = readingSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({
      error: "validation_failed",
      message: "Payload validation failed",
      details: result.error.flatten(),
    }, { status: 400 })
  }

  const supabase = getSupabaseServiceClient()

  if (supabase) {
    const now = new Date()
    const recordedAt = result.data.recordedAt ? new Date(result.data.recordedAt) : now

    const insertPayload = {
      device_id: result.data.deviceId,
      noise_level: result.data.noiseLevel,
      recorded_at: recordedAt.toISOString(),
      received_at: now.toISOString(),
      battery_level: result.data.batteryLevel ?? null,
      temperature: result.data.temperature ?? null,
      humidity: result.data.humidity ?? null,
      status: result.data.status ?? null,
      metadata: result.data.metadata ?? null,
      thresholds: result.data.thresholds ?? null,
      payload: result.data.payload ?? null,
    }

    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .insert(insertPayload)
      .select()
      .single()

    if (error || !data) {
      console.error("Failed to insert device reading", error)
      return NextResponse.json({
        error: "storage_error",
        message: "Failed to persist device reading",
      }, { status: 500 })
    }

    const reading = mapRowToReading(data as SupabaseReadingRow)

    // 併せてローカルキャッシュを更新（バックアップ用途）
    deviceStore.addReading(result.data)

    return NextResponse.json({
      message: "reading accepted",
      reading: serialiseReading(reading),
    }, { status: 201 })
  }

  const reading = deviceStore.addReading(result.data)

  return NextResponse.json({
    message: "reading accepted",
    reading: serialiseReading(reading),
  }, { status: 201 })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const deviceId = searchParams.get("deviceId")
  const limitParam = searchParams.get("limit")
  const limit = (() => {
    if (!limitParam) return undefined
    const parsed = Number(limitParam)
    if (!Number.isFinite(parsed)) return undefined
    return Math.max(1, Math.min(500, Math.floor(parsed)))
  })()

  const supabase = getSupabaseServiceClient()

  if (supabase) {
    if (deviceId) {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select("*")
        .eq("device_id", deviceId)
        .order("recorded_at", { ascending: false })
        .limit(limit ?? 100)

      if (error) {
        console.error("Failed to fetch device history", error)
        return NextResponse.json({
          error: "storage_error",
          message: "Failed to load device history",
        }, { status: 500 })
      }

      const readings = (data ?? [])
        .map((row) => mapRowToReading(row as SupabaseReadingRow))
        .map(serialiseReading)
      return NextResponse.json({ deviceId, readings })
    }

    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(500)

    if (error) {
      console.error("Failed to fetch latest readings", error)
      return NextResponse.json({
        error: "storage_error",
        message: "Failed to load latest readings",
      }, { status: 500 })
    }

    const latestMap = new Map<string, DeviceReading>()
    for (const row of data ?? []) {
      if (!latestMap.has(row.device_id)) {
        latestMap.set(row.device_id, mapRowToReading(row as SupabaseReadingRow))
      }
    }

    return NextResponse.json({
      devices: Array.from(latestMap.values()).map(serialiseReading),
    })
  }

  if (deviceId) {
    const history = deviceStore.getHistory(deviceId, limit)
    return NextResponse.json({
      deviceId,
      readings: history.map(serialiseReading),
    })
  }

  const latest = deviceStore.getLatestAll()

  return NextResponse.json({
    devices: latest.map(({ latest }) => serialiseReading(latest)),
  })
}
