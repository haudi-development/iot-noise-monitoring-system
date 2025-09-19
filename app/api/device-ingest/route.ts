import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getDeviceIngestEnabled, setDeviceIngestEnabled } from "@/lib/server/device-ingest"

const updateSchema = z.object({
  enabled: z.boolean(),
})

export async function GET() {
  const enabled = await getDeviceIngestEnabled()
  return NextResponse.json({ enabled })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({
      error: "validation_failed",
      message: "Invalid payload",
      details: parsed.error.flatten(),
    }, { status: 400 })
  }

  try {
    const enabled = await setDeviceIngestEnabled(parsed.data.enabled)
    return NextResponse.json({ enabled })
  } catch (error) {
    console.error("Failed to update ingest setting", error)
    return NextResponse.json({
      error: "storage_error",
      message: "Failed to update device ingestion setting",
    }, { status: 500 })
  }
}
