# Razorpay Split Payment System - Implementation Guide

## Overview
This document describes the refined split payment system using Razorpay connected accounts (sub-accounts) for automatic payment distribution between therapists/clinics and the platform.

## Architecture

### Components
1. **Sub-Account Creation** (`lib/razorpay-subaccount.ts`)
   - Creates Razorpay connected accounts for therapists and clinics
   - Stores bank details and account information
   - Enables automatic split payments

2. **Order Creation** (`app/api/payments/razorpay/order/route.ts`)
   - Creates Razorpay orders with transfer configuration
   - Automatically splits payments between provider and platform
   - Supports both therapist and clinic-based bookings

3. **Sub-Account Management** (`app/api/payments/razorpay/create-subaccount/route.ts`)
   - API endpoint to manually create/update sub-accounts
   - Useful for updating bank details or creating accounts after registration

## How It Works

### 1. Sub-Account Creation
When a therapist or clinic adds bank details during registration:
- A Razorpay connected account (sub-account) is automatically created
- The account ID is stored in the therapist/clinic document
- Bank details are linked to the Razorpay account

**Automatic Creation:**
- Clinic registration: Creates sub-account when bank details are provided
- Therapist onboarding: Creates sub-account on final step if bank details exist

**Manual Creation:**
- POST `/api/payments/razorpay/create-subaccount`
- Body: `{ type: 'therapist' | 'clinic', entityId: string, bankDetails: {...} }`

### 2. Split Payment Flow
When a payment order is created:
1. System calculates total amount (base + fees + tax)
2. Calculates commission (configurable percentage)
3. Determines provider amount (total - commission)
4. Creates Razorpay order with `transfers` array
5. Razorpay automatically splits payment at capture time

**Transfer Configuration:**
```javascript
transfers: [
  {
    account: providerAccountId,  // Therapist/Clinic Razorpay account
    amount: providerAmount,
    currency: 'INR',
    notes: { role: 'therapist' | 'clinic', ... }
  },
  {
    account: platformAccountId,  // Platform Razorpay account
    amount: commissionAmount,
    currency: 'INR',
    notes: { role: 'platform_commission', ... }
  }
]
```

## Configuration

### Environment Variables

**Required:**
- `RAZORPAY_PLATFORM_ACCOUNT` - Your platform's Razorpay account ID (acc_XXXX)
- `RAZORPAY_DEFAULT_COMMISSION_PERCENT` - Default commission percentage (default: 15)

**Optional:**
- `RAZORPAY_PLATFORM_FEE` - Fixed platform fee (default: 5)
- `RAZORPAY_TAX` - Tax amount (default: 10)

**Razorpay Credentials:**
- `RAZORPAY_TEST_KEY_ID` / `RAZORPAY_TEST_KEY_SECRET`
- `RAZORPAY_LIVE_KEY_ID` / `RAZORPAY_LIVE_KEY_SECRET`
- `NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID` / `NEXT_PUBLIC_RAZORPAY_LIVE_KEY_ID`

### Commission Structure
- **Default Commission**: 15% (configurable via `RAZORPAY_DEFAULT_COMMISSION_PERCENT`)
- **Per-Provider Override**: Therapists/clinics can have custom commission rates
  - Stored in `therapist.defaultCommissionPercent` or `clinic.defaultCommissionPercent`
  - Value is a decimal (0.15 = 15%)

## Database Schema

### Therapist Document
```javascript
{
  razorpayAccountId: String,        // Razorpay account ID (acc_XXXX)
  razorpayAccountMode: 'test' | 'live',
  razorpayAccountLinkedAt: Date,
  defaultCommissionPercent: Number  // Optional, overrides default
}
```

### Clinic Document
```javascript
{
  razorpayAccountId: String,         // Razorpay account ID (acc_XXXX)
  razorpayAccountMode: 'test' | 'live',
  razorpayAccountLinkedAt: Date,
  defaultCommissionPercent: Number, // Optional, overrides default
  bank: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    upiId: String
  }
}
```

## Payment Calculation Example

**Scenario:**
- Base amount: ₹1000
- Platform fee: ₹5
- Tax: ₹10
- Commission: 15%

**Calculation:**
1. Gross amount: ₹1000 + ₹5 + ₹10 = ₹1015
2. Commission (15%): ₹1015 × 0.15 = ₹152.25
3. Provider amount: ₹1015 - ₹152.25 = ₹862.75

**Split:**
- Provider receives: ₹862.75
- Platform receives: ₹152.25

## Error Handling

### Sub-Account Creation Failures
- Non-blocking: Registration continues even if sub-account creation fails
- Can be retried later via `/api/payments/razorpay/create-subaccount`
- Errors are logged but don't prevent user registration

### Split Payment Failures
- If sub-account is missing, payment proceeds without split
- Platform receives full amount
- Warning logged for reconciliation

## Testing

### Test Mode
1. Set `RAZORPAY_MODE=test` or use test credentials
2. Create test sub-accounts
3. Test order creation with transfers
4. Verify split in Razorpay test dashboard

### Production Checklist
- [ ] Enable Razorpay Route feature in dashboard
- [ ] Set `RAZORPAY_PLATFORM_ACCOUNT` environment variable
- [ ] Configure commission percentage
- [ ] Test sub-account creation
- [ ] Test split payment flow
- [ ] Verify settlements in Razorpay dashboard

## Troubleshooting

### Sub-Account Not Created
- Check Razorpay credentials are correct
- Verify bank details are valid (account number, IFSC)
- Check Razorpay account has Route feature enabled
- Review logs for specific error messages

### Split Payment Not Working
- Verify `RAZORPAY_PLATFORM_ACCOUNT` is set
- Check provider has `razorpayAccountId` in database
- Ensure both accounts are in same mode (test/live)
- Verify Route feature is enabled in Razorpay dashboard

### Commission Calculation Issues
- Check `defaultCommissionPercent` is a decimal (0.15, not 15)
- Verify environment variables are set correctly
- Review order creation logs for actual values used

## API Endpoints

### Create/Update Sub-Account
**POST** `/api/payments/razorpay/create-subaccount`
- Requires authentication (therapist/clinic-owner)
- Body: `{ type, entityId, bankDetails }`
- Returns: `{ subAccount: { id, mode }, message }`

### Create Payment Order
**POST** `/api/payments/razorpay/order`
- Requires authentication
- Body: `{ bookingId }` or `{ therapistId, amount }`
- Returns: `{ order, keyId, mode, split: {...} }`

## Support

For Razorpay-specific issues:
- Razorpay Documentation: https://razorpay.com/docs/
- Route Feature: https://razorpay.com/route/
- Support: support@razorpay.com

