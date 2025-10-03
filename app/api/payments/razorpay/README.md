# Razorpay Integration (Dual Mode)

This folder contains a clean dual‑mode (test/live) Razorpay integration for the Next.js App Router.

## Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payments/razorpay/order` | POST | Create Razorpay order for a booking |
| `/api/payments/razorpay/verify` | POST | Verify payment signature after Checkout success |
| `/api/payments/razorpay/config` | GET  | Return public key + active mode (debug param adds meta) |
| `/api/payments/razorpay/status` | GET  | Summarize configured modes (test/live/legacy) |
| `/api/payments/razorpay/webhook` | POST | (Optional) Webhook skeleton for reconciliation |

## Environment Variables
Two modes supported. Supply at least one full pair.

TEST MODE:
```
RAZORPAY_TEST_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_TEST_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
```

LIVE MODE:
```
RAZORPAY_LIVE_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
RAZORPAY_LIVE_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_RAZORPAY_LIVE_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
```

LEGACY (single pair – still works):
```
RAZORPAY_KEY_ID=rzp_test_or_live_key
RAZORPAY_KEY_SECRET=its_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_or_live_key
```

GLOBAL SETTINGS (optional):
```
RAZORPAY_MODE=test            # or live (overrides auto‑selection)
RAZORPAY_AUTO_CAPTURE=1       # 1 auto‑capture, 0 manual capture
RAZORPAY_WEBHOOK_SECRET=xxxx  # for webhook signature verification
```

## Order Flow
1. Client requests order (must be authenticated, booking owned by user).
2. Server computes payable amount, creates order with active mode credentials.
3. Client opens Razorpay Checkout using returned `keyId` + `order.id`.
4. On success, client sends payment ids to `/verify`.
5. Server verifies HMAC signature and marks booking paid.

## Webhook (Optional)
Configure in Razorpay Dashboard (same mode). Set `RAZORPAY_WEBHOOK_SECRET` and enable events like `payment.captured`. Endpoint verifies signature and can reconcile late captures.

## Debugging
- `/api/payments/razorpay/config?debug=1` (non‑production) shows which sets are present (masked).
- `/api/payments/razorpay/status` quick readiness snapshot.

## Common Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| 401 Authentication failed | Wrong / mismatched key pair | Regenerate keys; restart dev server |
| Signature verification failed | Using live secret for test payment or vice versa | Ensure mode + secret match order creation mode |
| Checkout shows test key while expecting live | Mixed NEXT_PUBLIC_* variable | Align public key with active mode |
| Order amount mismatch | Amount logic differs from UI | Keep platform fee + tax logic consistent |

## Security Notes
- Never expose `*_KEY_SECRET` to client.
- Always verify signature server-side before marking booking paid.
- Consider adding rate limiting and booking status checks to prevent replay.

## Next Steps (Optional Enhancements)
- Store raw Razorpay payment entity for audit.
- Add manual capture endpoint when `RAZORPAY_AUTO_CAPTURE=0`.
- Implement refunds route.
- Extend webhook reconciliation for refunds / disputes.

---
Maintained as part of the payment module; adjust as product pricing or booking schema evolves.
