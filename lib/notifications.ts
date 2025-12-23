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

/**
 * Wraps Twilio API calls with a timeout to prevent hanging on network issues
 */
async function twilioWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 8000,
  operation: string = 'Twilio operation'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
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
  therapistSpeciality?: string;
  clientName?: string;
  recipientType?: 'patient' | 'therapist';
  sessionType?: string;
  date?: string; // ISO string
  timeSlot?: string;
  roomCode?: string;
  meetingUrl?: string | null;
  shortLink?: string;
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
  const shortLink = payload.shortLink || meetingUrl || 'Link will follow';
  const smsAllowed = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_SMS_FROM);
  const whatsappAllowed = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM);
  const emailAllowed = !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL && payload.userEmail);
  const debug = process.env.NOTIFICATIONS_DEBUG === '1';

  const isVideoOrAudio = payload.sessionType === 'video' || payload.sessionType === 'audio';
  const recipientType = payload.recipientType || 'patient';
  const modeLabel = (() => {
    const key = String(payload.sessionType || '').toLowerCase();
    if (key === 'video' || key === 'audio') return 'Online';
    if (key === 'clinic') return 'Clinic';
    if (key === 'home') return 'Home Care';
    return 'Session';
  })();
  const dateText = payload.date ? new Date(payload.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBA';
  const timeText = payload.timeSlot || (payload.date ? new Date(payload.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'TBA');
  const therapistLine = payload.therapistSpeciality
    ? `${payload.therapistName || 'Therapist'} (${payload.therapistSpeciality})`
    : `${payload.therapistName || 'Therapist'}`;
  const subject = `Booking Confirmed · ${payload.bookingId}`;
  const textBody = [
    `Hi ${payload.userName || 'there'},`,
    '',
    'Your session is confirmed:',
    `Therapist: ${payload.therapistName || 'Assigned Therapist'}`,
    `Type: ${payload.sessionType || 'video'}`,
    `Date: ${payload.date ? new Date(payload.date).toLocaleString() : 'TBA'}`,
    `Time: ${payload.timeSlot || 'TBA'}`,
    '',
    ...(isVideoOrAudio && meetingUrl ? [
      '═══════════════════════════════════════',
      '🎥 JOIN YOUR VIDEO SESSION:',
      meetingUrl,
      '═══════════════════════════════════════',
      ''
    ] : meetingUrl ? [
      `Join: ${meetingUrl}`,
      ''
    ] : []),
    'Please join 5 minutes early.',
    '— TheraTreat'
  ].join('\n');

  const htmlBody = `<!doctype html><html><body style="font-family:system-ui,Arial,sans-serif;line-height:1.5;color:#111">\n<h2 style="margin:0 0 16px">Booking Confirmed</h2>\n<p>Hi ${payload.userName || 'there'},</p>\n<p>Your session is confirmed. Details:</p>\n<ul>\n<li><strong>Therapist:</strong> ${payload.therapistName || 'Assigned Therapist'}</li>\n<li><strong>Type:</strong> ${payload.sessionType || 'video'}</li>\n<li><strong>Date:</strong> ${payload.date ? new Date(payload.date).toLocaleString() : 'TBA'}</li>\n<li><strong>Time:</strong> ${payload.timeSlot || 'TBA'}</li>\n</ul>\n${isVideoOrAudio && meetingUrl ? `<div style="background:#f0f9ff;border:2px solid #2563eb;border-radius:8px;padding:20px;margin:24px 0;text-align:center"><h3 style="margin:0 0 12px;color:#1e40af">🎥 Join Your ${payload.sessionType === 'video' ? 'Video' : 'Audio'} Session</h3><p style="margin:0 0 16px"><a href="${meetingUrl}" style="background:#2563eb;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block">Join Session Now</a></p><p style="margin:12px 0 0;font-size:13px;color:#555;word-break:break-all">Or copy this link:<br/><a href="${meetingUrl}" style="color:#2563eb">${meetingUrl}</a></p></div>` : meetingUrl ? `<p><a href="${meetingUrl}" style="background:#2563eb;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;font-weight:600">Join Session</a></p><p style=\"font-size:14px;color:#555\">Or copy: <a href='${meetingUrl}'>${meetingUrl}</a></p>` : '<p><em>Join link will follow.</em></p>'}\n<p>Please join 5 minutes early to test audio/video.</p>\n<p>Thank you,<br/>TheraTreat Team</p>\n<hr style="margin:32px 0;border:none;border-top:1px solid #eee"/>\n<p style="font-size:12px;color:#777">Automated notification. Do not reply.</p>\n</body></html>`;

  let emailSent = false; let emailMessageId: string | undefined;
  if (emailAllowed) {
    try {
      // Lazy load sendgrid (guarded so builds don't fail if dependency missing)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      let sgMail: any;
      try {
        sgMail = require('@sendgrid/mail');
      } catch (err) {
        sgMail = null;
      }
      if (!sgMail || !sgMail.setApiKey) throw new Error('SendGrid not available');
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
      const body = recipientType === 'therapist'
        ? [
            'TheraBook: New booking confirmed',
            `Client: ${payload.clientName || 'Patient'}`,
            `Date & Time: ${dateText}, ${timeText}`,
            `Mode: ${modeLabel}`,
            `View details: ${shortLink}`,
            '',
            'Thank you for choosing TheraTreat'
          ].join('\n')
        : [
            'TheraBook: Your session is confirmed ✅',
            `Therapist: ${therapistLine}`,
            `Date & Time: ${dateText}, ${timeText}`,
            `Mode: ${modeLabel}`,
            `Manage booking: ${shortLink}`,
            '',
            'Thank you for choosing TheraTreat'
          ].join('\n');
      const msg = await twilioWithTimeout<{ sid: string }>(
        client.messages.create({
          from: process.env.TWILIO_SMS_FROM,
          to: sanitizedPhone,
          body
        }),
        8000,
        'SMS send'
      );
      smsSent = true; smsSid = msg.sid;
      if (debug) console.log('[notifications] sms sent', { smsSid });
    } catch (e: any) {
      const errorMsg = e?.message || 'failed';
      errors.push('SMS:' + errorMsg);
      if (debug) {
        console.error('[notifications] sms error', errorMsg);
      } else {
        console.warn('[notifications] sms failed:', errorMsg.includes('timeout') ? 'Connection timeout' : errorMsg);
      }
    }
  }

  let whatsappSent = false; let whatsappSid: string | undefined;
  if (whatsappAllowed && sanitizedPhone) {
    try {
      const client = getTwilio();
      if (!client) throw new Error('Twilio client not initialized');
      const body = recipientType === 'therapist'
        ? [
            'TheraBook: New booking confirmed',
            `Client: ${payload.clientName || 'Patient'}`,
            `Date & Time: ${dateText}, ${timeText}`,
            `Mode: ${modeLabel}`,
            `View details: ${shortLink}`,
            '',
            'Thank you for choosing TheraTreat'
          ].join('\n')
        : [
            'TheraBook: Your session is confirmed ✅',
            `Therapist: ${therapistLine}`,
            `Date & Time: ${dateText}, ${timeText}`,
            `Mode: ${modeLabel}`,
            `Manage booking: ${shortLink}`,
            '',
            'Thank you for choosing TheraTreat'
          ].join('\n');
      const msg = await twilioWithTimeout<{ sid: string }>(
        client.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
          to: `whatsapp:${sanitizedPhone}`,
          body
        }),
        8000,
        'WhatsApp send'
      );
      whatsappSent = true; whatsappSid = msg.sid;
      if (debug) console.log('[notifications] whatsapp sent', { whatsappSid });
    } catch (e: any) {
      const errorMsg = e?.message || 'failed';
      errors.push('WHATSAPP:' + errorMsg);
      if (debug) {
        console.error('[notifications] whatsapp error', errorMsg);
      } else {
        console.warn('[notifications] whatsapp failed:', errorMsg.includes('timeout') ? 'Connection timeout' : errorMsg);
      }
    }
  }

  return { emailSent, emailMessageId, smsSent, whatsappSent, smsSid, whatsappSid, errors: errors.length ? errors : undefined };
}

