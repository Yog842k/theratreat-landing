## Secret Handling & Rotation Policy

This project previously contained accidentally committed live/test API credentials (Razorpay, HMS, JWT secret). They have been removed and must never reappear in the Git history.

### Golden Rules
1. Never commit real secrets (.env.local, .env, production keys) – only placeholder values in `.env.example`.
2. All runtime secrets must come from environment variables supplied by the deployment platform (Vercel, Render, Docker secrets, etc.).
3. Public keys intended for the browser must be prefixed with `NEXT_PUBLIC_` and are *not* secret.
4. Rotate any secret immediately if it appears in Git history or logs.

### Rotation Steps (Example: Razorpay)
1. Generate new key pair in Razorpay Dashboard.
2. Update deployment environment variables (`RAZORPAY_LIVE_KEY_ID`, `RAZORPAY_LIVE_KEY_SECRET`).
3. Remove old variables and revoke old key.
4. Invalidate any cached credentials (containers, serverless functions) by redeploying.

### Local Development
Create an untracked `.env.local` (ignored via `.gitignore`). Example:
```
RAZORPAY_TEST_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_TEST_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_RAZORPAY_KEY_ID=${RAZORPAY_TEST_KEY_ID}
```

### Secret Scan
Run a lightweight scan before committing:
```
npm run scan:secrets
```
Integrate into a pre-commit hook if desired.

### Adding New Integrations
When introducing a new provider:
- Add placeholder vars to `.env.example`.
- Document required values and scopes.
- Avoid inline literals; reference `process.env.X` only.

#### SendGrid (Email)
- `SENDGRID_API_KEY`: API key with Mail Send permissions.
- `SENDGRID_FROM_EMAIL`: Verified sender email or domain.

Notes:
- Verify the sender in SendGrid or use a verified domain; otherwise emails may fail with 403.
- Keep keys out of client-side code; only server-side envs should include them.

#### Twilio (SMS/WhatsApp)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_SMS_FROM`: E.164 number (e.g. `+15551234567`).
- `TWILIO_WHATSAPP_FROM`: WhatsApp sender (e.g. `+15551234567`).

#### General
- `NEXT_PUBLIC_BASE_URL`: Public base URL used in links.

Environment files:
- `.env.local` for local development
- `.env.production` for production builds

Ensure CI/CD (Amplify) has these configured in its environment variables settings.

### Incident Response Quick Checklist
1. Identify leaked value(s) and scope of exposure (which repos/commits).
2. Rotate at provider dashboard; revoke or delete old keys.
3. Purge repository history (BFG or git-filter-repo) if policy requires complete removal.
4. Force push and notify collaborators to re-clone.
5. Add/verify automated scanning in CI.

### Contact
Escalate security incidents to the project owner immediately.
