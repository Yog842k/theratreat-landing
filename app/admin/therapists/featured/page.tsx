"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Shield, Star } from 'lucide-react'

interface TherapistRow {
  _id: string
  displayName: string
  title?: string
  rating?: number
  reviewCount?: number
  isVerified?: boolean
  featured?: boolean
  featuredOrder?: number
  consultationFee?: number
  specializations?: string[]
  image?: string
}

export default function FeaturedTherapistsAdminPage() {
  const [rows, setRows] = useState<TherapistRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/therapists/featured', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load therapists')
      const json = await res.json()
      const list: TherapistRow[] = json?.therapists || []
      list.sort((a, b) => Number(b.featured) - Number(a.featured) || (a.featuredOrder || 0) - (b.featuredOrder || 0) || (b.rating || 0) - (a.rating || 0))
      setRows(list)
    } catch (e: any) {
      setError(e?.message || 'Failed to load therapists')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const toggle = (id: string) => {
    setRows((prev) => prev.map((r) => (r._id === id ? { ...r, featured: !r.featured } : r)))
  }

  const save = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      const featuredIds = rows.filter((r) => r.featured).map((r) => r._id)
      const order = featuredIds
      const res = await fetch('/api/admin/therapists/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featuredIds, order }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json?.error) throw new Error(json?.error || 'Save failed')
      setSuccess('Featured list updated')
    } catch (e: any) {
      setError(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const featuredCount = rows.filter((r) => r.featured).length

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Featured Therapists</h1>
          <p className="text-sm text-muted-foreground">Select which therapists appear on the homepage hero.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-3">{error}</div>}
      {success && <div className="text-sm text-green-600 bg-green-50 border border-green-100 rounded p-3">{success}</div>}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading therapists...</div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Therapists ({rows.length})</CardTitle>
            <Badge variant="secondary">Featured: {featuredCount}</Badge>
          </CardHeader>
          <CardContent className="divide-y">
            {rows.map((t) => (
              <div key={t._id} className="flex items-center gap-4 py-3">
                <Checkbox checked={!!t.featured} onCheckedChange={() => toggle(t._id)} />
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.image || 'https://via.placeholder.com/80x80?text=T'} alt={t.displayName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{t.displayName}</p>
                    {t.isVerified && <Badge className="bg-blue-600 text-white" variant="secondary"><Shield className="w-3 h-3 mr-1" /> Verified</Badge>}
                    {t.featured && <Badge variant="outline">Featured</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-400" /> {typeof t.rating === 'number' ? t.rating.toFixed(1) : '—'} ({t.reviewCount || 0})</span>
                    {t.consultationFee ? <span>₹{t.consultationFee.toLocaleString()}</span> : null}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(t.specializations || []).slice(0, 3).map((s) => (
                      <Badge key={s} variant="outline" className="text-[11px]">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
