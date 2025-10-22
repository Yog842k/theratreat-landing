import { sendBookingReminder, type BookingNotificationPayload } from '@/lib/notifications';

// Thin wrapper for a T-10 minutes reminder using existing reminder template
// You can customize subject/body later if needed.
export async function sendTenMinuteReminder(payload: BookingNotificationPayload) {
  // Reuse sendBookingReminder for now; in future, differentiate content
  return sendBookingReminder(payload);
}

export default sendTenMinuteReminder;
