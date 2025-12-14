import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/authUtils'

type AnyRequest = Request | NextRequest

export type AuthUser = { userId: string; role?: string }

function extractAuthHeader(req: AnyRequest): string | null {
  try {
    // NextRequest/Request both expose headers via Headers
    const h = (req as any)?.headers
    if (!h) return null
    const auth = typeof h.get === 'function' ? h.get('authorization') : (h['authorization'] || h['Authorization'])
    return typeof auth === 'string' ? auth : null
  } catch {
    return null
  }
}

export function getUserFromRequest(req: AnyRequest): AuthUser | null {
  const authHeader = extractAuthHeader(req)
  if (!authHeader) return null
  const normalized = authHeader.trim()
  if (!normalized.toLowerCase().startsWith('bearer ')) return null
  const token = normalized.substring(7).trim()
  if (!token) return null
  try {
    const decoded: any = verifyToken(token)
    const userId = decoded?.id || decoded?._id || decoded?.userId || decoded?.sub
    if (!userId || typeof userId !== 'string') return null
    const role = typeof decoded?.role === 'string' ? decoded.role : undefined
    return { userId, role }
  } catch {
    return null
  }
}

export function requireUser(req: AnyRequest): AuthUser {
  const u = getUserFromRequest(req)
  if (!u) throw new Error('Unauthorized')
  return u
}
