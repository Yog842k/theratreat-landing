import { headers } from 'next/headers'

const BASE_URL = 'https://apiv2.shiprocket.in'

type AuthResponse = { token: string }

type Address = {
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country?: string
}

type Item = {
  name: string
  sku: string
  units: number
  selling_price: number
  discount?: number | string
  tax?: number | string
  hsn?: number | string
}

type CreateOrderPayload = {
  order_id: string
  order_date?: string
  pickup_location: string
  channel_id?: string
  comment?: string
  billing_customer_name: string
  billing_last_name?: string
  billing_address: string
  billing_address_2?: string
  billing_city: string
  billing_state: string
  billing_country: string
  billing_pincode: string
  billing_phone: string
  billing_email?: string
  shipping_is_billing?: boolean
  shipping_address?: string
  shipping_address_2?: string
  shipping_city?: string
  shipping_country?: string
  shipping_state?: string
  shipping_pincode?: string
  shipping_customer_name?: string
  shipping_last_name?: string
  shipping_phone?: string
  shipping_email?: string
  order_items: Item[]
  payment_method: 'Prepaid' | 'COD'
  sub_total: number
  shipping_charges?: number
  giftwrap_charges?: number
  transaction_charges?: number
  total_discount?: number
  length?: number
  breadth?: number
  height?: number
  weight?: number
}

type TokenCache = { token: string; expiresAt: number }

let cachedToken: TokenCache | null = null

async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/v1/external/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Shiprocket login failed: ${res.status} ${text}`)
  }
  const data = (await res.json()) as AuthResponse
  if (!data?.token) throw new Error('Shiprocket login failed: token missing')
  cachedToken = { token: data.token, expiresAt: Date.now() + 20 * 60 * 1000 }
  return data.token
}

async function getToken(email: string, password: string) {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token
  return login(email, password)
}

export async function loginCheck(params: { email: string; password: string }) {
  // Returns token length only to avoid leaking secrets.
  const token = await login(params.email, params.password)
  return { ok: true, tokenLength: token.length }
}

export async function createShiprocketOrder(params: {
  email: string
  password: string
  payload: CreateOrderPayload
}) {
  const token = await getToken(params.email, params.password)
  const res = await fetch(`${BASE_URL}/v1/external/orders/create/adhoc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params.payload),
    cache: 'no-store',
  })
  const text = await res.text()
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Shiprocket order response not JSON: ${text}`)
  }
  if (!res.ok || data.status === 'error') {
    const message = data.message || data.error || text
    const detail = typeof message === 'string' ? message : JSON.stringify(message)
    const err: any = new Error(`Shiprocket upstream ${res.status}: ${detail}`)
    err.upstream = data
    throw err
  }
  return data
}

export async function generateShiprocketAwb(params: {
  email: string
  password: string
  shipmentId: number | string
  courierId?: number | string
}) {
  const token = await getToken(params.email, params.password)
  const body: any = { shipment_id: [params.shipmentId] }
  if (params.courierId !== undefined && params.courierId !== null && `${params.courierId}`.trim() !== '') {
    body.courier_id = params.courierId
  }

  const res = await fetch(`${BASE_URL}/v1/external/courier/assign/awb`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const text = await res.text()
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Shiprocket AWB response not JSON: ${text}`)
  }

  if (!res.ok || data.status === 'error') {
    const message = data.message || data.error || text
    const detail = typeof message === 'string' ? message : JSON.stringify(message)
    const err: any = new Error(`Shiprocket upstream ${res.status}: ${detail}`)
    err.upstream = data
    throw err
  }

  return data
}

export type { CreateOrderPayload, Item, Address }
