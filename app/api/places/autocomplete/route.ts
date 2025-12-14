import { NextRequest, NextResponse } from 'next/server';

// POST /api/places/autocomplete
// Body: { input: string, componentRestrictions?: { country: string|string[] }, types?: string[] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = String(body?.input || '').trim();
    if (!input) {
      return NextResponse.json({ success: false, error: 'input is required', predictions: [] }, { status: 400 });
    }

    // Prefer secret server-side key if available; fallback to public env for dev
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Google Maps API key not configured' }, { status: 500 });
    }

    const country = body?.componentRestrictions?.country;
    const types: string[] | undefined = Array.isArray(body?.types) ? body.types : undefined;

    // Build request payload for Places API (New)
    // Docs: https://developers.google.com/maps/documentation/places/web-service/autocomplete
    const payload: any = {
      input,
      languageCode: 'en',
      regionCode: 'IN',
    };

    if (country) {
      const arr = Array.isArray(country) ? country : [country];
      payload.locationBias = {
        rectangle: {
          low: { latitude: -90, longitude: -180 },
          high: { latitude: 90, longitude: 180 },
        },
      };
      payload.sessionToken = undefined; // optional: add session token wiring later
      payload.includedRegionCodes = arr.map((c: string) => c.toUpperCase());
    }

    // If caller wants cities, restrict to locality/admin_area predictions
    if (types && types.includes('(cities)')) {
      payload.includedPrimaryTypes = ['locality', 'administrative_area_level_1'];
    }

    const url = 'https://places.googleapis.com/v1/places:autocomplete';
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // Limit returned fields to reduce payload
        'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
      },
      body: JSON.stringify(payload),
      // For serverless, node-fetch default is fine
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return NextResponse.json({ success: false, error: `Places API error ${resp.status}`, details: text }, { status: resp.status });
    }

    const json = await resp.json();
    const suggestions = Array.isArray(json?.suggestions) ? json.suggestions : [];

    const predictions = suggestions.map((s: any) => {
      const p = s?.placePrediction || {};
      const structured = p?.structuredFormat || {};
      const mainText = structured?.mainText?.text || p?.text?.text || '';
      const secondaryText = structured?.secondaryText?.text || '';
      return {
        description: p?.text?.text || mainText,
        place_id: p?.placeId,
        structured_formatting: {
          main_text: mainText,
          secondary_text: secondaryText,
        },
      } as any;
    });

    return NextResponse.json({ success: true, predictions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Autocomplete failed' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
