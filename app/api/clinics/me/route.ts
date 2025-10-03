import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

// GET /api/clinics/me  -> returns clinic + metrics for logged-in clinic owner
export async function GET(request: NextRequest) {
  try {
    const user = await AuthMiddleware.authenticate(request);
    if (user?.userType !== 'clinic-owner') {
      return ResponseUtils.forbidden('Only clinic owners can access clinic dashboard');
    }

    // Find clinic by owner email (normalized)
    const clinic = await database.findOne('clinics', { 'owner.email': (user.email || '').toLowerCase() });
    if (!clinic) return ResponseUtils.notFound('Clinic not found for owner');

    // Gather therapists linked to clinic
    const therapists = await database.find('therapists', { clinicId: clinic._id });
    const therapistUserIds = therapists.map((t: any) => t.userId).filter(Boolean);

    // Time window for current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Bookings where therapistId in therapist user IDs
    let monthlyBookingsCount = 0; let monthlyRevenue = 0; let recentBookings: any[] = [];
    if (therapistUserIds.length) {
      const bookingsCursor = await database.find('bookings', {
        therapistId: { $in: therapistUserIds },
        date: { $gte: monthStart, $lt: monthEnd }
      });
      monthlyBookingsCount = bookingsCursor.length;
      // Revenue fields may differ (amount or totalAmount)
      monthlyRevenue = bookingsCursor.reduce((sum: number, b: any) => sum + (b.amount || b.totalAmount || 0), 0);
      // Recent bookings (latest 5 overall for those therapists) by createdAt/ date
      recentBookings = bookingsCursor
        .sort((a: any, b: any) => (b.createdAt || b.date || 0) - (a.createdAt || a.date || 0))
        .slice(0, 5)
        .map((b: any) => ({
          id: b._id,
          patient: b.userId?.toString?.() || 'User',
            therapist: b.therapistId?.toString?.() || 'Therapist',
          date: b.date ? new Date(b.date).toISOString().slice(0,10) : '',
          time: b.timeSlot || '',
          type: b.sessionType || '',
          status: b.status || ''
        }));
    }

    const notifications = [
      ...(recentBookings.slice(0,2).map(r => ({ id: 'bk-' + r.id, type: 'booking', message: `Booking ${r.id} (${r.type})`, time: r.date, read: false }))),
      { id: 'sys-1', type: 'system', message: 'Clinic dashboard loaded', time: new Date().toISOString(), read: true }
    ];

    const metrics = {
      monthlyBookings: monthlyBookingsCount,
      revenue: monthlyRevenue,
      therapists: therapists.length,
      rating: clinic.rating || clinic.avgRating || 0,
      totalReviews: clinic.totalReviews || clinic.reviewCount || 0,
      completionScore: clinic.completionScore || 0,
      pendingPayments: 0 // placeholder; could compute from payouts/invoices collection
    };

    return ResponseUtils.success({ clinic, therapists, metrics, recentBookings, notifications });
  } catch (e: any) {
    console.error('clinic me error', e);
    return ResponseUtils.error('Failed to load clinic dashboard', 500, e?.message || 'error');
  }
}
