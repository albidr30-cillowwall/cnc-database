import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null
let currentConfigKey = ''

export function useSupabase() {
  const config = useRuntimeConfig()
  let url = (config.public.supabaseUrl as string) || ''
  let key = (config.public.supabaseKey as string) || ''

  // Fallback to client-side localStorage credentials if not set in runtimeConfig / environment variables
  if ((!url || !key) && import.meta.client) {
    try {
      const savedUrl = localStorage.getItem('cnc_supabase_url')
      const savedKey = localStorage.getItem('cnc_supabase_key')
      if (savedUrl && savedKey) {
        url = savedUrl.trim()
        key = savedKey.trim()
      }
    } catch {}
  }

  const isConfigured = Boolean(
    url && 
    key && 
    !url.includes('your-project-id') && 
    !key.includes('your-anon-public-key')
  )

  const configKey = `${url}:${key}`
  if (isConfigured && (!supabaseInstance || currentConfigKey !== configKey)) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      })
      currentConfigKey = configKey
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e)
      supabaseInstance = null
      currentConfigKey = ''
    }
  } else if (!isConfigured) {
    supabaseInstance = null
    currentConfigKey = ''
  }

  function setCustomCredentials(customUrl: string, customKey: string) {
    if (!import.meta.client) return
    const cleanUrl = customUrl.trim()
    const cleanKey = customKey.trim()
    localStorage.setItem('cnc_supabase_url', cleanUrl)
    localStorage.setItem('cnc_supabase_key', cleanKey)
    url = cleanUrl
    key = cleanKey
    try {
      supabaseInstance = createClient(cleanUrl, cleanKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      })
      currentConfigKey = `${cleanUrl}:${cleanKey}`
    } catch (e) {
      console.error('Error reinitializing Supabase with custom credentials:', e)
    }
  }

  function clearCustomCredentials() {
    if (!import.meta.client) return
    localStorage.removeItem('cnc_supabase_url')
    localStorage.removeItem('cnc_supabase_key')
    supabaseInstance = null
    currentConfigKey = ''
  }

  async function checkConnection(): Promise<{ ok: boolean; message: string }> {
    if (!isConfigured || !supabaseInstance) {
      return { 
        ok: false, 
        message: 'Kredensial Supabase (URL & Anon Key) belum terpasang.' 
      }
    }
    try {
      const { data, error } = await supabaseInstance.from('profiles').select('id').limit(1)
      if (error) {
        return { 
          ok: false, 
          message: `Gagal akses database: ${error.message} (Periksa skrip SQL & RLS policies)` 
        }
      }
      return { 
        ok: true, 
        message: 'Berhasil terhubung ke Supabase PostgreSQL Cloud!' 
      }
    } catch (e: any) {
      return { 
        ok: false, 
        message: `Koneksi gagal: ${e?.message || e}` 
      }
    }
  }

  return {
    supabase: supabaseInstance,
    isConfigured,
    supabaseUrl: url,
    supabaseKey: key,
    setCustomCredentials,
    clearCustomCredentials,
    checkConnection
  }
}
