// Lightweight client-side booking service wrapper
// Uses fetch against existing Next.js API routes (/api/bookings, /api/bookings/[id])

export interface BookingData {
  therapistId: string;
  appointmentDate: string; // ISO date (YYYY-MM-DD)
  appointmentTime: string; // HH:MM 24h or label
  sessionType: string;
  notes?: string;
}

export interface Booking extends BookingData {
  _id: string;
  userId: string;
  status: string;
  totalAmount?: number;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
  meetingUrl?: string | null;
  roomCode?: string | null;
  meetingLink?: string | null; // Alternative field name
}

export interface AvailabilitySlot {
  time: string; // HH:MM
  available: boolean;
  capacity?: number;
}

interface AvailabilityResponse {
  availability: AvailabilitySlot[];
  source: 'api' | 'mock' | 'fallback';
}

function authHeaders(token?: string) {
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (token) {
    // Ensure token doesn't already have "Bearer " prefix
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    headers['Authorization'] = `Bearer ${cleanToken}`;
    
    // Log for debugging (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('[booking-service] 📤 Auth header prepared', {
        hasToken: !!cleanToken,
        tokenLength: cleanToken.length,
        tokenPrefix: cleanToken.substring(0, 20) + '...',
        headerFormat: 'Bearer ' + cleanToken.substring(0, 20) + '...'
      });
    }
  } else {
    console.warn('[booking-service] ⚠️ No token provided for auth headers');
  }
  return headers;
}

async function handleJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = (data as any)?.code;
    const message = (data as any)?.message || `Request failed (${res.status})`;
    const error = (data as any)?.error;
    
    // Enhanced logging for authentication errors
    if (res.status === 401) {
      console.error('[booking-service] ❌ 401 Unauthorized', {
        status: res.status,
        statusText: res.statusText,
        code,
        message,
        error,
        url: res.url,
        hasAuthHeader: res.headers.get('authorization') ? 'yes' : 'no'
      });
      throw new Error(code ? `[${code}] ${message}` : `Unauthorized: ${message || error || 'Authentication failed'}`);
    }
    if (res.status === 403) {
      console.error('[booking-service] ❌ 403 Forbidden', {
        status: res.status,
        code,
        message,
        error
      });
      throw new Error(code ? `[${code}] ${message}` : `Forbidden: ${message || error || 'Access denied'}`);
    }
    
    console.error('[booking-service] ❌ Request failed', {
      status: res.status,
      statusText: res.statusText,
      code,
      message,
      error
    });
    throw new Error(code ? `[${code}] ${message}` : message || error || `Request failed (${res.status})`);
  }
  return data.data ?? data; // our api nests payload under data
}

export const bookingService = {
  async listBookings(token?: string, params: { page?: number; limit?: number; status?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    const res = await fetch(`/api/bookings?${qs.toString()}`, { headers: authHeaders(token) });
    return handleJson<any>(res);
  },

  async getBooking(id: string, token?: string): Promise<Booking> {
    const res = await fetch(`/api/bookings/${id}`, { headers: authHeaders(token) });
    return handleJson<{ booking: Booking }>(res).then(r => r.booking);
  },

  async createBooking(data: BookingData, token?: string): Promise<Booking> {
    // Log request details (excluding token for security)
    console.log('[booking-service] 📤 Creating booking', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      therapistId: data.therapistId,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      sessionType: data.sessionType
    });
    
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data)
    });
    
    // Log response details
    console.log('[booking-service] 📥 Booking response', {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      hasToken: !!token
    });
    
    const result = await handleJson<{ booking: Booking; isDuplicate?: boolean }>(res);
    // If it's a duplicate but booking exists, return the existing booking
    if (result.isDuplicate && result.booking) {
      console.log('[booking-service] ℹ️ Duplicate booking detected, returning existing booking');
      return result.booking;
    }
    console.log('[booking-service] ✅ Booking created successfully', {
      bookingId: result.booking?._id
    });
    return result.booking;
  },

  async updateBooking(id: string, patch: Partial<Pick<Booking,'status'|'notes'>>, token?: string) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(patch)
    });
    return handleJson(res);
  },

  async markPaid(id: string, token?: string) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ paymentStatus: 'paid' })
    });
    return handleJson(res);
  },

  // Get therapist availability from API endpoint
  async getTherapistAvailability(therapistId: string, { date }: { date: string }): Promise<AvailabilityResponse> {
    try {
      const res = await fetch(`/api/therapists/${therapistId}/availability?date=${date}`);
      if (res.ok) {
        const text = await res.text();
        let json: any = null;
        try { json = text ? JSON.parse(text) : null; } catch { json = null; }
        if (json?.success && json?.data?.availability) {
          console.log('[booking-service] ✅ Got availability from API:', {
            therapistId,
            date,
            slots: json.data.availability.length,
            available: json.data.availability.filter((a: any) => a.available).length
          });
          return { availability: json.data.availability, source: 'api' };
        }
        if (!json) {
          console.warn('[booking-service] Availability API returned empty/invalid JSON, falling back');
        }
      } else {
        const errorDataText = await res.text();
        let errorData: any = {};
        try { errorData = errorDataText ? JSON.parse(errorDataText) : {}; } catch { errorData = {}; }
        console.warn('[booking-service] Availability API returned error:', res.status, errorData);
      }
    } catch (error: any) {
      console.error('[booking-service] Error fetching availability:', error);
    }

    // Fallback: Show all default slots as available (no random blocking!)
    // This ensures users can book even if API fails
    const defaultHours = [9,10,11,12,13,14,15,16,17,18];
    const availability: AvailabilitySlot[] = defaultHours.map(h => ({
      time: `${String(h).padStart(2,'0')}:00`,
      available: true // All slots available by default - only block if actually booked
    }));
    
    console.warn('[booking-service] ⚠️ Using fallback availability (all slots available)');
    return { availability, source: 'fallback' };
  }
};

export default bookingService;
