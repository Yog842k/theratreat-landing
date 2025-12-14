// Minimal Shiprocket SDK wrapper: auth, order, shipment, tracking
// Uses environment variables: SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD
// and optional: SHIPROCKET_BASE (default https://apiv2.shiprocket.in)

type ShiprocketAuth = { token: string; expires_in?: number };

const BASE = process.env.SHIPROCKET_BASE || 'https://apiv2.shiprocket.in';

async function srFetch(path: string, options: RequestInit = {}, token?: string) {
  const url = `${BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  } as Record<string, string>;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Shiprocket API ${path} failed: ${res.status} ${body}`);
  }
  return res.json();
}

export async function srLogin(): Promise<ShiprocketAuth> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) throw new Error('Missing SHIPROCKET_EMAIL/PASSWORD');
  return srFetch('/v1/external/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function createOrder(token: string, payload: any) {
  // Payload must conform to Shiprocket order schema
  return srFetch('/v1/external/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export async function generateAWB(token: string, shipmentId: number) {
  return srFetch('/v1/external/courier/assign/awb', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: shipmentId }),
  }, token);
}

export async function trackByAwb(token: string, awb: string) {
  return srFetch(`/v1/external/courier/track/awb/${encodeURIComponent(awb)}`, {}, token);
}

export async function trackByOrder(token: string, orderId: string) {
  return srFetch(`/v1/external/courier/track?order_id=${encodeURIComponent(orderId)}`, {}, token);
}
