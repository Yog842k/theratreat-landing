## Patient Notifications (Email/SMS/WhatsApp)

This project sends two kinds of booking notifications to patients:

- Immediate receipt after booking creation (acknowledgement)
- 24-hour reminder before the session

Providers used:
- Email: SendGrid
- SMS and WhatsApp: Twilio

### 1) Environment Variables

Copy `.env.example` to `.env.local` and fill these for development. In production, set them in your hosting provider UI:

- SendGrid
  - SENDGRID_API_KEY
  - SENDGRID_FROM_EMAIL
- Twilio
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_SMS_FROM (E.164 capable number)
  - TWILIO_WHATSAPP_FROM (optional, your approved WhatsApp sender ID)
- App / misc
  - NEXT_PUBLIC_BASE_URL (e.g., https://your-domain.com)
  - CRON_SECRET (any strong random; used by reminders route)
  - NOTIFICATIONS_DEBUG=1 (optional verbose logging)

### 2) Immediate receipt on booking creation

When a booking is created in `app/api/bookings/route.js`, a background task calls `sendBookingReceipt()` from `lib/notifications.ts` to send:
- Email to the patient (if SENDGRID_* configured)
- SMS/WhatsApp to the patient's phone (if TWILIO_* configured and E.164 phone present)

This is fire-and-forget and does not block the API response.

### 3) 24-hour reminders via cron endpoint

The route `POST /api/cron/send-reminders` scans for bookings ~24h from now and sends a one-time reminder. It requires a header `x-cron-key: <CRON_SECRET>`.

Example request (PowerShell):

Invoke-RestMethod -Method POST -Uri "https://your-domain.com/api/cron/send-reminders" -Headers @{"x-cron-key"="<your-secret>"}

Schedule this every 5–10 minutes using your hosting platform:
- Vercel: Settings → Cron Jobs → add POST to `/api/cron/send-reminders`
- Amplify / Render / Fly.io: any scheduler that can hit an HTTPS endpoint
- Self-hosted: OS cron + curl/Invoke-WebRequest

The job marks `booking.reminder24hSent=true` to avoid duplicates.

### 4) Testing locally

1. Set env vars in `.env.local` and start the dev server.
2. Create a booking whose appointmentDate/appointmentTime is ~24h from now.
3. Call the reminders endpoint:

Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/cron/send-reminders" -Headers @{"x-cron-key"="<your-secret>"}

4. Check the response JSON for `sent` > 0 and confirm email/SMS delivery.

### 5) Troubleshooting

- SendGrid 403: Verify sender domain/email and API key permissions (Mail Send).
- Twilio SMS: Ensure `TWILIO_SMS_FROM` is a valid number for your account and the destination phone is E.164 format.
- WhatsApp: Requires an approved sender and template; sandbox works with opted-in numbers only.
- No reminders sent: Ensure `CRON_SECRET` header is correct and your booking falls within the 24h ±30m window.

### 6) Code references

- lib/notifications.ts: sendBookingReceipt(), sendBookingReminder(), sendBookingConfirmation()
- app/api/bookings/route.js: wires immediate receipt after insert
- app/api/cron/send-reminders/route.ts: secure cron endpoint for 24h reminders
- lib/db-init.js: indexes to speed reminder lookups
