import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'
import { useSecurity, type SafeUser } from './useSecurity'

export interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  role: 'admin' | 'operator' | 'mandor' | 'user'
  department?: string
  password_hash?: string
  created_at?: string
}

export interface Plate {
  id: number
  no_plat: string
  heat_number: string
  grade: string
  material_type: 'Baja' | 'Aluminium' | 'Stainless' | string
  panjang_mm: number
  lebar_mm: number
  tebal_mm: number
  berat_kg: number
  stok?: number
  no_sertifikat_class?: string
  lokasi_yard: string
  status: 'Tersedia' | 'Dipesan' | 'Diambil' | 'Sudah Dipotong' | 'Sisa Potongan / Remnant' | 'Habis' | string
  is_remnant: boolean
  parent_plate_id?: number | null
  order_id_pemakai?: string | null
  created_at?: string
}

export interface OrderEstimation {
  id?: number
  order_id?: number | null
  // Standard Cutting/Nesting Sheet Fields
  project_name?: string
  nesting_no?: string
  block_item?: string
  spec_material?: string
  dimension_material?: string
  product_number?: string
  heat_number?: string
  cutting_image_url?: string
  status_approval: string
  // Legacy optional fields
  grade?: string
  tebal?: string
  ukuran_plat?: string
  lembar?: number
  berat_kg?: number
  jam?: number
  remnant?: string
  tgl_selesai?: string
  catatan?: string
}

export interface Order {
  id: number
  no_order: string
  jenis_pekerjaan: string
  jenis_pekerjaan_kategori: string
  deskripsi_pekerjaan: string
  nama_pemesan: string
  departemen_pemesan: string
  nik_pemesan?: string
  no_hp_pemesan: string
  nama_proyek: string
  nama_proyek_kapal?: string
  material: 'Baja' | 'Aluminium' | 'Stainless' | string
  ketebalan: string
  jumlah_pesanan: number
  satuan: string
  ukuran_part?: string
  waktu_pengambilan_diinginkan: string
  deadline_pekerjaan?: string
  catatan_pekerjaan?: string
  drawing_file_name?: string
  drawing_data_url?: string
  target_cnc: string
  status: string
  plate_id?: number | null
  plat_dipakai?: string | null
  kode_pengambilan?: string | null
  waktu_mulai?: string | null
  waktu_selesai?: string | null
  waktu_diambil?: string | null
  pengambil_akhir?: string | null
  departemen_pengambil?: string | null
  created_at?: string
  estimation?: OrderEstimation | null
}

export interface YardPickup {
  id: number
  order_id?: number | null
  plate_id: number
  jumlah_ambil?: number
  sisa_stok?: number
  keperluan?: string
  remnant_plate_id?: number | null
  pengambil: string
  petugas_yard: string
  is_partial: boolean
  sisa_p?: number | null
  sisa_l?: number | null
  picked_up_at?: string
  order?: Order
  plate?: Plate
  remnantPlate?: Plate
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Global Shared State
const defaultUsers: UserProfile[] = [
  { id: '1', name: 'Administrator CNC', username: 'admin', email: 'admin@gmail.com', role: 'admin', department: 'Supervisor', password_hash: '123' },
  { id: '2', name: 'Workshop Operator CNC', username: 'operator', email: 'operator@gmail.com', role: 'operator', department: 'Produksi CNC', password_hash: '123' },
  { id: '3', name: 'User (Pemesan Plat)', username: 'user', email: 'user@gmail.com', role: 'user', department: 'Hull Construction', password_hash: '123' }
]

export function useCncStore() {
  const { 
    supabase, 
    isConfigured, 
    supabaseUrl, 
    supabaseKey, 
    setCustomCredentials, 
    clearCustomCredentials, 
    checkConnection 
  } = useSupabase()
  const {
    hashPassword,
    verifyPassword,
    createSessionToken,
    verifySessionToken,
    getRateLimitStatus,
    recordFailedLogin,
    resetRateLimit,
    sanitizeInput,
    sanitizeUrl,
    sanitizePostgrestTerm
  } = useSecurity()

  // Nuxt 3 request-isolated state (SSR-safe, prevents cross-request session leakage)
  const currentUser = useState<UserProfile | null>('cnc_current_user', () => null)
  const users = useState<UserProfile[]>('cnc_users', () => [...defaultUsers])
  const orders = useState<Order[]>('cnc_orders', () => [])
  const plates = useState<Plate[]>('cnc_plates', () => [])
  const estimations = useState<OrderEstimation[]>('cnc_estimations', () => [])
  const yardPickups = useState<YardPickup[]>('cnc_pickups', () => [])
  const isInitialized = useState<boolean>('cnc_initialized', () => false)
  const isSyncing = useState<boolean>('cnc_syncing', () => false)

  // Cryptographically signed session token (HMAC-SHA256, anti-spoofing)
  const sessionToken = useCookie<string | null>('cnc_session_token', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'strict'
  })

  // Restore session: only if the cryptographic signature is authentic
  if (!currentUser.value && sessionToken.value) {
    verifySessionToken(sessionToken.value).then(verified => {
      if (verified) {
        currentUser.value = verified
      } else {
        sessionToken.value = null
        currentUser.value = null
      }
    }).catch(() => {
      sessionToken.value = null
      currentUser.value = null
    })
  }

  // Helper calculate plate weight
  function calculateWeight(p: number, l: number, t: number, mat: string): number {
    const m = (mat || '').toLowerCase()
    const density = m.includes('alumin') ? 0.0000027 : (m.includes('stainless') ? 0.0000080 : 0.00000785)
    return parseFloat((p * l * t * density).toFixed(2))
  }

