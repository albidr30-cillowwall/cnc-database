import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'

export interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  role: 'admin' | 'mandor' | 'user'
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
  no_sertifikat_class?: string
  lokasi_yard: string
  status: 'Tersedia' | 'Dipesan' | 'Diambil' | 'Sudah Dipotong' | 'Sisa Potongan / Remnant' | string
  is_remnant: boolean
  parent_plate_id?: number | null
  order_id_pemakai?: string | null
  created_at?: string
}

export interface OrderEstimation {
  id?: number
  order_id: number
  grade: string
  tebal: string
  ukuran_plat: string
  lembar: number
  berat_kg: number
  jam: number
  remnant?: string
  tgl_selesai: string
  catatan?: string
  status_approval: string
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
  order_id: number
  plate_id: number
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

// Global Shared State
const defaultUsers: UserProfile[] = [
  { id: '1', name: 'Administrator CNC', username: 'admin', email: 'admin@gmail.com', role: 'admin', department: 'IT & Material Control', password_hash: '123' },
  { id: '2', name: 'Mandor & Operator CNC', username: 'mandor', email: 'mandor@gmail.com', role: 'mandor', department: 'Produksi CNC', password_hash: '123' },
  { id: '3', name: 'User (Pemesan / Viewer)', username: 'user', email: 'user@gmail.com', role: 'user', department: 'Hull Construction', password_hash: '123' }
]

const currentUser = ref<UserProfile | null>(null)
const users = ref<UserProfile[]>([...defaultUsers])
const orders = ref<Order[]>([])
const plates = ref<Plate[]>([])
const estimations = ref<OrderEstimation[]>([])
const yardPickups = ref<YardPickup[]>([])
const isInitialized = ref(false)
const isSyncing = ref(false)

export function useCncStore() {
  const { supabase, isConfigured } = useSupabase()
  const userCookie = useCookie<UserProfile | null>('cnc_session_user', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax'
  })

  // Restore session immediately on both SSR server and browser client
  if (!currentUser.value) {
    if (userCookie.value) {
      currentUser.value = userCookie.value
    } else if (import.meta.client) {
      const saved = localStorage.getItem('cnc_session_user')
      if (saved) {
        try {
          currentUser.value = JSON.parse(saved)
          userCookie.value = currentUser.value
        } catch {}
      }
    }
  }

  // Helper calculate plate weight
  function calculateWeight(p: number, l: number, t: number, mat: string): number {
    const m = (mat || '').toLowerCase()
    const density = m.includes('alumin') ? 0.0000027 : (m.includes('stainless') ? 0.0000080 : 0.00000785)
    return parseFloat((p * l * t * density).toFixed(2))
  }

  // Local Storage save
  function saveToLocalStorage() {
    if (!import.meta.client) return
    localStorage.setItem('cnc_users_v3', JSON.stringify(users.value))
    localStorage.setItem('cnc_orders_v3', JSON.stringify(orders.value))
    localStorage.setItem('cnc_plates_v3', JSON.stringify(plates.value))
    localStorage.setItem('cnc_estimations_v3', JSON.stringify(estimations.value))
    localStorage.setItem('cnc_pickups_v3', JSON.stringify(yardPickups.value))
    if (currentUser.value) {
      localStorage.setItem('cnc_session_user', JSON.stringify(currentUser.value))
    } else {
      localStorage.removeItem('cnc_session_user')
    }
  }

  // Initialize store (from Supabase or LocalStorage)
  async function initStore() {
    if (!import.meta.client || isInitialized.value) return

    // 1. Restore session user
    const savedSession = localStorage.getItem('cnc_session_user')
    if (savedSession) {
      try {
        currentUser.value = JSON.parse(savedSession)
      } catch {}
    }

    // 2. Load LocalStorage first (for instant display)
    const localUsers = localStorage.getItem('cnc_users_v3')
    if (localUsers) {
      try { users.value = JSON.parse(localUsers) } catch {}
    }
    const localOrders = localStorage.getItem('cnc_orders_v3')
    if (localOrders) {
      try { orders.value = JSON.parse(localOrders) } catch {}
    }
    const localPlates = localStorage.getItem('cnc_plates_v3')
    if (localPlates) {
      try { plates.value = JSON.parse(localPlates) } catch {}
    }
    const localEst = localStorage.getItem('cnc_estimations_v3')
    if (localEst) {
      try { estimations.value = JSON.parse(localEst) } catch {}
    }
    const localPickups = localStorage.getItem('cnc_pickups_v3')
    if (localPickups) {
      try { yardPickups.value = JSON.parse(localPickups) } catch {}
    }

    isInitialized.value = true

    // 3. If Supabase is configured, sync from Supabase
    if (isConfigured && supabase) {
      await syncFromSupabase()
    }
  }

