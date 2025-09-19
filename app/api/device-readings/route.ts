import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { deviceStore } from "@/lib/server/device-store"
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
