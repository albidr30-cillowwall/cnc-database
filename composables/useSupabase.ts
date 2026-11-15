import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export function useSupabase() {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  const key = config.public.supabaseKey as string

  const isConfigured = Boolean(
    url && 
    key && 
    !url.includes('your-project-id') && 
    !key.includes('your-anon-public-key')
  )

  if (isConfigured && !supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  }

  return {
    supabase: supabaseInstance,
    isConfigured
  }
}

