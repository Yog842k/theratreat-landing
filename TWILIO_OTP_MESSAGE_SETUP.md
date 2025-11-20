# Twilio Verify Custom OTP Message Setup

## Custom Message Format

The desired OTP message format is:
```
Welcome to theratreat, your OTP is {code}
```

**Note:** This custom message will apply to ALL OTPs sent through your Verify Service, including:
- Patient registration OTPs
- Therapist registration OTPs
- Clinic registration OTPs
- Any other OTP purposes

All OTPs use the same Twilio Verify Service and template, so once configured, the custom message will work for everyone.

## How to Set Up Custom OTP Message

Twilio Verify requires custom message templates to be approved by Twilio Support. Follow these steps:

### Step 1: Request Custom Template from Twilio Support

1. **Contact Twilio Support**:
   - Go to [Twilio Console](https://console.twilio.com/)
   - Navigate to **Help & Support** → **Support Tickets**
   - Create a new support ticket

2. **Provide the Following Information**:
   - **Account SID**: Your `TWILIO_ACCOUNT_SID`
   - **Verify Service SID**: Your `TWILIO_VERIFY_SERVICE_SID` (starts with `VA...`)
   - **Desired Message Template**: 
     ```
     Welcome to theratreat, your OTP is {{code}}
     ```
   - **Template Name**: "TheraTreat OTP Template"
   - **Default Locale**: English (en)
   - **Usage Regions**: Specify your regions (e.g., India, US, etc.)

3. **Wait for Approval**: Twilio Support will review and approve your template (usually takes 1-2 business days)

### Step 2: Get Your Template SID

Once approved, Twilio will provide you with a **Template SID** (starts with `HJ...`)

### Step 3: Configure in Your Application

Add the Template SID to your environment variables:

```env
TWILIO_VERIFY_TEMPLATE_SID=HJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Restart Your Server

After adding the environment variable, restart your development server:

```bash
npm run dev
```

## Alternative: Configure in Twilio Console

You can also set a custom template as the default for your Verify Service:

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Verify** → **Services**
3. Select your Verify Service
4. Go to **General** tab
5. Under **Message Template Configuration**, select your custom template
6. Save changes

## Current Configuration

The code is already set up to use custom templates. Once you have:
- ✅ `TWILIO_VERIFY_SERVICE_SID` configured
- ✅ Custom template approved by Twilio
- ✅ `TWILIO_VERIFY_TEMPLATE_SID` set (optional, if you want to use a specific template)

The custom message will automatically be used when sending OTPs.

## Testing

After setup, test by:
1. Sending an OTP through your application
2. Check the SMS received - it should show: "Welcome to theratreat, your OTP is 123456"

## Notes

- The `{code}` placeholder will be automatically replaced by Twilio with the actual OTP code
- Custom templates must comply with carrier regulations
- Some regions may have specific requirements for OTP messages
- The `friendlyName: 'TheraTreat'` is already set in the code for better identification