export function notificationsEnabled() {
  if (process.env.NOTIFICATIONS_DISABLE === '1') return false;
  return !!(
    (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && (process.env.TWILIO_SMS_FROM || process.env.TWILIO_WHATSAPP_FROM)) ||
    (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL)
  );
}

// Immediate notification on booking creation (before payment confirmation)
export async function sendBookingReceipt(payload: BookingNotificationPayload): Promise<NotificationResult> {
  const errors: string[] = [];
  const meetingUrl = payload.meetingUrl || getMeetingUrl(payload.roomCode || '');
  const smsAllowed = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_SMS_FROM && payload.userPhone);
  const whatsappAllowed = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM && payload.userPhone);
  const emailAllowed = !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL && payload.userEmail);
  const debug = process.env.NOTIFICATIONS_DEBUG === '1';

  const subject = `Booking Request Received · ${payload.bookingId}`;
  const textBody = [
    `Hi ${payload.userName || 'there'},`,
    '',
    'We have received your booking request. Here are the details:',
    `Therapist: ${payload.therapistName || 'Assigned Therapist'}`,
    `Type: ${payload.sessionType || 'video'}`,
    `Date: ${payload.date ? new Date(payload.date).toLocaleDateString() : 'TBA'}`,
    `Time: ${payload.timeSlot || 'TBA'}`,
    '',
    'Please complete payment to confirm your session. You will receive a confirmation once payment is verified.',
    meetingUrl ? `Join (if already provisioned): ${meetingUrl}` : '',
    '',
    '— TheraTreat'
  ].filter(Boolean).join('\n');

  const htmlBody = `<!doctype html><html><body style="font-family:system-ui,Arial,sans-serif;line-height:1.5;color:#111">\n<h2 style="margin:0 0 16px">Booking Request Received</h2>\n<p>Hi ${payload.userName || 'there'},</p>\n<p>We have received your booking request. Details:</p>\n<ul>\n<li><strong>Therapist:</strong> ${payload.therapistName || 'Assigned Therapist'}</li>\n<li><strong>Type:</strong> ${payload.sessionType || 'video'}</li>\n<li><strong>Date:</strong> ${payload.date ? new Date(payload.date).toLocaleDateString() : 'TBA'}</li>\n<li><strong>Time:</strong> ${payload.timeSlot || 'TBA'}</li>\n</ul>\n<p>Please complete payment to confirm your session. You will receive a confirmation once payment is verified.</p>\n${meetingUrl ? `<p style=\"font-size:14px;color:#555\"><em>A provisional join link may be available:</em> <a href='${meetingUrl}'>${meetingUrl}</a></p>` : ''}\n<p>Thank you,<br/>TheraTreat Team</p>\n<hr style="margin:32px 0;border:none;border-top:1px solid #eee"/>\n<p style="font-size:12px;color:#777">Automated notification. Do not reply.</p>\n</body></html>`;

  let emailSent = false; let emailMessageId: string | undefined;
  if (emailAllowed) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      let sgMail: any;
      try {
        sgMail = require('@sendgrid/mail');
      } catch (err) {
        sgMail = null;
      }
      if (!sgMail || !sgMail.setApiKey) throw new Error('SendGrid not available');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const res = await sgMail.send({ to: payload.userEmail!, from: process.env.SENDGRID_FROM_EMAIL, subject, text: textBody, html: htmlBody });
      emailSent = true; emailMessageId = res?.[0]?.headers?.['x-message-id'] || res?.[0]?.body?.message_id;
      if (debug) console.log('[notifications] receipt email sent', { emailMessageId });
    } catch (e: any) {
      let detail = e?.message || 'failed';
      const status = e?.code || e?.response?.statusCode;
      const sgErrors = e?.response?.body?.errors;
      if (Array.isArray(sgErrors) && sgErrors.length) {
        const msgs = sgErrors.slice(0, 3).map((er: any) => er.message || er.field || JSON.stringify(er));
        detail += ` | ${msgs.join('; ')}`;
      }
      if (status) detail = `${detail} (status ${status})`;
      errors.push('EMAIL:' + detail);
      console.error('[notifications] receipt email error', { detail, raw: e });
    }
  }

  const sanitizedPhone = payload.userPhone && /^\+?[1-9]\d{7,15}$/.test(payload.userPhone) ? payload.userPhone : undefined;
  let smsSent = false; let smsSid: string | undefined; let whatsappSent = false; let whatsappSid: string | undefined;
  if (smsAllowed && sanitizedPhone) {
    try {
      const client = getTwilio();
      if (!client) throw new Error('Twilio client not initialized');
      const body = `We received your booking request ${payload.bookingId}. Complete payment to confirm.`;
      const msg = await twilioWithTimeout<{ sid: string }>(
        client.messages.create({ from: process.env.TWILIO_SMS_FROM, to: sanitizedPhone, body }),
        8000,
        'SMS send'
      );
      smsSent = true; smsSid = msg.sid;
      if (debug) console.log('[notifications] receipt sms sent', { smsSid });
    } catch (e: any) {
      const errorMsg = e?.message || 'failed';
      errors.push('SMS:' + errorMsg);
      // Only log essential error info, not full stack trace
      if (debug) {
        console.error('[notifications] receipt sms error', errorMsg);
      } else {
        console.warn('[notifications] receipt sms failed:', errorMsg.includes('timeout') ? 'Connection timeout' : errorMsg);
      }
    }
  }
  if (whatsappAllowed && sanitizedPhone) {
    try {
      const client = getTwilio();
      if (!client) throw new Error('Twilio client not initialized');
      const body = `We received your booking request ${payload.bookingId}. Complete payment to confirm.`;
      const msg = await twilioWithTimeout<{ sid: string }>(
        client.messages.create({ from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, to: `whatsapp:${sanitizedPhone}`, body }),
        8000,
        'WhatsApp send'
      );
      whatsappSent = true; whatsappSid = msg.sid;
      if (debug) console.log('[notifications] receipt whatsapp sent', { whatsappSid });
    } catch (e: any) {
      const errorMsg = e?.message || 'failed';
      errors.push('WHATSAPP:' + errorMsg);
      // Only log essential error info, not full stack trace
      if (debug) {
        console.error('[notifications] receipt whatsapp error', errorMsg);
      } else {
        console.warn('[notifications] receipt whatsapp failed:', errorMsg.includes('timeout') ? 'Connection timeout' : errorMsg);
      }
    }
  }

  return { emailSent, emailMessageId, smsSent, whatsappSent, smsSid, whatsappSid, errors: errors.length ? errors : undefined };
}

