import { getSupabaseServiceClient } from "@/lib/server/supabase"

const SETTING_KEY = "device_ingest_enabled"
const DEFAULT_ENABLED = process.env.DEVICE_INGEST_ENABLED !== "false"

const globalForIngest = globalThis as typeof globalThis & {
  __deviceIngestCache?: {
    value: boolean
    expiresAt: number
  }
}

const CACHE_TTL_MS = 10_000

function getCached(): boolean | null {
  const cache = globalForIngest.__deviceIngestCache
  if (!cache) return null
  if (Date.now() > cache.expiresAt) {
    globalForIngest.__deviceIngestCache = undefined
    return null
  }
  return cache.value
}

function setCache(value: boolean) {
  globalForIngest.__deviceIngestCache = {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  }
}

export async function getDeviceIngestEnabled(): Promise<boolean> {
  const cached = getCached()
  if (cached !== null) {
    return cached
  }

  const supabase = getSupabaseServiceClient()
  if (!supabase) {
    setCache(DEFAULT_ENABLED)
    return DEFAULT_ENABLED
  }

  const { data, error } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", SETTING_KEY)
    .maybeSingle()

  if (error) {
    console.error("Failed to load ingest setting", error)
    setCache(DEFAULT_ENABLED)
    return DEFAULT_ENABLED
  }

  const enabled = data?.value?.enabled
  const result = typeof enabled === "boolean" ? enabled : DEFAULT_ENABLED
  setCache(result)
  return result
}

export async function setDeviceIngestEnabled(enabled: boolean): Promise<boolean> {
  const supabase = getSupabaseServiceClient()

  if (!supabase) {
    setCache(enabled)
    return enabled
  }

  const { error } = await supabase
    .from("system_settings")
    .upsert({
      key: SETTING_KEY,
      value: { enabled },
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error("Failed to update ingest setting", error)
    throw error
  }

  setCache(enabled)
  return enabled
}
