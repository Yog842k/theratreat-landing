# 100ms API Keys Setup Guide

## Where to Get Your 100ms API Keys

### Step 1: Create a 100ms Account
1. Go to [100ms Dashboard](https://dashboard.100ms.live/)
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your API Keys

#### For Basic Integration (Room Codes):
1. **Access Key & Secret**:
   - Go to **Dashboard** → **Developer** → **API Keys**
   - Copy your `Access Key` and `Secret Key`
   - Add them to `.env.local`:
   ```env
   HMS_ACCESS_KEY=your_access_key_here
   HMS_SECRET=your_secret_key_here
   ```

#### For Advanced Features (Management SDK):
1. **Management Token**:
   - Go to **Dashboard** → **Developer** → **Access Tokens**
   - Create a new token with appropriate permissions
   - Add to `.env.local`:
   ```env
   HMS_MANAGEMENT_TOKEN=your_management_token_here
   ```

### Step 3: Create Room Templates
1. **Create Template**:
   - Go to **Dashboard** → **Rooms** → **Templates**
   - Click "Create New Template"
   - Configure roles (host, participant, etc.)
   - Copy the Template ID:
   ```env
   HMS_TEMPLATE_ID=your_template_id_here
   ```

### Step 4: Get Your Subdomain
1. **Find Subdomain**:
   - In your dashboard, look for your organization subdomain
   - Usually shown as `yourname.app.100ms.live`
   - Add to `.env.local`:
   ```env
   HMS_SUBDOMAIN=yourname
   ```

## Environment Variables Explained

```env
# Basic Configuration
HMS_ACCESS_KEY=abc123...           # From API Keys section
HMS_SECRET=xyz789...               # From API Keys section
HMS_TEMPLATE_ID=64f1a2b3c4d5e6f7   # From Templates section
HMS_SUBDOMAIN=yourname             # Your organization subdomain

# Optional Configuration
HMS_REGION=in                      # Server region (in, us-west, eu-central)
HMS_ROOM_CODE_PREFIX=therabook     # Prefix for generated room codes

# Advanced (Production)
HMS_MANAGEMENT_TOKEN=management_token_here  # For server-side room creation
```

## Security Best Practices

### ✅ DO:
- Keep API keys in `.env.local` (never commit to git)
- Use different keys for development and production
- Regenerate keys if compromised
- Use Management Tokens only on server-side

### ❌ DON'T:
- Put API keys directly in code
- Share keys in public repositories
- Use production keys in development
- Expose Management Tokens to client-side

## Testing Your Setup

### Quick Test (Client-side):
```javascript
// This will work with just room codes (no API keys needed)
import { HMSPrebuilt } from '@100mslive/roomkit-react';

<HMSPrebuilt roomCode="your-room-code" />
```

### Full Integration (Server-side):
```javascript
// This requires HMS_MANAGEMENT_TOKEN
import { RoomsAPI } from "@100mslive/server-sdk";

const roomsAPI = new RoomsAPI({
  authToken: process.env.HMS_MANAGEMENT_TOKEN,
});
```

## Current Status

For your current implementation:
- ✅ **Room codes work** - No API keys needed for basic testing
- 🔄 **API keys needed** - For production room creation
- 📝 **Template setup** - Required for custom roles and permissions

## Next Steps

1. **For Testing**: Use hardcoded room codes (current setup works)
2. **For Production**: Get API keys and implement Management SDK
3. **For Custom Features**: Create templates with specific roles

## Getting Help

- 📚 [100ms Documentation](https://docs.100ms.live/)
- 🎯 [100ms React SDK Guide](https://docs.100ms.live/react/v2/quickstart/react-quickstart)
- 💬 [100ms Discord Community](https://discord.gg/F8cNgbjSaQ)
- 📧 [Support Email](mailto:support@100ms.live)

---

**Remember**: Your current video call system works without API keys for testing. Add keys when you're ready for production!