// 24-hour reminder (email + optional SMS/WhatsApp)
export async function sendBookingReminder(payload: BookingNotificationPayload): Promise<NotificationResult> {
  const errors: string[] = [];
  const meetingUrl = payload.meetingUrl || getMeetingUrl(payload.roomCode || '');
  const smsAllowed = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_SMS_FROM && payload.userPhone);
  const whatsappAllowed = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM && payload.userPhone);
  const emailAllowed = !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL && payload.userEmail);
  const debug = process.env.NOTIFICATIONS_DEBUG === '1';

  const subject = `Appointment Reminder · ${payload.bookingId}`;
  const textBody = [
    `Hi ${payload.userName || 'there'},`,
    '',
    'This is a reminder for your upcoming session scheduled in about 24 hours:',
    `Therapist: ${payload.therapistName || 'Assigned Therapist'}`,
    `Type: ${payload.sessionType || 'video'}`,
    `Date: ${payload.date ? new Date(payload.date).toLocaleString() : 'TBA'}`,
    `Time: ${payload.timeSlot || 'TBA'}`,
    meetingUrl ? `Join: ${meetingUrl}` : 'Join link will follow.',
    '',
    'Please join 5 minutes early.',
    '— TheraTreat'
  ].join('\n');

  const htmlBody = `<!doctype html><html><body style="font-family:system-ui,Arial,sans-serif;line-height:1.5;color:#111">\n<h2 style="margin:0 0 16px">Appointment Reminder</h2>\n<p>Hi ${payload.userName || 'there'},</p>\n<p>This is a reminder for your upcoming session scheduled in about 24 hours. Details:</p>\n<ul>\n<li><strong>Therapist:</strong> ${payload.therapistName || 'Assigned Therapist'}</li>\n<li><strong>Type:</strong> ${payload.sessionType || 'video'}</li>\n<li><strong>Date:</strong> ${payload.date ? new Date(payload.date).toLocaleString() : 'TBA'}</li>\n<li><strong>Time:</strong> ${payload.timeSlot || 'TBA'}</li>\n</ul>\n${meetingUrl ? `<p><a href="${meetingUrl}" style="background:#2563eb;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;font-weight:600">Join Session</a></p><p style=\"font-size:14px;color:#555\">Or copy: <a href='${meetingUrl}'>${meetingUrl}</a></p>` : '<p><em>Join link will follow.</em></p>'}\n<p>Please join 5 minutes early to test audio/video.</p>\n<p>Thank you,<br/>TheraTreat Team</p>\n<hr style="margin:32px 0;border:none;border-top:1px solid #eee"/>\n<p style="font-size:12px;color:#777">Automated reminder. Do not reply.</p>\n</body></html>`;

  let emailSent = false; let emailMessageId: string | undefined;
  if (emailAllowed) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      let sgMail: any;
      try {
        sgMail = require('@sendgrid/mail');
      } catch (err) {
        sgMail = null;
      }
      if (!sgMail || !sgMail.setApiKey) throw new Error('SendGrid not available');
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
      if (debug) console.log('[notifications] reminder email sent', { emailMessageId });
    } catch (e: any) {
      let detail = e?.message || 'failed';
      const status = e?.code || e?.response?.statusCode;
      const sgErrors = e?.response?.body?.errors;
      if (Array.isArray(sgErrors) && sgErrors.length) {
        const msgs = sgErrors.slice(0, 3).map((er: any) => er.message || er.field || JSON.stringify(er));
        detail += ` | ${msgs.join('; ')}`;
      }
      if (status) detail = `${detail} (status ${status})`;
      errors.push('EMAIL:' + detail);
      console.error('[notifications] reminder email error', { detail, raw: e });
    }
  }

  const sanitizedPhone = payload.userPhone && /^\+?[1-9]\d{7,15}$/.test(payload.userPhone) ? payload.userPhone : undefined;
  let smsSent = false; let smsSid: string | undefined; let whatsappSent = false; let whatsappSid: string | undefined;
  if (smsAllowed && sanitizedPhone) {
    try {
      const client = getTwilio();
      if (!client) throw new Error('Twilio client not initialized');
      const body = `Reminder: Booking ${payload.bookingId} is in 24 hours. ${meetingUrl ? 'Join: ' + meetingUrl : ''}`.trim();
      const msg = await twilioWithTimeout<{ sid: string }>(
        client.messages.create({ from: process.env.TWILIO_SMS_FROM, to: sanitizedPhone, body }),
        8000,
        'Reminder SMS send'
      );
      smsSent = true; smsSid = msg.sid;
      if (debug) console.log('[notifications] reminder sms sent', { smsSid });
    } catch (e: any) {
      const errorMsg = e?.message || 'failed';
      errors.push('SMS:' + errorMsg);
      if (debug) {
        console.error('[notifications] reminder sms error', errorMsg);
      } else {
        console.warn('[notifications] reminder sms failed:', errorMsg.includes('timeout') ? 'Connection timeout' : errorMsg);
      }
    }
  }
  if (whatsappAllowed && sanitizedPhone) {
    try {
      const client = getTwilio();
      if (!client) throw new Error('Twilio client not initialized');
      const body = `Reminder: Booking ${payload.bookingId} is in 24 hours. ${meetingUrl ? 'Join: ' + meetingUrl : ''}`.trim();
      const msg = await twilioWithTimeout<{ sid: string }>(
        client.messages.create({ from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, to: `whatsapp:${sanitizedPhone}`, body }),
        8000,
        'Reminder WhatsApp send'
      );
      whatsappSent = true; whatsappSid = msg.sid;
      if (debug) console.log('[notifications] reminder whatsapp sent', { whatsappSid });
    } catch (e: any) {
      const errorMsg = e?.message || 'failed';
      errors.push('WHATSAPP:' + errorMsg);
      if (debug) {
        console.error('[notifications] reminder whatsapp error', errorMsg);
      } else {
        console.warn('[notifications] reminder whatsapp failed:', errorMsg.includes('timeout') ? 'Connection timeout' : errorMsg);
      }
    }
  }

  return { emailSent, emailMessageId, smsSent, whatsappSent, smsSid, whatsappSid, errors: errors.length ? errors : undefined };
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
        const msg = await twilioWithTimeout<{ sid: string }>(
          client.messages.create({ from: process.env.TWILIO_SMS_FROM, to: sanitizedPhone, body }),
          8000,
          'Welcome SMS send'
        );
        smsSent = true; smsSid = msg.sid;
        if (debug) console.log('[notifications] welcome sms sent', { smsSid });
      }
    } catch (e: any) {
      const errorMsg = e?.message || 'failed';
      errors.push('SMS:' + errorMsg);
      if (debug) {
        console.error('[notifications] welcome sms error', errorMsg);
      } else {
        console.warn('[notifications] welcome sms failed:', errorMsg.includes('timeout') ? 'Connection timeout' : errorMsg);
      }
    }
  }

  return { emailSent, emailMessageId, smsSent, smsSid, errors: errors.length ? errors : undefined };
}
