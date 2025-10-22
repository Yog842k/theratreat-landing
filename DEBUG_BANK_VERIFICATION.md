# Bank Verification Test Page

A lightweight utility page to test bank account verification via IDfy.

- Route: `/debug/bank-verification`
- API used: `POST /api/idfy/verify-bank`
- Library: `lib/idfy.ts` (`verifyBankAccount`)

## Environment

Set one of the following authentication methods on the server:

- IDFY_CLIENT_ID and IDFY_CLIENT_SECRET (Bearer flow preferred)
- or IDFY_API_KEY (and optional IDFY_ACCOUNT_ID)

Optional configuration:

- IDFY_BASE_URL (default: https://eve.idfy.com/v3)
- IDFY_BANK_ENDPOINT to force a specific endpoint (for many tenants this is required)
- Recommended (based on your tenant):
   - IDFY_BANK_ENDPOINT=/tasks/async/verify_with_source/ind_bank_account_v2
- IDFY_FALLBACK_TO_MOCK=1 to mock when endpoint isn't enabled (404) on your tenant
- IDFY_MODE=mock to always mock
- IDFY_DEBUG=1 to log verbose debug on the server

## Usage

1. Open `/debug/bank-verification` while the dev server is running.
2. Enter:
   - Account number (9–18 digits typical)
   - IFSC (11 chars, 5th is 0 e.g. HDFC0001234)
   - Account holder name (optional but improves match)
3. Submit. You'll see provider details, name match score, and raw payload when errors occur.

## Notes

- If you get 404 from IDfy, your tenant may not have the product/endpoint enabled. Either enable it or set `IDFY_BANK_ENDPOINT` to the correct path shared by IDfy.
- When credentials are missing, the API returns `{ ok: false, error: 'IDFY_NOT_CONFIGURED' }` with HTTP 422.
- The mock validator enforces basic format checks to help you test without real calls.
