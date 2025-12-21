import { NextResponse } from 'next/server'

type ClientBody = {
  env?: 'test' | 'prod'
  payload: any
}

const DEFAULT_TEST_URL = 'https://staging-express.delhivery.com/api/cmu/create.json'
const DEFAULT_PROD_URL = 'https://track.delhivery.com/api/cmu/create.json'

export async function POST(req: Request) {
  try {
    let body: ClientBody
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const env: 'test' | 'prod' = body?.env === 'prod' ? 'prod' : 'test'
    const payload = body?.payload
    if (!payload) {
      return NextResponse.json({ error: 'Missing payload' }, { status: 400 })
    }

    const apiKey = process.env.DELHIVERY_API_KEY
    const testUrl = process.env.DELHIVERY_TEST_URL
      ? `${process.env.DELHIVERY_TEST_URL.replace(/\/$/, '')}/api/cmu/create.json`
      : DEFAULT_TEST_URL
    const prodUrl = process.env.DELHIVERY_BASE_URL
      ? `${process.env.DELHIVERY_BASE_URL.replace(/\/$/, '')}/api/cmu/create.json`
      : DEFAULT_PROD_URL

    if (!apiKey) {
      return NextResponse.json({ error: 'Server misconfigured: DELHIVERY_API_KEY missing' }, { status: 500 })
    }

    const url = env === 'prod' ? prodUrl : testUrl

    const formData = new URLSearchParams()
    formData.set('format', 'json')
    formData.set('data', JSON.stringify(payload))
    // Helper to perform one upstream request
    const proxyOnce = async (p: any) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      try {
        const fd = new URLSearchParams()
        fd.set('format', 'json')
        fd.set('data', JSON.stringify(p))
        const res = await fetch(url, {
          method: 'POST',
          headers: { Authorization: `Token ${apiKey}` },
          body: fd,
          signal: controller.signal,
        } as any)
        const text = await res.text()
        clearTimeout(timeoutId)
        return { res, text }
      } catch (e: any) {
        clearTimeout(timeoutId)
        return { error: e }
      }
    }

    // First attempt
    const first = await proxyOnce(payload)
    if ((first as any).error) {
      const e = (first as any).error
      return NextResponse.json(
        {
          error: 'Failed to reach Delhivery API',
          details: e?.name === 'AbortError' ? 'Connection Timed Out' : e?.message,
        },
        { status: 502 },
      )
    }

    let data: any
    try {
      data = JSON.parse((first as any).text)
    } catch {
      return NextResponse.json({ error: 'Delhivery returned non-JSON response', raw: (first as any).text }, { status: 502 })
    }

    const msg = typeof data?.message === 'string' ? data.message : JSON.stringify(data)
    const vendorEndDateIssue = /NoneType/.test(msg) && /end_date/.test(msg)
    if (!vendorEndDateIssue) {
      return NextResponse.json(data, { status: (first as any).res.status })
    }

    // Fallback path: try with env-configured fallback name or without pickup_location
    const fallbackName = process.env.DELHIVERY_FALLBACK_PICKUP_NAME
    let retryPayload: any
    if (fallbackName) {
      const current = payload?.pickup_location?.name
      if (current !== fallbackName) {
        retryPayload = {
          ...payload,
          pickup_location: { ...(payload?.pickup_location || {}), name: fallbackName },
        }
      }
    }
    if (!retryPayload) {
      // Attempt using account default by omitting pickup_location
      retryPayload = { ...payload }
      delete retryPayload.pickup_location
    }

    const second = await proxyOnce(retryPayload)
    if ((second as any).error) {
      // Return first failure with hint, plus retry error detail
      data.hint =
        'Detected unapproved pickup location. Retried with fallback (env or default) but upstream could not be reached.'
      return NextResponse.json(
        {
          ...data,
          retryError: (second as any).error?.message || 'Retry upstream error',
        },
        { status: (first as any).res.status },
      )
    }

    let retryData: any
    try {
      retryData = JSON.parse((second as any).text)
    } catch {
      return NextResponse.json(
        {
          error: 'Delhivery returned non-JSON response on retry',
          raw: (second as any).text,
          original: data,
        },
        { status: 502 },
      )
    }

    // If retry succeeds, return it; else return original with extra hint
    if ((second as any).res.ok) {
      retryData.fallbackApplied = fallbackName ? 'env-name' : 'omit-pickup_location'
      return NextResponse.json(retryData, { status: (second as any).res.status })
    } else {
      const retryMsg = typeof retryData?.message === 'string' ? retryData.message : JSON.stringify(retryData)
      return NextResponse.json(
        {
          ...data,
          hint:
            'Unapproved pickup location. Fallback attempt (env or omit pickup_location) also failed; please approve or use an approved warehouse.',
          retryDetails: retryMsg,
        },
        { status: (first as any).res.status },
      )
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Proxy Error' }, { status: 500 })
  }
}
