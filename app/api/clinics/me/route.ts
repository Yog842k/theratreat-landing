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
    // Handle both ObjectId and string clinicId
    const clinicId = clinic._id instanceof ObjectId ? clinic._id : new ObjectId(clinic._id);
    const therapists = await database.findMany('therapists', { clinicId: clinicId });
    const therapistUserIds = therapists.map((t: any) => {
      // Handle both ObjectId and string userId
      if (t.userId) {
        return t.userId instanceof ObjectId ? t.userId : new ObjectId(t.userId);
      }
      return null;
    }).filter(Boolean);

    // Time window for current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Bookings where therapistId in therapist user IDs
    let monthlyBookingsCount = 0; let monthlyRevenue = 0; let recentBookings: any[] = [];
    if (therapistUserIds.length) {
      // Get all bookings for these therapists (both by date and appointmentDate fields)
      const allBookings = await database.findMany('bookings', {
        therapistId: { $in: therapistUserIds }
      });
      
      // Filter for current month bookings (check both date and appointmentDate fields)
      const monthlyBookings = allBookings.filter((b: any) => {
        const bookingDate = b.appointmentDate ? new Date(b.appointmentDate) : (b.date ? new Date(b.date) : null);
        if (!bookingDate) return false;
        return bookingDate >= monthStart && bookingDate < monthEnd;
      });
      
      monthlyBookingsCount = monthlyBookings.length;
      // Revenue fields may differ (amount or totalAmount)
      monthlyRevenue = monthlyBookings.reduce((sum: number, b: any) => sum + (b.amount || b.totalAmount || 0), 0);
      
      // Recent bookings (latest 5 overall for those therapists) by createdAt/ date
      recentBookings = allBookings
        .sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : (a.appointmentDate ? new Date(a.appointmentDate).getTime() : (a.date ? new Date(a.date).getTime() : 0));
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : (b.appointmentDate ? new Date(b.appointmentDate).getTime() : (b.date ? new Date(b.date).getTime() : 0));
          return dateB - dateA;
        })
        .slice(0, 5)
        .map((b: any) => {
          const bookingDate = b.appointmentDate || b.date;
          return {
            id: b._id?.toString() || '',
            patient: b.userId?.toString?.() || 'User',
            therapist: b.therapistId?.toString?.() || 'Therapist',
            date: bookingDate ? new Date(bookingDate).toISOString().slice(0,10) : '',
            time: b.appointmentTime || b.timeSlot || '',
            type: b.sessionType || '',
            status: b.status || ''
          };
        });
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
