# Forgot Password via Twilio Verify (OTP)

This app implements a phone-based password reset flow using Twilio Verify.

## Endpoints
- `POST /api/auth/forgot-password/start`
  - Body: `{ email: string, phone: string }`
  - Sends a Verify OTP only if the email exists and its stored phone matches the provided phone. Always returns 202 (generic message) to prevent enumeration.
- `POST /api/auth/forgot-password/reset`
  - Body: `{ email: string, phone: string, code: string, newPassword: string }`
  - Verifies the OTP for the given phone and ensures the email’s stored phone matches; then updates the user's password.

## UI
- Page: `/auth/forgot-password`
  - Step 1: Enter email + phone and request OTP
  - Step 2: Enter OTP and new password

## Environment
Required env vars (already used by OTP module):
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID`
- Optional: `TWILIO_VERIFY_TEMPLATE_SID` (if using custom message) and `OTP_DEFAULT_COUNTRY_CODE` (e.g., `+91`).

## Notes
- Rate limiting and error mapping handled by `lib/otp.ts` (Twilio Verify).
- Passwords are hashed with bcrypt (12 rounds) via `lib/auth.js`.
- Phone is normalized for lookup; if stored without country code, fallback update by raw phone is attempted.
- Dev tip: If your DB connection fails and the app uses the mock DB, set `OTP_DEV_ALLOW_NO_MATCH=1` to allow OTP send without an existing user match for local testing.

## Quick Test (Dev)
1. Set the Twilio env vars.
2. Visit `/auth/forgot-password` and use a phone attached to a user.
3. Request OTP, then enter the received code and a new password.
4. Login at `/auth/login` with the updated password.
