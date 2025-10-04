// Unified Notification Utility (Twilio + SendGrid)
// Replaces previous AWS SNS/SES logic.
// Capabilities:
//  - Email (SendGrid)
//  - SMS (Twilio Programmable SMS)
//  - WhatsApp (Twilio Sandbox / Approved WhatsApp Sender)

import hmsConfig from './hms-config';

let twilioClient: any = null;
function getTwilio() {
  if (twilioClient) return twilioClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const twilioLib = require('twilio');
  twilioClient = twilioLib(sid, token, { lazyLoading: true });
  return twilioClient;
}

function getMeetingUrl(roomCode?: string) {
  if (!roomCode) return null;
  const via = hmsConfig.getRoomUrl(roomCode);
  return via || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/video-call/room?roomCode=${roomCode}`;
}

export interface BookingNotificationPayload {
  bookingId: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string; // E.164 number for direct SMS (e.g. +15551234567)
  therapistName?: string;
  sessionType?: string;
  date?: string; // ISO string
  timeSlot?: string;
  roomCode?: string;
  meetingUrl?: string | null;
}

export interface NotificationResult {
  smsSent?: boolean;
  whatsappSent?: boolean;
  emailSent?: boolean;
  emailMessageId?: string;
  smsSid?: string;
  whatsappSid?: string;
  errors?: string[];
}

export async function sendBookingConfirmation(payload: BookingNotificationPayload): Promise<NotificationResult> {
  const errors: string[] = [];
  const meetingUrl = payload.meetingUrl || getMeetingUrl(payload.roomCode || '');
  const smsAllowed = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_SMS_FROM);
  const whatsappAllowed = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM);
  const emailAllowed = !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL && payload.userEmail);
  const debug = process.env.NOTIFICATIONS_DEBUG === '1';

  const subject = `Booking Confirmed · ${payload.bookingId}`;
  const textBody = [
    `Hi ${payload.userName || 'there'},`,
    '',
    'Your session is confirmed:',
    `Therapist: ${payload.therapistName || 'Assigned Therapist'}`,
    `Type: ${payload.sessionType || 'video'}`,
    `Date: ${payload.date ? new Date(payload.date).toLocaleString() : 'TBA'}`,
    `Time: ${payload.timeSlot || 'TBA'}`,
    meetingUrl ? `Join: ${meetingUrl}` : 'Join link will follow.',
    '',
    'Please join 5 minutes early.',
    '— TheraTreat'
  ].join('\n');

  const htmlBody = `<!doctype html><html><body style="font-family:system-ui,Arial,sans-serif;line-height:1.5;color:#111">\n<h2 style="margin:0 0 16px">Booking Confirmed</h2>\n<p>Hi ${payload.userName || 'there'},</p>\n<p>Your session is confirmed. Details:</p>\n<ul>\n<li><strong>Therapist:</strong> ${payload.therapistName || 'Assigned Therapist'}</li>\n<li><strong>Type:</strong> ${payload.sessionType || 'video'}</li>\n<li><strong>Date:</strong> ${payload.date ? new Date(payload.date).toLocaleString() : 'TBA'}</li>\n<li><strong>Time:</strong> ${payload.timeSlot || 'TBA'}</li>\n</ul>\n${meetingUrl ? `<p><a href="${meetingUrl}" style="background:#2563eb;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;font-weight:600">Join Session</a></p><p style=\"font-size:14px;color:#555\">Or copy: <a href='${meetingUrl}'>${meetingUrl}</a></p>` : '<p><em>Join link will follow.</em></p>'}\n<p>Please join 5 minutes early to test audio/video.</p>\n<p>Thank you,<br/>TheraTreat Team</p>\n<hr style="margin:32px 0;border:none;border-top:1px solid #eee"/>\n<p style="font-size:12px;color:#777">Automated notification. Do not reply.</p>\n</body></html>`;

  let emailSent = false; let emailMessageId: string | undefined;
  if (emailAllowed) {
    try {
      // Lazy load sendgrid
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sgMail = require('@sendgrid/mail');
      if (!sgMail.setApiKey) throw new Error('SendGrid module invalid');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const res = await sgMail.send({
        to: payload.userEmail!,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject,
        text: textBody,
        html: htmlBody
      });
      emailSent = true;
      emailMessageId = res?.[0]?.headers?.['x-message-id'] || res?.[0]?.body?.message_id;
      if (debug) console.log('[notifications] email sent', { emailMessageId });
    } catch (e: any) {
      // Extract richer SendGrid error context (status + individual errors)
      let detail = e?.message || 'failed';
      const status = e?.code || e?.response?.statusCode;
      const sgErrors = e?.response?.body?.errors;
      if (Array.isArray(sgErrors) && sgErrors.length) {
        // Take first few error messages for brevity
        const msgs = sgErrors.slice(0, 3).map((er: any) => er.message || er.field || JSON.stringify(er));
        detail += ` | ${msgs.join('; ')}`;
      }
      if (status) detail = `${detail} (status ${status})`;
      /* Common 403 Causes:
         - Unverified FROM email or domain
         - Free plan single sender not validated
         - API key missing "Mail Send" permission scope
         - Using wrong data center / restricted IP
         - Account temporarily disabled
      */
      errors.push('EMAIL:' + detail);
      console.error('[notifications] email error', { detail, raw: e });
    }
  }

  const sanitizedPhone = payload.userPhone && /^\+?[1-9]\d{7,15}$/.test(payload.userPhone) ? payload.userPhone : undefined;
  let smsSent = false; let smsSid: string | undefined;
  if (smsAllowed && sanitizedPhone) {
    try {
      const client = getTwilio();
      if (!client) throw new Error('Twilio client not initialized');
      const body = `Booking ${payload.bookingId} confirmed. ${meetingUrl ? 'Join: ' + meetingUrl : ''}`.trim();
      const msg = await client.messages.create({
        from: process.env.TWILIO_SMS_FROM,
        to: sanitizedPhone,
        body
      });
      smsSent = true; smsSid = msg.sid;
      if (debug) console.log('[notifications] sms sent', { smsSid });
    } catch (e: any) {
      errors.push('SMS:' + (e?.message || 'failed'));
      console.error('[notifications] sms error', e);
    }
  }

  let whatsappSent = false; let whatsappSid: string | undefined;
  if (whatsappAllowed && sanitizedPhone) {
    try {
      const client = getTwilio();
      if (!client) throw new Error('Twilio client not initialized');
      const body = `Booking ${payload.bookingId} confirmed. ${meetingUrl ? 'Join: ' + meetingUrl : ''}`.trim();
      const msg = await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${sanitizedPhone}`,
        body
      });
      whatsappSent = true; whatsappSid = msg.sid;
      if (debug) console.log('[notifications] whatsapp sent', { whatsappSid });
    } catch (e: any) {
      errors.push('WHATSAPP:' + (e?.message || 'failed'));
      console.error('[notifications] whatsapp error', e);
    }
  }

  return { emailSent, emailMessageId, smsSent, whatsappSent, smsSid, whatsappSid, errors: errors.length ? errors : undefined };
}

