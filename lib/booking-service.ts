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
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = (data as any)?.code;
    const message = (data as any)?.message || `Request failed (${res.status})`;
    if (res.status === 401) {
      throw new Error(code ? `[${code}] ${message}` : `Unauthorized: ${message}`);
    }
    if (res.status === 403) {
      throw new Error(code ? `[${code}] ${message}` : `Forbidden: ${message}`);
    }
    throw new Error(code ? `[${code}] ${message}` : message);
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
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data)
    });
    return handleJson<{ booking: Booking }>(res).then(r => r.booking);
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
        const json = await res.json();
        if (json?.success && json?.data?.availability) {
          console.log('[booking-service] ✅ Got availability from API:', {
            therapistId,
            date,
            slots: json.data.availability.length,
            available: json.data.availability.filter((a: any) => a.available).length
          });
          return { availability: json.data.availability, source: 'api' };
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
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
