import { createClient, SupabaseClient } from '@supabase/supabase-js'

let cachedClient: SupabaseClient | null = null

function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return null
  }

  return { url, serviceKey }
}

export function getSupabaseServiceClient(): SupabaseClient | null {
  if (cachedClient) {
    return cachedClient
  }

  const env = getSupabaseEnv()
  if (!env) {
    return null
  }

  cachedClient = createClient(env.url, env.serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return cachedClient
}