export function notificationsEnabled() {
  return !!(
    (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && (process.env.TWILIO_SMS_FROM || process.env.TWILIO_WHATSAPP_FROM)) ||
    (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL)
  );
}

// Basic welcome notification (email + optional SMS) after account creation
export async function sendAccountWelcome({
  email,
  name,
  phone,
  userType
}: { email?: string; name?: string; phone?: string; userType?: string; }): Promise<NotificationResult | null> {
  const enabled = notificationsEnabled();
  if (!enabled) return null;
  const errors: string[] = [];
  let emailSent = false; let emailMessageId: string | undefined;
  let smsSent = false; let smsSid: string | undefined;
  const debug = process.env.NOTIFICATIONS_DEBUG === '1';

  const subject = 'Welcome to TheraTreat';
  const safeName = name || 'there';
  const role = userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : 'User';
  const textBody = [
    `Hi ${safeName},`,
    '',
    `Your ${role} account has been created successfully on TheraTreat.`,
    'You can now log in, update your profile and begin using the platform.',
    '',
    'If you did not create this account please contact support immediately.',
    '',
    '— TheraTreat Team'
  ].join('\n');
  const htmlBody = `<!doctype html><html><body style="font-family:system-ui,Arial,sans-serif;line-height:1.5;color:#111">\n<h2 style="margin:0 0 16px">Welcome to TheraTreat</h2>\n<p>Hi ${safeName},</p>\n<p>Your <strong>${role}</strong> account has been created successfully.</p>\n<p>You can now log in, complete onboarding (if pending) and start exploring the platform.</p>\n<p style="margin-top:24px;font-size:14px;color:#555">If you did not initiate this action, please contact support.</p>\n<p>Thank you,<br/>TheraTreat Team</p>\n<hr style="margin:32px 0;border:none;border-top:1px solid #eee"/>\n<p style="font-size:12px;color:#777">Automated email. Do not reply.</p>\n</body></html>`;

  if (email && process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const res = await sgMail.send({ to: email, from: process.env.SENDGRID_FROM_EMAIL, subject, text: textBody, html: htmlBody });
      emailSent = true;
      emailMessageId = res?.[0]?.headers?.['x-message-id'] || res?.[0]?.body?.message_id;
      if (debug) console.log('[notifications] welcome email sent', { emailMessageId });
    } catch (e: any) {
      let detail = e?.message || 'failed';
      const status = e?.code || e?.response?.statusCode;
      const sgErrors = e?.response?.body?.errors;
      if (Array.isArray(sgErrors) && sgErrors.length) {
        const msgs = sgErrors.slice(0, 2).map((er: any) => er.message || er.field || JSON.stringify(er));
        detail += ` | ${msgs.join('; ')}`;
      }
      if (status) detail = `${detail} (status ${status})`;
      errors.push('EMAIL:' + detail);
      console.error('[notifications] welcome email error', detail);
    }
  }

  const sanitizedPhone = phone && /^\+?[1-9]\d{7,15}$/.test(phone) ? phone : undefined;
  if (sanitizedPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_SMS_FROM) {
    try {
      const client = getTwilio();
      if (client) {
        const body = `Hi ${safeName}, your TheraTreat account is ready. — TheraTreat`;
        const msg = await client.messages.create({ from: process.env.TWILIO_SMS_FROM, to: sanitizedPhone, body });
        smsSent = true; smsSid = msg.sid;
        if (debug) console.log('[notifications] welcome sms sent', { smsSid });
      }
    } catch (e: any) {
      errors.push('SMS:' + (e?.message || 'failed'));
      console.error('[notifications] welcome sms error', e);
    }
  }

  return { emailSent, emailMessageId, smsSent, smsSid, errors: errors.length ? errors : undefined };
}