  // Local Storage save (Security hardened: protects against quota exceeded errors & never stores password hashes)
  function saveToLocalStorage() {
    if (!import.meta.client) return
    try {
      const safeUsers = users.value.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role,
        department: u.department
      }))
      localStorage.setItem('cnc_users_v3', JSON.stringify(safeUsers))
      localStorage.setItem('cnc_plates_v3', JSON.stringify(plates.value))
      localStorage.setItem('cnc_pickups_v3', JSON.stringify(yardPickups.value))
      localStorage.setItem('cnc_estimations_v3', JSON.stringify(estimations.value))
      localStorage.setItem('cnc_orders_v3', JSON.stringify(orders.value))
      localStorage.removeItem('cnc_session_user')
    } catch (quotaError) {
      console.warn('LocalStorage quota warning, saving lightweight fallback (stripping heavy images):', quotaError)
      try {
        const lightOrders = orders.value.map(o => ({ ...o, drawing_data_url: undefined }))
        const lightEst = estimations.value.map(e => ({ ...e, cutting_image_url: undefined }))
        localStorage.setItem('cnc_orders_v3', JSON.stringify(lightOrders))
        localStorage.setItem('cnc_estimations_v3', JSON.stringify(lightEst))
      } catch (inner) {
        console.warn('Could not save to localStorage:', inner)
      }
    }
  }

  // Initialize store (from Supabase or LocalStorage)
  async function initStore() {
    if (!import.meta.client || isInitialized.value) return

    // 1. Restore verified session token only (Cryptographic HMAC check, prevents localStorage privilege escalation)
    if (sessionToken.value) {
      const verified = await verifySessionToken(sessionToken.value)
      if (verified) {
        currentUser.value = verified
      } else {
        sessionToken.value = null
        currentUser.value = null
      }
    } else {
      currentUser.value = null
    }

    // 2. Load LocalStorage first (for instant display)
    const localUsers = localStorage.getItem('cnc_users_v3')
    if (localUsers) {
      try { 
        const parsed = JSON.parse(localUsers)
        users.value = parsed.map((u: any) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          role: u.role,
          department: u.department
        }))
      } catch { }
    }
    const localOrders = localStorage.getItem('cnc_orders_v3')
    if (localOrders) {
      try { 
        orders.value = JSON.parse(localOrders) 
        orders.value.forEach(o => {
          if (o.status === 'Estimasi Selesai') {
            if (o.waktu_diambil) o.status = 'Sudah Diambil'
            else if (o.kode_pengambilan) o.status = 'Siap Diambil'
            else o.status = 'Diterima'
          }
        })
      } catch { }
    }
    const localPlates = localStorage.getItem('cnc_plates_v3')
    if (localPlates) {
      try { plates.value = JSON.parse(localPlates) } catch { }
    }
    const localEst = localStorage.getItem('cnc_estimations_v3')
    if (localEst) {
      try { estimations.value = JSON.parse(localEst) } catch { }
    }
    const localPickups = localStorage.getItem('cnc_pickups_v3')
    if (localPickups) {
      try { yardPickups.value = JSON.parse(localPickups) } catch { }
    }

    isInitialized.value = true

    // 3. If Supabase is configured, sync from Supabase
    if (isConfigured && supabase) {
      await syncFromSupabase()
    }
  }

  // ==========================================
  // FIX #3: syncFromSupabase() — ONLY overwrite local data when Supabase returns non-empty arrays
  // FIX #5: Add cutting_image_url to estimation mapping
  // ==========================================
  async function syncFromSupabase() {
    if (!supabase || !isConfigured) return
    isSyncing.value = true
    try {
      // Fetch users (Hardened: never select password_hash to prevent credential leakage to client memory)
      const { data: profileData, error: profileErr } = await supabase.from('profiles').select('id, name, username, email, role, department')
      if (profileErr) {
        console.error('Supabase sync profiles error:', profileErr.message)
      } else if (profileData && profileData.length > 0) {
        users.value = profileData.map((p: any) => ({
          id: p.id,
          name: p.name,
          username: p.username,
          email: p.email,
          role: (p.role === 'mandor' ? 'operator' : p.role) as 'admin' | 'operator' | 'mandor' | 'user',
          department: p.department
        }))
      }

      // Fetch plates — FIX: only overwrite if Supabase has data
      const { data: plateData, error: plateErr } = await supabase.from('plates').select('*').order('id', { ascending: false })
      if (plateErr) {
        console.error('Supabase sync plates error:', plateErr.message)
      } else if (plateData && plateData.length > 0) {
        plates.value = plateData.map((p: any) => ({
          id: p.id,
          no_plat: p.no_plat,
          heat_number: p.heat_number,
          grade: p.grade,
          material_type: p.material_type,
          panjang_mm: p.panjang_mm,
          lebar_mm: p.lebar_mm,
          tebal_mm: parseFloat(p.tebal_mm),
          berat_kg: parseFloat(p.berat_kg),
          stok: p.stok !== undefined && p.stok !== null ? Number(p.stok) : 1,
          no_sertifikat_class: p.no_sertifikat_class,
          lokasi_yard: p.lokasi_yard,
          status: p.status,
          is_remnant: Boolean(p.is_remnant),
          parent_plate_id: p.parent_plate_id,
          order_id_pemakai: p.order_id_pemakai,
          created_at: p.created_at
        }))
      }
      // If Supabase returned empty BUT we have local plates, push them to Supabase
      else if ((!plateData || plateData.length === 0) && plates.value.length > 0) {
        console.info('Supabase plates empty but local has data — pushing local plates to Supabase')
        for (const p of plates.value) {
          const { id: _ignoreId, ...plateWithoutId } = p as any
          await supabase.from('plates').upsert([p], { onConflict: 'id' })
        }
      }

      // Fetch estimations — FIX #5: add cutting_image_url
      const { data: estData, error: estErr } = await supabase.from('order_estimations').select('*')
      if (estErr) {
        console.error('Supabase sync estimations error:', estErr.message)
      } else if (estData && estData.length > 0) {
        estimations.value = estData.map((e: any) => ({
          id: e.id,
          order_id: e.order_id,
          project_name: e.project_name || '',
          nesting_no: e.nesting_no || '',
          block_item: e.block_item || '',
          spec_material: (e.spec_material === 'Baja' || e.spec_material === 'Alumunium' || e.spec_material === 'Aluminium') ? '' : (e.spec_material || (e.grade && e.grade !== 'Baja' && e.grade !== 'Alumunium' ? e.grade : '')),
          dimension_material: e.dimension_material || e.ukuran_plat || e.tebal || '',
          product_number: (e.product_number && e.product_number.trim() !== '-') ? e.product_number.trim() : '',
          heat_number: e.heat_number || '',
          cutting_image_url: e.cutting_image_url || '',
          grade: e.grade,
          tebal: e.tebal,
          ukuran_plat: e.ukuran_plat,
          lembar: e.lembar,
          berat_kg: parseFloat(e.berat_kg || 0),
          jam: parseFloat(e.jam || 0),
          remnant: e.remnant,
          tgl_selesai: e.tgl_selesai,
          catatan: e.catatan,
          status_approval: e.status_approval
        }))
      }

      // Fetch orders — FIX: only overwrite if Supabase has data
      const { data: orderData, error: orderErr } = await supabase.from('orders').select('*').order('id', { ascending: false })
      if (orderErr) {
        console.error('Supabase sync orders error:', orderErr.message)
      } else if (orderData && orderData.length > 0) {
        orders.value = orderData.map((o: any) => {
          const est = estimations.value.find(e => e.order_id === o.id) || null
          return {
            id: o.id,
            no_order: o.no_order,
            jenis_pekerjaan: o.jenis_pekerjaan,
            jenis_pekerjaan_kategori: o.jenis_pekerjaan_kategori,
            deskripsi_pekerjaan: o.deskripsi_pekerjaan,
            nama_pemesan: o.nama_pemesan,
            departemen_pemesan: o.departemen_pemesan,
            nik_pemesan: o.nik_pemesan,
            no_hp_pemesan: o.no_hp_pemesan,
            nama_proyek: o.nama_proyek,
            nama_proyek_kapal: o.nama_proyek_kapal,
            material: o.material,
            ketebalan: o.ketebalan,
            jumlah_pesanan: o.jumlah_pesanan,
            satuan: o.satuan,
            ukuran_part: o.ukuran_part,
            waktu_pengambilan_diinginkan: o.waktu_pengambilan_diinginkan,
            deadline_pekerjaan: o.deadline_pekerjaan,
            catatan_pekerjaan: o.catatan_pekerjaan,
            drawing_file_name: o.drawing_file_name,
            drawing_data_url: o.drawing_data_url,
            target_cnc: o.target_cnc,
            status: o.status === 'Estimasi Selesai'
              ? (o.waktu_diambil ? 'Sudah Diambil' : (o.kode_pengambilan ? 'Siap Diambil' : 'Diterima'))
              : o.status,
            plate_id: o.plate_id,
            plat_dipakai: o.plat_dipakai,
            kode_pengambilan: o.kode_pengambilan,
            waktu_mulai: o.waktu_mulai,
            waktu_selesai: o.waktu_selesai,
            waktu_diambil: o.waktu_diambil,
            pengambil_akhir: o.pengambil_akhir,
            departemen_pengambil: o.departemen_pengambil,
            created_at: o.created_at,
            estimation: est
          }
        })
      }

      // Fetch pickups — FIX: only overwrite if Supabase has data
      const { data: pickupData, error: pickupErr } = await supabase.from('yard_pickups').select('*').order('id', { ascending: false })
      if (pickupErr) {
        console.error('Supabase sync pickups error:', pickupErr.message)
      } else if (pickupData && pickupData.length > 0) {
        yardPickups.value = pickupData.map((yp: any) => ({
          id: yp.id,
          order_id: yp.order_id || null,
          plate_id: yp.plate_id,
          jumlah_ambil: yp.jumlah_ambil !== undefined && yp.jumlah_ambil !== null ? Number(yp.jumlah_ambil) : 1,
          sisa_stok: yp.sisa_stok !== undefined && yp.sisa_stok !== null ? Number(yp.sisa_stok) : undefined,
          keperluan: yp.keperluan || '-',
          remnant_plate_id: yp.remnant_plate_id,
          pengambil: yp.pengambil,
          petugas_yard: yp.petugas_yard,
          is_partial: Boolean(yp.is_partial),
          sisa_p: yp.sisa_p,
          sisa_l: yp.sisa_l,
          picked_up_at: yp.picked_up_at
        }))
      }

      saveToLocalStorage()
    } catch (e) {
      console.warn('Sync from Supabase warning (fallback to local state):', e)
    } finally {
      isSyncing.value = false
    }
  }

  // AUTH ACTIONS (SECURE & ANTI-HACKER)
  async function login(rawIdentity: string, rawPassword: string): Promise<{ success: boolean; message?: string }> {
    // 1. Anti Brute-Force Check
    const rateLimit = getRateLimitStatus()
    if (rateLimit.isLocked) {
      return {
        success: false,
        message: `Terlalu banyak percobaan gagal. Akses dikunci sementara selama ${rateLimit.remainingSeconds} detik demi keamanan.`
      }
    }

    // 2. Input Sanitization
    const term = sanitizeInput(rawIdentity).toLowerCase()
    const pwd = (rawPassword || '').trim()

    if (!term || !pwd) {
      return { success: false, message: 'Email/Username dan Password wajib diisi.' }
    }

    // 3. User Lookup (Secure query, prevents PostgREST filter injection and prevents password hash leaking)
    let targetUser: UserProfile | null = null
    let targetPasswordHash = ''

    if (isConfigured && supabase) {
      try {
        const cleanTerm = sanitizePostgrestTerm(term)
        if (cleanTerm) {
          const { data: dbUser } = await supabase
            .from('profiles')
            .select('id, name, username, email, role, department, password_hash')
            .or(`email.ilike.${cleanTerm},username.ilike.${cleanTerm}`)
            .maybeSingle()
          if (dbUser) {
            targetUser = {
              id: dbUser.id,
              name: dbUser.name,
              username: dbUser.username,
              email: dbUser.email,
              role: (dbUser.role === 'mandor' ? 'operator' : dbUser.role) as any,
              department: dbUser.department
            }
            targetPasswordHash = dbUser.password_hash || ''
          }
        }
      } catch (err) {
        console.warn('Supabase login search warning:', err)
      }
    }

    // Local fallback check if Supabase didn't find or is offline
    if (!targetUser) {
      const foundDefault = defaultUsers.find(u =>
        u.email.toLowerCase() === term ||
        u.username.toLowerCase() === term ||
        (term === 'mandor' && u.username === 'operator') ||
        (term === 'mandor@gmail.com' && u.email === 'operator@gmail.com') ||
        (term === 'operator' && u.username === 'mandor') ||
        (term === 'operator@gmail.com' && u.email === 'mandor@gmail.com')
      )
      if (foundDefault) {
        targetUser = {
          id: foundDefault.id,
          name: foundDefault.name,
          username: foundDefault.username,
          email: foundDefault.email,
          role: foundDefault.role,
          department: foundDefault.department
        }
        targetPasswordHash = foundDefault.password_hash || ''
      }
    }

    if (!targetUser || !targetPasswordHash) {
      const lock = recordFailedLogin()
      const msg = lock.isLocked
        ? `5 kali gagal berturut-turut. Akses login dikunci selama ${lock.remainingSeconds} detik.`
        : 'Email/Username atau Password tidak valid.'
      return { success: false, message: msg }
    }

    // 4. Secure Password Verification (Salted SHA-256 + Timing Safe)
    const isMatch = await verifyPassword(pwd, targetPasswordHash)
    if (!isMatch) {
      const lock = recordFailedLogin()
      const msg = lock.isLocked
        ? `5 kali gagal berturut-turut. Akses login dikunci selama ${lock.remainingSeconds} detik.`
        : 'Email/Username atau Password tidak valid.'
      return { success: false, message: msg }
    }

    // 5. Success: Reset brute-force counter
    resetRateLimit()

    // 6. Normalize role (treat mandor as operator)
    const normalizedRole: 'admin' | 'operator' | 'mandor' | 'user' =
      targetUser.role === 'mandor' ? 'operator' : targetUser.role

    const safeUser: SafeUser = {
      id: targetUser.id,
      name: targetUser.name,
      username: targetUser.username,
      email: targetUser.email,
      role: normalizedRole,
      department: targetUser.department
    }

    // 7. Generate Signed HMAC Token (Tamper-Proof)
    const token = await createSessionToken(safeUser)
    sessionToken.value = token
    currentUser.value = safeUser

    // 8. Auto-upgrade plain password in Supabase if legacy plain '123'
    if (isConfigured && supabase && targetPasswordHash === pwd) {
      const newHash = await hashPassword(pwd)
      supabase.from('profiles').update({ password_hash: newHash }).eq('id', targetUser.id).then(() => {})
    }

    return { success: true }
  }

  function logout() {
    currentUser.value = null
    sessionToken.value = null
    resetRateLimit()
    if (import.meta.client) {
      localStorage.removeItem('cnc_session_user')
      document.cookie = 'cnc_session_token=; Max-Age=0; path=/; SameSite=Strict;'
      document.cookie = 'cnc_session_user=; Max-Age=0; path=/;'
    }
  }

  // ==========================================
  // FIX #2 & #4: createOrder — check Supabase error, let Supabase generate ID
  // ==========================================
  async function createOrder(data: {
    jenis_pekerjaan_kategori: string
    jenis_lainnya?: string
    deskripsi_pekerjaan?: string
    nama_pemesan: string
    departemen_pemesan: string
    nik_pemesan?: string
    no_hp_pemesan: string
    nama_proyek: string
    nama_proyek_kapal?: string
    material: string
    ketebalan: string
    jumlah_pesanan: number
    ukuran_part?: string
    waktu_pengambilan: string
    waktu_custom?: string
    deadline_pekerjaan?: string
    catatan_pekerjaan?: string
    drawing_file_name?: string
    drawing_data_url?: string
    target_cnc: string
  }): Promise<Order> {
    const jenisPekerjaan = data.jenis_pekerjaan_kategori === 'Lainnya'
      ? (data.jenis_lainnya?.trim() || 'Lainnya')
      : data.jenis_pekerjaan_kategori

    const waktuDiinginkan = (data.waktu_pengambilan === 'Lainnya' || data.waktu_pengambilan === 'Tanggal + Jam')
      ? (data.waktu_custom?.trim() || 'Lainnya')
      : data.waktu_pengambilan

    // Generate unique order number (prevents NOT NULL and UNIQUE constraint violation in Supabase)
    let maxOrderNum = 0

    // 1. Periksa state lokal terlebih dahulu
    orders.value.forEach(o => {
      const match = o.no_order && (o.no_order.match(/ORD-CNC-(\d+)/i) || o.no_order.match(/(\d+)/))
      if (match) {
        const n = parseInt(match[1], 10)
        if (!isNaN(n) && n > maxOrderNum) maxOrderNum = n
      }
    })

    // 2. Query ke Supabase untuk mendapatkan data order terbaru secara real-time
    // Ini mencegah duplicate key violation jika state lokal browser belum tersinkronisasi atau kosong
    if (isConfigured && supabase) {
      try {
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('no_order')
          .order('id', { ascending: false })
          .limit(100)

        if (recentOrders && recentOrders.length > 0) {
          recentOrders.forEach((o: any) => {
            const match = o.no_order && (o.no_order.match(/ORD-CNC-(\d+)/i) || o.no_order.match(/(\d+)/))
            if (match) {
              const n = parseInt(match[1], 10)
              if (!isNaN(n) && n > maxOrderNum) maxOrderNum = n
            }
          })
        }
      } catch (e) {
        console.warn('Gagal membaca no_order terbaru dari Supabase, menggunakan nomor urut lokal:', e)
      }
    }

    let orderSeq = maxOrderNum + 1
    let generatedNoOrder = 'ORD-CNC-' + String(orderSeq).padStart(3, '0')

    // 3. Pre-check langsung ke Supabase: pastikan no_order belum terpakai SEBELUM INSERT dilakukan
    // Ini mencegah PostgreSQL melempar duplicate key error ke Supabase Postgres Logs
    if (isConfigured && supabase) {
      let attempts = 0
      while (attempts < 20) {
        try {
          const { data: existing } = await supabase
            .from('orders')
            .select('id')
            .eq('no_order', generatedNoOrder)
            .maybeSingle()

          if (!existing) {
            break // Nomor ini aman dan belum terpakai
          }
          // Jika nomor sudah terpakai oleh pengguna lain, naikkan ke nomor urut berikutnya
          orderSeq++
          generatedNoOrder = 'ORD-CNC-' + String(orderSeq).padStart(3, '0')
          attempts++
        } catch {
          break
        }
      }
    }

    if (orders.value.some(o => o.no_order === generatedNoOrder)) {
      generatedNoOrder = `ORD-CNC-${String(orderSeq).padStart(3, '0')}-${Date.now().toString().slice(-4)}`
    }

    // Build payload WITHOUT id — let Supabase BIGSERIAL auto-generate id
    const orderPayload = {
      no_order: generatedNoOrder,
      jenis_pekerjaan: jenisPekerjaan,
      jenis_pekerjaan_kategori: data.jenis_pekerjaan_kategori,
      deskripsi_pekerjaan: data.deskripsi_pekerjaan?.trim() || data.nama_proyek?.trim() || data.jenis_pekerjaan_kategori || '-',
      nama_pemesan: data.nama_pemesan.trim(),
      departemen_pemesan: data.departemen_pemesan.trim(),
      nik_pemesan: data.nik_pemesan?.trim() || undefined,
      no_hp_pemesan: data.no_hp_pemesan.trim(),
      nama_proyek: data.nama_proyek.trim(),
      nama_proyek_kapal: data.nama_proyek_kapal?.trim() || '-',
      material: data.material,
      ketebalan: data.ketebalan.trim(),
      jumlah_pesanan: Number(data.jumlah_pesanan) || 1,
      satuan: 'pcs',
      ukuran_part: data.ukuran_part?.trim() || '-',
      waktu_pengambilan_diinginkan: waktuDiinginkan,
      deadline_pekerjaan: data.deadline_pekerjaan || null,
      catatan_pekerjaan: data.catatan_pekerjaan?.trim() || null,
      drawing_file_name: data.drawing_file_name || null,
      drawing_data_url: data.drawing_data_url || null,
      target_cnc: data.target_cnc,
      status: 'Diterima'
    }

    let finalId: number
    let finalNoOrder: string = generatedNoOrder

    if (isConfigured && supabase) {
      // Insert to Supabase FIRST, get auto-generated id back
      let { data: inserted, error } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select('*')
        .single()

      // Auto-retry jika terjadi collision/race condition dengan nomor order yang sama
      if (error && (error.code === '23505' || error.message?.toLowerCase().includes('unique') || error.message?.toLowerCase().includes('orders_no_order_key'))) {
        console.warn('Terdeteksi duplikasi no_order (race condition), melakukan retry otomatis dengan suffix unik...')
        const uniqueSuffix = Date.now().toString().slice(-4) + Math.random().toString(36).substring(2, 5).toUpperCase()
        generatedNoOrder = `ORD-CNC-${String(orderSeq).padStart(3, '0')}-${uniqueSuffix}`
        orderPayload.no_order = generatedNoOrder

        const retryResult = await supabase
          .from('orders')
          .insert([orderPayload])
          .select('*')
          .single()

        inserted = retryResult.data
        error = retryResult.error
      }

      if (error) {
        console.error('Supabase createOrder error:', error.message, error.details, error.code)
        // Fallback: generate local ID
        finalId = orders.value.length > 0 ? Math.max(...orders.value.map(o => o.id)) + 1 : 1
      } else {
        finalId = inserted.id
        finalNoOrder = inserted.no_order || generatedNoOrder
      }
    } else {
      // No Supabase: generate local ID
      finalId = orders.value.length > 0 ? Math.max(...orders.value.map(o => o.id)) + 1 : 1
    }

    const newOrder: Order = {
      id: finalId,
      ...orderPayload,
      no_order: finalNoOrder,
      status: 'Diterima',
      created_at: new Date().toISOString()
    }

    orders.value.unshift(newOrder)
    saveToLocalStorage()

    return newOrder
  }

  // ==========================================
  // FIX #1: saveEstimation — supports both order-linked and manual (non-order) estimations
  // FIX #2: check Supabase { error } response
  // ==========================================
  async function saveEstimation(data: {
    id?: number
    order_id?: number | null
    project_name?: string
    nesting_no?: string
    block_item?: string
    spec_material?: string
    dimension_material?: string
    product_number?: string
    heat_number?: string
    cutting_image_url?: string
    grade?: string
    tebal?: string
    ukuran_plat?: string
    lembar?: number
    berat_kg?: number
    jam?: number
    remnant?: string
    tgl_selesai?: string
    catatan?: string
    status_approval?: string
  }): Promise<OrderEstimation | undefined> {
    const order = data.order_id ? orders.value.find(o => o.id === data.order_id) : undefined

    // Find existing
    let existingIdx = -1
    if (data.order_id) {
      existingIdx = estimations.value.findIndex(e => e.order_id === data.order_id)
    } else if (data.id) {
      existingIdx = estimations.value.findIndex(e => e.id === data.id)
    }

    // Proteksi: Jika estimasi sudah Disetujui, kunci dan cegah modifikasi
    if (existingIdx >= 0 && estimations.value[existingIdx].status_approval === 'Disetujui') {
      console.warn('Material Identification ini sudah disetujui dan terkunci.')
      return estimations.value[existingIdx]
    }

    const nextEstId = estimations.value.length > 0 ? Math.max(...estimations.value.map(e => e.id || 0)) + 1 : 1

    const newEst: OrderEstimation = {
      id: (existingIdx >= 0 && estimations.value[existingIdx].id) ? estimations.value[existingIdx].id : (data.id || nextEstId),
      order_id: data.order_id || null,
      project_name: data.project_name?.trim() || (order ? order.nama_proyek : 'Pekerjaan Workshop CNC (Manual)'),
      nesting_no: data.nesting_no?.trim() || '',
      block_item: data.block_item?.trim() || '',
      spec_material: data.spec_material?.trim() || '',
      dimension_material: data.dimension_material?.trim() || data.ukuran_plat || (order ? order.ketebalan : ''),
      product_number: (data.product_number && data.product_number.trim() !== '-') ? data.product_number.trim() : '',
      heat_number: data.heat_number?.trim() || '',
      cutting_image_url: data.cutting_image_url || '',
      status_approval: data.status_approval || 'Disetujui',
      // backward compatibility fields
      grade: data.spec_material?.trim() || data.grade || '',
      tebal: data.dimension_material || data.tebal || (order ? order.ketebalan : ''),
      ukuran_plat: data.dimension_material || data.ukuran_plat || '',
      lembar: Number(data.lembar) || 1,
      berat_kg: Number(data.berat_kg) || 0,
      jam: Number(data.jam) || 0,
      remnant: data.remnant || '',
      tgl_selesai: data.tgl_selesai || new Date().toISOString().split('T')[0],
      catatan: data.catatan || ''
    }

    if (existingIdx >= 0) {
      estimations.value[existingIdx] = newEst
    } else {
      estimations.value.unshift(newEst)
    }

    if (order) {
      order.estimation = newEst
    }
    saveToLocalStorage()

    if (isConfigured && supabase) {
      const { id: _ignoreId, ...estPayload } = newEst
      try {
        if (data.order_id) {
          const { data: upserted, error } = await supabase
            .from('order_estimations')
            .upsert([estPayload], { onConflict: 'order_id' })
            .select('*')
            .single()

          if (error) {
            console.error('Supabase saveEstimation error:', error.message, error.code)
          } else if (upserted?.id) {
            newEst.id = upserted.id
            const idx = estimations.value.findIndex(e => e.order_id === data.order_id)
            if (idx >= 0) estimations.value[idx] = newEst
            if (order) order.estimation = newEst
            saveToLocalStorage()
          }
        } else {
          // Manual estimation (order_id is null)
          if (data.id) {
            const { error } = await supabase.from('order_estimations').update(estPayload).eq('id', data.id)
            if (error) console.error('Supabase update manual estimation error:', error.message)
          } else {
            const { data: inserted, error } = await supabase
              .from('order_estimations')
              .insert([estPayload])
              .select('*')
              .single()

            if (error) {
              console.error('Supabase insert manual estimation error:', error.message)
            } else if (inserted?.id) {
              newEst.id = inserted.id
              const idx = estimations.value.findIndex(e => e === newEst)
              if (idx >= 0) estimations.value[idx].id = inserted.id
              saveToLocalStorage()
            }
          }
        }
      } catch (err) {
        console.warn('Supabase estimation exception:', err)
      }
    }

    return newEst
  }

  async function approveEstimation(targetId: number, isDirectEstimationId = false) {
    let est: OrderEstimation | undefined
    let order: Order | undefined

    if (isDirectEstimationId) {
      est = estimations.value.find(e => e.id === targetId)
      if (est && est.order_id) {
        order = orders.value.find(o => o.id === est.order_id)
      }
    } else {
      order = orders.value.find(o => o.id === targetId)
      est = estimations.value.find(e => e.order_id === targetId)
    }

    if (order && order.estimation) {
      order.estimation.status_approval = 'Disetujui'
    }
    if (est) {
      est.status_approval = 'Disetujui'
    }

    if (order && order.status === 'Estimasi Selesai') {
      if (order.waktu_diambil) order.status = 'Sudah Diambil'
      else if (order.kode_pengambilan) order.status = 'Siap Diambil'
      else order.status = 'Diterima'
    }
    saveToLocalStorage()

    if (isConfigured && supabase) {
      if (est?.id) {
        await supabase.from('order_estimations').update({ status_approval: 'Disetujui' }).eq('id', est.id)
      } else if (order) {
        await supabase.from('order_estimations').update({ status_approval: 'Disetujui' }).eq('order_id', order.id)
      }
    }
  }

  async function deleteEstimation(estimationId: number) {
    const idx = estimations.value.findIndex(e => e.id === estimationId)
    if (idx >= 0) {
      const est = estimations.value[idx]
      if (est.order_id) {
        const o = orders.value.find(ord => ord.id === est.order_id)
        if (o) o.estimation = null
      }
      estimations.value.splice(idx, 1)
      saveToLocalStorage()
      if (isConfigured && supabase) {
        await supabase.from('order_estimations').delete().eq('id', estimationId)
      }
      return true
    }
    return false
  }

  // ==========================================
  // FIX #2 & #4: addPlate — check Supabase error, let Supabase generate ID
  // ==========================================
  async function addPlate(data: {
    material_type: string
    grade: string
    heat_number?: string
    no_sertifikat_class?: string
    panjang_mm: number
    lebar_mm: number
    tebal_mm: number
    lokasi_yard?: string
    jumlah?: number
  }): Promise<Plate> {
    const qty = Math.max(1, Number(data.jumlah) || 1)
    const prefix = (data.material_type || '').toLowerCase().includes('alumin') ? 'AL' : 'KS'
    const year = new Date().getFullYear()
    const weight = calculateWeight(data.panjang_mm, data.lebar_mm, data.tebal_mm, data.material_type)
    const baseHeat = data.heat_number?.trim() || '-'
    const loc = data.lokasi_yard?.trim() || 'Yard A - Bay 1'
    const cert = data.no_sertifikat_class?.trim() || 'Mill Test'

    // Generate unique plate number (prevents NOT NULL and UNIQUE constraint violation in Supabase)
    let maxPlateNum = 0
    plates.value.forEach(p => {
      const match = p.no_plat && p.no_plat.match(/(\d+)$/)
      if (match) {
        const n = parseInt(match[1], 10)
        if (!isNaN(n) && n > maxPlateNum) maxPlateNum = n
      }
    })
    const plateSeq = maxPlateNum + 1
    let generatedNoPlat = `PLT-${prefix}-${year}-${String(plateSeq).padStart(3, '0')}`
    if (plates.value.some(p => p.no_plat === generatedNoPlat)) {
      generatedNoPlat = `PLT-${prefix}-${year}-${String(plateSeq).padStart(3, '0')}-${Date.now().toString().slice(-4)}`
    }

    // Build payload WITHOUT id — let Supabase BIGSERIAL auto-generate id
    const platePayload = {
      no_plat: generatedNoPlat,
      heat_number: baseHeat,
      grade: data.grade?.trim() || '-',
      material_type: data.material_type?.trim() || 'Baja',
      panjang_mm: Number(data.panjang_mm),
      lebar_mm: Number(data.lebar_mm),
      tebal_mm: Number(data.tebal_mm),
      berat_kg: weight,
      stok: qty,
      no_sertifikat_class: cert,
      lokasi_yard: loc,
      status: qty > 0 ? 'Tersedia' : 'Habis',
      is_remnant: false
    }

    let finalId: number
    let finalNoPlat: string = generatedNoPlat

    if (isConfigured && supabase) {
      // Insert to Supabase FIRST, get auto-generated id back
      const { data: inserted, error } = await supabase
        .from('plates')
        .insert([platePayload])
        .select('*')
        .single()

      if (error) {
        console.error('Supabase addPlate error:', error.message, error.details, error.code)
        // Fallback: generate local ID
        finalId = plates.value.length > 0 ? Math.max(...plates.value.map(p => p.id)) + 1 : 1
      } else {
        finalId = inserted.id
        finalNoPlat = inserted.no_plat || generatedNoPlat
      }
    } else {
      // No Supabase: generate local ID
      finalId = plates.value.length > 0 ? Math.max(...plates.value.map(p => p.id)) + 1 : 1
    }

    const newPlate: Plate = {
      id: finalId,
      no_plat: finalNoPlat,
      ...platePayload,
      created_at: new Date().toISOString()
    }

    plates.value.unshift(newPlate)
    saveToLocalStorage()

    return newPlate
  }

  async function deletePlate(plateId: number) {
    const idx = plates.value.findIndex(p => p.id === plateId)
    if (idx >= 0) {
      plates.value.splice(idx, 1)
      saveToLocalStorage()
      if (isConfigured && supabase) {
        const { error } = await supabase.from('plates').delete().eq('id', plateId)
        if (error) {
          console.error('Supabase deletePlate error:', error.message)
        }
      }
      return true
    }
    return false
  }

  async function updatePlateStock(plateId: number, newStock: number) {
    const idx = plates.value.findIndex(p => p.id === plateId)
    if (idx >= 0) {
      const validStock = Math.max(0, Math.floor(Number(newStock) || 0))
      const currentPlate = plates.value[idx]
      let newStatus = currentPlate.status
      if (validStock <= 0) {
        newStatus = 'Habis'
      } else if (currentPlate.status === 'Habis') {
        newStatus = 'Tersedia'
      }

      plates.value[idx].stok = validStock
      plates.value[idx].status = newStatus
      saveToLocalStorage()

      if (isConfigured && supabase) {
        const { error } = await supabase
          .from('plates')
          .update({ stok: validStock, status: newStatus })
          .eq('id', plateId)
        if (error) {
          console.error('Supabase updatePlateStock error:', error.message)
        }
      }
      return plates.value[idx]
    }
    return null
  }

  // ==========================================
  // FIX #2 & #4: pickupPlateYard — check Supabase errors, let Supabase generate IDs
  // ==========================================
  async function pickupPlateYard(data: {
    order_id?: number | null
    plate_id: number
    jumlah_ambil?: number
    pengambil: string
    petugas_yard?: string
    keperluan?: string
    is_partial?: boolean
    sisa_p?: number
    sisa_l?: number
  }) {
    const plate = plates.value.find(p => p.id === data.plate_id)
    if (!plate) {
      throw new Error('Plat tidak ditemukan.')
    }

    const currentStok = plate.stok !== undefined && plate.stok !== null ? plate.stok : (plate.status === 'Diambil' || plate.status === 'Habis' ? 0 : 1)
    const qtyAmbil = Math.max(1, Number(data.jumlah_ambil) || 1)

    if (currentStok <= 0) {
      throw new Error('PERINGATAN: Stok plat ini sudah habis!')
    }
    if (qtyAmbil > currentStok) {
      throw new Error(`Jumlah yang diambil (${qtyAmbil} lembar) melebihi stok yang tersedia (${currentStok} lembar)!`)
    }

    // Kurangi stok plat
    plate.stok = currentStok - qtyAmbil
    if (plate.stok <= 0) {
      plate.status = 'Habis'
    } else {
      plate.status = 'Tersedia'
    }

    let remnantPlate: Plate | null = null
    const sisaP = Number(data.sisa_p) || 0
    const sisaL = Number(data.sisa_l) || 0

    if (data.is_partial && sisaP > 0 && sisaL > 0) {
      const remWeight = calculateWeight(sisaP, sisaL, plate.tebal_mm, plate.material_type)

      // Generate unique remnant plate number (prevents NOT NULL constraint error)
      let maxRemNum = 0
      plates.value.forEach(p => {
        const match = p.no_plat && p.no_plat.match(/(\d+)$/)
        if (match) {
          const n = parseInt(match[1], 10)
          if (!isNaN(n) && n > maxRemNum) maxRemNum = n
        }
      })
      const remSeq = maxRemNum + 1
      let generatedRemNoPlat = `PLT-REM-${new Date().getFullYear()}-${String(remSeq).padStart(3, '0')}`
      if (plates.value.some(p => p.no_plat === generatedRemNoPlat)) {
        generatedRemNoPlat = `PLT-REM-${new Date().getFullYear()}-${String(remSeq).padStart(3, '0')}-${Date.now().toString().slice(-4)}`
      }

      const remPayload = {
        no_plat: generatedRemNoPlat,
        heat_number: plate.heat_number,
        grade: plate.grade,
        material_type: plate.material_type,
        panjang_mm: sisaP,
        lebar_mm: sisaL,
        tebal_mm: plate.tebal_mm,
        berat_kg: remWeight,
        stok: 1,
        no_sertifikat_class: plate.no_sertifikat_class,
        lokasi_yard: 'Area CNC - Rak Remnant',
        status: 'Sisa Potongan / Remnant',
        is_remnant: true,
        parent_plate_id: plate.id
      }

      let remId: number
      let remNoPlat: string = generatedRemNoPlat

      if (isConfigured && supabase) {
        const { data: insertedRem, error: remErr } = await supabase
          .from('plates')
          .insert([remPayload])
          .select('*')
          .single()

        if (remErr) {
          console.error('Supabase insert remnant error:', remErr.message)
          remId = plates.value.length > 0 ? Math.max(...plates.value.map(p => p.id)) + 1 : 1
        } else {
          remId = insertedRem.id
          remNoPlat = insertedRem.no_plat || generatedRemNoPlat
        }
      } else {
        remId = plates.value.length > 0 ? Math.max(...plates.value.map(p => p.id)) + 1 : 1
      }

      remnantPlate = {
        id: remId,
        no_plat: remNoPlat,
        ...remPayload,
        created_at: new Date().toISOString()
      }
      plates.value.push(remnantPlate)
    }

    // Update order jika ada order_id yang diberikan (opsional)
    let order: Order | undefined = undefined
    if (data.order_id) {
      order = orders.value.find(o => o.id === data.order_id)
      if (order) {
        order.status = 'Plat Telah Diambil Yard'
        order.plate_id = plate.id
        order.plat_dipakai = `${plate.no_plat} (Heat: ${plate.heat_number})`
      }
    }

    // Yard pickup record
    const ypPayload = {
      order_id: order?.id || null,
      plate_id: plate.id,
      jumlah_ambil: qtyAmbil,
      sisa_stok: plate.stok,
      keperluan: data.keperluan?.trim() || '-',
      remnant_plate_id: remnantPlate?.id || null,
      pengambil: data.pengambil?.trim() || '-',
      petugas_yard: data.petugas_yard?.trim() || '-',
      is_partial: data.is_partial && remnantPlate !== null,
      sisa_p: data.is_partial ? sisaP : null,
      sisa_l: data.is_partial ? sisaL : null,
      picked_up_at: new Date().toISOString()
    }

    let ypId: number

    if (isConfigured && supabase) {
      // Update plate stok in Supabase
      const { error: plateUpErr } = await supabase.from('plates').update({
        stok: plate.stok,
        status: plate.status
      }).eq('id', plate.id)
      if (plateUpErr) console.error('Supabase update plate stok error:', plateUpErr.message)

      // Update order in Supabase
      if (order) {
        const { error: orderUpErr } = await supabase.from('orders').update({
          status: 'Plat Telah Diambil Yard',
          plate_id: plate.id,
          plat_dipakai: order.plat_dipakai
        }).eq('id', order.id)
        if (orderUpErr) console.error('Supabase update order for yard pickup error:', orderUpErr.message)
      }

      // Insert yard pickup to Supabase
      const { data: insertedYp, error: ypErr } = await supabase
        .from('yard_pickups')
        .insert([ypPayload])
        .select('*')
        .single()

      if (ypErr) {
        console.error('Supabase insert yard_pickup error:', ypErr.message)
        ypId = yardPickups.value.length > 0 ? Math.max(...yardPickups.value.map(y => y.id)) + 1 : 1
      } else {
        ypId = insertedYp.id
      }
    } else {
      ypId = yardPickups.value.length > 0 ? Math.max(...yardPickups.value.map(y => y.id)) + 1 : 1
    }

    const newYp: YardPickup = {
      id: ypId,
      ...ypPayload
    }
    yardPickups.value.unshift(newYp)

    saveToLocalStorage()

    return { order, plate, remnant: remnantPlate, jumlah_ambil: qtyAmbil, sisa_stok: plate.stok }
  }

  // ==========================================
  // FIX #2: Operator actions — check Supabase errors
  // ==========================================
  async function operatorAccept(orderId: number) {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return
    order.status = 'Diterima Operator'
    saveToLocalStorage()
    if (isConfigured && supabase) {
      const { error } = await supabase.from('orders').update({ status: order.status }).eq('id', orderId)
      if (error) console.error('Supabase operatorAccept error:', error.message)
    }
  }

  async function operatorStart(orderId: number) {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return
    order.status = 'Sedang Dipotong'
    order.waktu_mulai = new Date().toISOString()
    saveToLocalStorage()
    if (isConfigured && supabase) {
      const { error } = await supabase.from('orders').update({ status: order.status, waktu_mulai: order.waktu_mulai }).eq('id', orderId)
      if (error) console.error('Supabase operatorStart error:', error.message)
    }
  }

  async function operatorFinish(orderId: number): Promise<string> {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return ''
    const randomPin = String(Math.floor(100000 + Math.random() * 900000))
    order.status = 'Siap Diambil'
    order.kode_pengambilan = randomPin
    order.waktu_selesai = new Date().toISOString()
    saveToLocalStorage()
    if (isConfigured && supabase) {
      const { error } = await supabase.from('orders').update({
        status: order.status,
        kode_pengambilan: order.kode_pengambilan,
        waktu_selesai: order.waktu_selesai
      }).eq('id', orderId)
      if (error) console.error('Supabase operatorFinish error:', error.message)
    }
    return randomPin
  }

  // PIN VERIFICATION — FIX #2: check errors
  async function verifyPin(orderId: number, pin: string, pengambil: string, departemen: string): Promise<boolean> {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return false
    if (order.kode_pengambilan !== pin.trim()) {
      return false
    }

    order.status = 'Sudah Diambil'
    order.waktu_diambil = new Date().toISOString()
    order.pengambil_akhir = pengambil.trim()
    order.departemen_pengambil = departemen.trim()

    if (order.plate_id) {
      const p = plates.value.find(plt => plt.id === order.plate_id)
      if (p && p.status === 'Diambil') {
        p.status = 'Sudah Dipotong'
      }
    }

    saveToLocalStorage()

    if (isConfigured && supabase) {
      const { error: orderErr } = await supabase.from('orders').update({
        status: 'Sudah Diambil',
        waktu_diambil: order.waktu_diambil,
        pengambil_akhir: order.pengambil_akhir,
        departemen_pengambil: order.departemen_pengambil
      }).eq('id', orderId)
      if (orderErr) console.error('Supabase verifyPin order update error:', orderErr.message)

      if (order.plate_id) {
        const { error: plateErr } = await supabase.from('plates').update({ status: 'Sudah Dipotong' }).eq('id', order.plate_id)
        if (plateErr) console.error('Supabase verifyPin plate update error:', plateErr.message)
      }
    }

    return true
  }

  // ADMIN ACTIONS
  async function createUser(data: { name: string; username: string; email: string; role: 'admin' | 'operator' | 'mandor' | 'user'; department?: string; password: string }) {
    const cleanUsername = sanitizeInput(data.username || '').toLowerCase().trim()
    const cleanEmail = sanitizeInput(data.email || '').toLowerCase().trim()
    const cleanName = sanitizeInput(data.name || '').trim()
    const cleanDept = sanitizeInput(data.department || '').trim()
    const rawPwd = (data.password || '123').trim()

    // 1. Validation
    if (!cleanUsername || !cleanEmail || !cleanName) {
      return { success: false, message: 'Nama, Username, dan Email wajib diisi.' }
    }

    // 2. Check duplicate locally
    const existing = users.value.find(u => 
      u.username.toLowerCase() === cleanUsername || 
      u.email.toLowerCase() === cleanEmail
    )
    if (existing) {
      const msg = existing.username.toLowerCase() === cleanUsername 
        ? `Username "${cleanUsername}" sudah digunakan oleh pengguna lain.` 
        : `Email "${cleanEmail}" sudah digunakan oleh pengguna lain.`
      return { success: false, message: msg }
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(rawPwd)

    // 4. In Supabase profiles, map 'operator' to 'mandor' for compatibility with database schema constraint
    const dbRole = data.role === 'operator' ? 'mandor' : data.role

    // 5. Insert into Supabase if configured
    let generatedId = generateUuid()
    if (isConfigured && supabase) {
      try {
        const payload = {
          id: generatedId,
          name: cleanName,
          username: cleanUsername,
          email: cleanEmail,
          role: dbRole,
          department: cleanDept,
          password_hash: hashedPassword
        }

        const { data: inserted, error } = await supabase
          .from('profiles')
          .insert([payload])
          .select('*')
          .single()

        if (error) {
          console.error('Supabase create user error:', error)
          if (error.code === '23505') {
            return { success: false, message: 'Username atau Email sudah terdaftar di Supabase.' }
          }
          return { success: false, message: error.message || 'Gagal menyimpan ke database Supabase.' }
        }

        if (inserted?.id) {
          generatedId = inserted.id
        }
      } catch (e: any) {
        console.error('Supabase create user exception:', e)
        return { success: false, message: e.message || 'Gagal menghubungi database Supabase.' }
      }
    }

    // 6. Add to reactive state and local storage
    const newUser: UserProfile = {
      id: generatedId,
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      role: data.role,
      department: cleanDept,
      password_hash: hashedPassword
    }
    users.value.push(newUser)
    saveToLocalStorage()

    return { success: true, user: newUser }
  }

  async function updateUserRole(userId: string, newRole: 'admin' | 'operator' | 'mandor' | 'user') {
    if (currentUser.value?.role !== 'admin') {
      return { success: false, message: 'Akses ditolak: Hanya Administrator yang dapat mengubah role pengguna.' }
    }
    const u = users.value.find(user => user.id === userId)
    if (!u) return { success: false, message: 'User tidak ditemukan.' }
    const oldRole = u.role
    u.role = newRole
    saveToLocalStorage()
    if (isConfigured && supabase) {
      const dbRole = newRole === 'operator' ? 'mandor' : newRole
      const { error } = await supabase.from('profiles').update({ role: dbRole }).eq('id', userId)
      if (error) {
        console.error('Supabase update role error:', error)
        u.role = oldRole
        saveToLocalStorage()
        return { success: false, message: error.message }
      }
    }
    return { success: true }
  }

  async function deleteUser(userId: string) {
    if (currentUser.value?.role !== 'admin') {
      return { success: false, message: 'Akses ditolak: Hanya Administrator yang dapat menghapus pengguna.' }
    }
    const prevUsers = [...users.value]
    users.value = users.value.filter(u => u.id !== userId)
    saveToLocalStorage()
    if (isConfigured && supabase) {
      const { error } = await supabase.from('profiles').delete().eq('id', userId)
      if (error) {
        console.error('Supabase delete user error:', error)
        users.value = prevUsers
        saveToLocalStorage()
        return { success: false, message: error.message }
      }
    }
    return { success: true }
  }

  async function resetDataToZero() {
    if (currentUser.value?.role !== 'admin') {
      console.warn('Akses ditolak: Hanya Administrator yang dapat mereset database.')
      return
    }
    orders.value = []
    plates.value = []
    estimations.value = []
    yardPickups.value = []
    saveToLocalStorage()
    if (isConfigured && supabase) {
      const { error: e1 } = await supabase.from('yard_pickups').delete().neq('id', 0)
      if (e1) console.error('Reset yard_pickups error:', e1.message)
      const { error: e2 } = await supabase.from('order_estimations').delete().neq('id', 0)
      if (e2) console.error('Reset order_estimations error:', e2.message)
      const { error: e3 } = await supabase.from('orders').delete().neq('id', 0)
      if (e3) console.error('Reset orders error:', e3.message)
      const { error: e4 } = await supabase.from('plates').delete().neq('id', 0)
      if (e4) console.error('Reset plates error:', e4.message)
    }
  }

  // EXPORT CSV
  function exportHistoryCsv(): boolean {
    const completed = orders.value.filter(o => o.status === 'Sudah Diambil')
    if (completed.length === 0) return false

    let csv = '\uFEFFNo. Order,Pemesan,Departemen,Proyek,Kapal/Hull,Material,Tebal,Grade,Jumlah,Target CNC,Pengambil,PIN,Waktu Diambil\n'
    completed.forEach(o => {
      csv += `"${o.no_order}","${o.nama_pemesan}","${o.departemen_pemesan}","${o.nama_proyek}","${o.nama_proyek_kapal || '-'}","${o.material}","${o.ketebalan}","${o.estimation?.spec_material || o.estimation?.grade || '-'}","${o.jumlah_pesanan} ${o.satuan}","${o.target_cnc}","${o.pengambil_akhir || o.nama_pemesan}","${o.kode_pengambilan || '-'}","${o.waktu_diambil ? new Date(o.waktu_diambil).toLocaleString('id-ID') : '-'}"\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'History_Pemotongan_Plat_CNC.csv'
    a.click()
    URL.revokeObjectURL(url)
    return true
  }

  return {
    currentUser,
    users,
    orders,
    plates,
    estimations,
    yardPickups,
    isInitialized,
    isSyncing,
    isConfigured,
    supabaseUrl,
    supabaseKey,
    setCustomCredentials,
    clearCustomCredentials,
    checkConnection,
    initStore,
    syncFromSupabase,
    login,
    logout,
    createOrder,
    saveEstimation,
    approveEstimation,
    deleteEstimation,
    addPlate,
    deletePlate,
    updatePlateStock,
    pickupPlateYard,
    operatorAccept,
    operatorStart,
    operatorFinish,
    verifyPin,
    createUser,
    updateUserRole,
    deleteUser,
    resetDataToZero,
    exportHistoryCsv
  }
}