  // Sync from Supabase tables
  async function syncFromSupabase() {
    if (!supabase || !isConfigured) return
    isSyncing.value = true
    try {
      // Fetch users
      const { data: profileData } = await supabase.from('profiles').select('*')
      if (profileData && profileData.length > 0) {
        users.value = profileData.map(p => ({
          id: p.id,
          name: p.name,
          username: p.username,
          email: p.email,
          role: p.role,
          department: p.department,
          password_hash: p.password_hash
        }))
      }

      // Fetch plates
      const { data: plateData } = await supabase.from('plates').select('*').order('id', { ascending: false })
      if (plateData) {
        plates.value = plateData.map(p => ({
          id: p.id,
          no_plat: p.no_plat,
          heat_number: p.heat_number,
          grade: p.grade,
          material_type: p.material_type,
          panjang_mm: p.panjang_mm,
          lebar_mm: p.lebar_mm,
          tebal_mm: parseFloat(p.tebal_mm),
          berat_kg: parseFloat(p.berat_kg),
          no_sertifikat_class: p.no_sertifikat_class,
          lokasi_yard: p.lokasi_yard,
          status: p.status,
          is_remnant: Boolean(p.is_remnant),
          parent_plate_id: p.parent_plate_id,
          order_id_pemakai: p.order_id_pemakai,
          created_at: p.created_at
        }))
      }

      // Fetch estimations
      const { data: estData } = await supabase.from('order_estimations').select('*')
      if (estData) {
        estimations.value = estData.map(e => ({
          id: e.id,
          order_id: e.order_id,
          grade: e.grade,
          tebal: e.tebal,
          ukuran_plat: e.ukuran_plat,
          lembar: e.lembar,
          berat_kg: parseFloat(e.berat_kg),
          jam: parseFloat(e.jam),
          remnant: e.remnant,
          tgl_selesai: e.tgl_selesai,
          catatan: e.catatan,
          status_approval: e.status_approval
        }))
      }

      // Fetch orders
      const { data: orderData } = await supabase.from('orders').select('*').order('id', { ascending: false })
      if (orderData) {
        orders.value = orderData.map(o => {
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
            status: o.status,
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

      // Fetch pickups
      const { data: pickupData } = await supabase.from('yard_pickups').select('*').order('id', { ascending: false })
      if (pickupData) {
        yardPickups.value = pickupData.map(yp => ({
          id: yp.id,
          order_id: yp.order_id,
          plate_id: yp.plate_id,
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

  // AUTH ACTIONS
  function login(identity: string, password: string): { success: boolean; message?: string } {
    const term = identity.trim().toLowerCase()
    const user = users.value.find(u => 
      u.email.toLowerCase() === term || u.username.toLowerCase() === term
    )

    if (!user) {
      return { success: false, message: 'Username atau Email tidak ditemukan.' }
    }

    if (user.password_hash && user.password_hash !== password) {
      return { success: false, message: 'Password tidak sesuai.' }
    }

    currentUser.value = user
    userCookie.value = user
    saveToLocalStorage()
    return { success: true }
  }

  function logout() {
    currentUser.value = null
    userCookie.value = null
    saveToLocalStorage()
  }

  // ORDER ACTIONS
  async function createOrder(data: {
    jenis_pekerjaan_kategori: string
    jenis_lainnya?: string
    deskripsi_pekerjaan: string
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
    const nextId = orders.value.length > 0 ? Math.max(...orders.value.map(o => o.id)) + 1 : 1
    const noOrder = 'ORD-CNC-' + String(nextId).padStart(3, '0')

    const jenisPekerjaan = data.jenis_pekerjaan_kategori === 'Lainnya'
      ? (data.jenis_lainnya?.trim() || 'Lainnya')
      : data.jenis_pekerjaan_kategori

    const waktuDiinginkan = data.waktu_pengambilan === 'Tanggal + Jam'
      ? (data.waktu_custom || 'Tanggal + Jam belum diisi')
      : data.waktu_pengambilan

    const newOrder: Order = {
      id: nextId,
      no_order: noOrder,
      jenis_pekerjaan: jenisPekerjaan,
      jenis_pekerjaan_kategori: data.jenis_pekerjaan_kategori,
      deskripsi_pekerjaan: data.deskripsi_pekerjaan.trim(),
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
      deadline_pekerjaan: data.deadline_pekerjaan || undefined,
      catatan_pekerjaan: data.catatan_pekerjaan?.trim() || undefined,
      drawing_file_name: data.drawing_file_name,
      drawing_data_url: data.drawing_data_url,
      target_cnc: data.target_cnc,
      status: 'Menunggu Estimasi',
      created_at: new Date().toISOString()
    }

    orders.value.unshift(newOrder)
    saveToLocalStorage()

    if (isConfigured && supabase) {
      try {
        await supabase.from('orders').insert([{
          id: newOrder.id,
          no_order: newOrder.no_order,
          jenis_pekerjaan: newOrder.jenis_pekerjaan,
          jenis_pekerjaan_kategori: newOrder.jenis_pekerjaan_kategori,
          deskripsi_pekerjaan: newOrder.deskripsi_pekerjaan,
          nama_pemesan: newOrder.nama_pemesan,
          departemen_pemesan: newOrder.departemen_pemesan,
          nik_pemesan: newOrder.nik_pemesan,
          no_hp_pemesan: newOrder.no_hp_pemesan,
          nama_proyek: newOrder.nama_proyek,
          nama_proyek_kapal: newOrder.nama_proyek_kapal,
          material: newOrder.material,
          ketebalan: newOrder.ketebalan,
          jumlah_pesanan: newOrder.jumlah_pesanan,
          satuan: newOrder.satuan,
          ukuran_part: newOrder.ukuran_part,
          waktu_pengambilan_diinginkan: newOrder.waktu_pengambilan_diinginkan,
          deadline_pekerjaan: newOrder.deadline_pekerjaan || null,
          catatan_pekerjaan: newOrder.catatan_pekerjaan || null,
          drawing_file_name: newOrder.drawing_file_name || null,
          drawing_data_url: newOrder.drawing_data_url || null,
          target_cnc: newOrder.target_cnc,
          status: newOrder.status
        }])
      } catch (e) {
        console.warn('Supabase insert order error:', e)
      }
    }

    return newOrder
  }

  // ESTIMATION ACTIONS
  async function saveEstimation(data: {
    order_id: number
    grade: string
    tebal: string
    ukuran_plat: string
    lembar: number
    berat_kg: number
    jam: number
    remnant?: string
    tgl_selesai: string
    catatan?: string
  }) {
    const order = orders.value.find(o => o.id === data.order_id)
    if (!order) return

    const newEst: OrderEstimation = {
      order_id: data.order_id,
      grade: data.grade,
      tebal: data.tebal,
      ukuran_plat: data.ukuran_plat,
      lembar: Number(data.lembar) || 1,
      berat_kg: Number(data.berat_kg) || 0,
      jam: Number(data.jam) || 0,
      remnant: data.remnant || '',
      tgl_selesai: data.tgl_selesai,
      catatan: data.catatan || '',
      status_approval: 'Menunggu Persetujuan'
    }

    const existingIdx = estimations.value.findIndex(e => e.order_id === data.order_id)
    if (existingIdx >= 0) {
      estimations.value[existingIdx] = newEst
    } else {
      estimations.value.push(newEst)
    }

    order.estimation = newEst
    order.status = 'Menunggu Persetujuan Pemesan'
    saveToLocalStorage()

    if (isConfigured && supabase) {
      try {
        await supabase.from('order_estimations').upsert([newEst], { onConflict: 'order_id' })
        await supabase.from('orders').update({ status: order.status }).eq('id', order.id)
      } catch (e) {
        console.warn('Supabase estimation error:', e)
      }
    }
  }

  async function approveEstimation(orderId: number) {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return

    if (order.estimation) {
      order.estimation.status_approval = 'Disetujui'
    }
    order.status = 'Estimasi Selesai'
    saveToLocalStorage()

    if (isConfigured && supabase) {
      try {
        await supabase.from('order_estimations').update({ status_approval: 'Disetujui' }).eq('order_id', orderId)
        await supabase.from('orders').update({ status: 'Estimasi Selesai' }).eq('id', orderId)
      } catch (e) {
        console.warn('Supabase approve estimation error:', e)
      }
    }
  }

  // PLATE ACTIONS
  async function addPlate(data: {
    material_type: string
    grade: string
    heat_number: string
    no_sertifikat_class?: string
    panjang_mm: number
    lebar_mm: number
    tebal_mm: number
    lokasi_yard: string
  }): Promise<Plate> {
    const nextId = plates.value.length > 0 ? Math.max(...plates.value.map(p => p.id)) + 1 : 1
    const prefix = (data.material_type || '').toLowerCase().includes('alumin') ? 'AL' : 'KS'
    const noPlat = `PLT-${prefix}-${new Date().getFullYear()}-${String(nextId).padStart(3, '0')}`
    const weight = calculateWeight(data.panjang_mm, data.lebar_mm, data.tebal_mm, data.material_type)

    const newPlate: Plate = {
      id: nextId,
      no_plat: noPlat,
      heat_number: data.heat_number.trim(),
      grade: data.grade.trim(),
      material_type: data.material_type,
      panjang_mm: Number(data.panjang_mm),
      lebar_mm: Number(data.lebar_mm),
      tebal_mm: Number(data.tebal_mm),
      berat_kg: weight,
      no_sertifikat_class: data.no_sertifikat_class?.trim() || 'Mill Test',
      lokasi_yard: data.lokasi_yard.trim(),
      status: 'Tersedia',
      is_remnant: false,
      created_at: new Date().toISOString()
    }

    plates.value.unshift(newPlate)
    saveToLocalStorage()

    if (isConfigured && supabase) {
      try {
        await supabase.from('plates').insert([newPlate])
      } catch (e) {
        console.warn('Supabase addPlate error:', e)
      }
    }

    return newPlate
  }

  // YARD PICKUP & AUTO REMNANT
  async function pickupPlateYard(data: {
    order_id: number
    plate_id: number
    pengambil: string
    petugas_yard: string
    is_partial: boolean
    sisa_p?: number
    sisa_l?: number
  }) {
    const order = orders.value.find(o => o.id === data.order_id)
    const plate = plates.value.find(p => p.id === data.plate_id)

    if (!order || !plate) {
      throw new Error('Order atau Plat tidak ditemukan.')
    }

    if (plate.status !== 'Tersedia' && plate.status !== 'Sisa Potongan / Remnant') {
      throw new Error('PERINGATAN STOK TERKUNCI (STOCK LOCK): Plat ini sudah diambil atau dipesan oleh order lain!')
    }

    plate.status = 'Diambil'
    plate.order_id_pemakai = order.no_order

    let remnantPlate: Plate | null = null
    const sisaP = Number(data.sisa_p) || 0
    const sisaL = Number(data.sisa_l) || 0

    if (data.is_partial && sisaP > 0 && sisaL > 0) {
      const nextRemId = plates.value.length > 0 ? Math.max(...plates.value.map(p => p.id)) + 1 : 1
      const noRem = `PLT-REM-${new Date().getFullYear()}-${String(nextRemId).padStart(3, '0')}`
      const remWeight = calculateWeight(sisaP, sisaL, plate.tebal_mm, plate.material_type)

      remnantPlate = {
        id: nextRemId,
        no_plat: noRem,
        heat_number: plate.heat_number,
        grade: plate.grade,
        material_type: plate.material_type,
        panjang_mm: sisaP,
        lebar_mm: sisaL,
        tebal_mm: plate.tebal_mm,
        berat_kg: remWeight,
        no_sertifikat_class: plate.no_sertifikat_class,
        lokasi_yard: 'Area CNC - Rak Remnant',
        status: 'Sisa Potongan / Remnant',
        is_remnant: true,
        parent_plate_id: plate.id,
        created_at: new Date().toISOString()
      }
      plates.value.push(remnantPlate)
    }

    order.status = 'Plat Telah Diambil Yard'
    order.plate_id = plate.id
    order.plat_dipakai = `${plate.no_plat} (Heat: ${plate.heat_number})`

    const nextYpId = yardPickups.value.length > 0 ? Math.max(...yardPickups.value.map(y => y.id)) + 1 : 1
    const newYp: YardPickup = {
      id: nextYpId,
      order_id: order.id,
      plate_id: plate.id,
      remnant_plate_id: remnantPlate?.id || null,
      pengambil: data.pengambil,
      petugas_yard: data.petugas_yard,
      is_partial: data.is_partial && remnantPlate !== null,
      sisa_p: data.is_partial ? sisaP : null,
      sisa_l: data.is_partial ? sisaL : null,
      picked_up_at: new Date().toISOString()
    }
    yardPickups.value.unshift(newYp)

    saveToLocalStorage()

    if (isConfigured && supabase) {
      try {
        await supabase.from('plates').update({ status: 'Diambil', order_id_pemakai: order.no_order }).eq('id', plate.id)
        if (remnantPlate) {
          await supabase.from('plates').insert([remnantPlate])
        }
        await supabase.from('orders').update({
          status: 'Plat Telah Diambil Yard',
          plate_id: plate.id,
          plat_dipakai: order.plat_dipakai
        }).eq('id', order.id)
        await supabase.from('yard_pickups').insert([newYp])
      } catch (e) {
        console.warn('Supabase yard pickup error:', e)
      }
    }

    return { order, plate, remnant: remnantPlate }
  }

  // OPERATOR CNC ACTIONS
  async function operatorAccept(orderId: number) {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return
    order.status = 'Diterima Operator'
    saveToLocalStorage()
    if (isConfigured && supabase) {
      await supabase.from('orders').update({ status: order.status }).eq('id', orderId)
    }
  }

  async function operatorStart(orderId: number) {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return
    order.status = 'Sedang Dipotong'
    order.waktu_mulai = new Date().toISOString()
    saveToLocalStorage()
    if (isConfigured && supabase) {
      await supabase.from('orders').update({ status: order.status, waktu_mulai: order.waktu_mulai }).eq('id', orderId)
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
      await supabase.from('orders').update({
        status: order.status,
        kode_pengambilan: order.kode_pengambilan,
        waktu_selesai: order.waktu_selesai
      }).eq('id', orderId)
    }
    return randomPin
  }

  // PIN VERIFICATION
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
      try {
        await supabase.from('orders').update({
          status: 'Sudah Diambil',
          waktu_diambil: order.waktu_diambil,
          pengambil_akhir: order.pengambil_akhir,
          departemen_pengambil: order.departemen_pengambil
        }).eq('id', orderId)

        if (order.plate_id) {
          await supabase.from('plates').update({ status: 'Sudah Dipotong' }).eq('id', order.plate_id)
        }
      } catch (e) {
        console.warn('Supabase verify pin error:', e)
      }
    }

    return true
  }

  // ADMIN ACTIONS
  async function createUser(data: { name: string; username: string; email: string; role: 'admin' | 'mandor' | 'user'; department?: string; password: string }) {
    const newUser: UserProfile = {
      id: String(Date.now()),
      name: data.name.trim(),
      username: data.username.trim().toLowerCase(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      department: data.department?.trim() || '',
      password_hash: data.password || '123'
    }
    users.value.push(newUser)
    saveToLocalStorage()
    if (isConfigured && supabase) {
      try {
        await supabase.from('profiles').insert([newUser])
      } catch (e) {
        console.warn('Supabase create user error:', e)
      }
    }
  }

  async function updateUserRole(userId: string, newRole: 'admin' | 'mandor' | 'user') {
    const u = users.value.find(user => user.id === userId)
    if (!u) return
    u.role = newRole
    saveToLocalStorage()
    if (isConfigured && supabase) {
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    }
  }

  async function deleteUser(userId: string) {
    users.value = users.value.filter(u => u.id !== userId)
    saveToLocalStorage()
    if (isConfigured && supabase) {
      await supabase.from('profiles').delete().eq('id', userId)
    }
  }

  async function resetDataToZero() {
    orders.value = []
    plates.value = []
    estimations.value = []
    yardPickups.value = []
    saveToLocalStorage()
    if (isConfigured && supabase) {
      try {
        await supabase.from('yard_pickups').delete().neq('id', 0)
        await supabase.from('order_estimations').delete().neq('id', 0)
        await supabase.from('orders').delete().neq('id', 0)
        await supabase.from('plates').delete().neq('id', 0)
      } catch (e) {
        console.warn('Supabase reset data error:', e)
      }
    }
  }

  // EXPORT CSV
  function exportHistoryCsv(): boolean {
    const completed = orders.value.filter(o => o.status === 'Sudah Diambil')
    if (completed.length === 0) return false

    let csv = '\uFEFFNo. Order,Pemesan,Departemen,Proyek,Kapal/Hull,Material,Tebal,Grade,Jumlah,Target CNC,Pengambil,PIN,Waktu Diambil\n'
    completed.forEach(o => {
      csv += `"${o.no_order}","${o.nama_pemesan}","${o.departemen_pemesan}","${o.nama_proyek}","${o.nama_proyek_kapal || '-'}","${o.material}","${o.ketebalan}","${o.estimation?.grade || '-'}","${o.jumlah_pesanan} ${o.satuan}","${o.target_cnc}","${o.pengambil_akhir || o.nama_pemesan}","${o.kode_pengambilan || '-'}","${o.waktu_diambil ? new Date(o.waktu_diambil).toLocaleString('id-ID') : '-'}"\n`
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
    initStore,
    syncFromSupabase,
    login,
    logout,
    createOrder,
    saveEstimation,
    approveEstimation,
    addPlate,
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

