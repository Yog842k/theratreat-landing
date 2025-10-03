# 100ms Video Call Integration Guide

## Quick Setup

### 1. Environment Configuration
Add to your `.env.local`:

```env
HMS_MANAGEMENT_TOKEN=your_management_token_here
HMS_ROOM_ID=your_room_id_here  
HMS_SUBDOMAIN=your_subdomain
```

### 2. Get 100ms Credentials

1. **Sign up**: Create account at [100ms.live](https://100ms.live)
2. **Create App**: Set up a new application
3. **Get Management Token**: From Developer section in dashboard
4. **Create Room**: Get Room ID from Rooms section
5. **Note Subdomain**: From your dashboard URL

### 3. Test the System

Visit these pages to test:
- `/video-call/secure-therapy` - Main therapy interface
- `/video-call/test` - System diagnostics  
- `/api/100ms-token` - API health check

### 4. Usage Examples

#### Quick Demo Join
```typescript
// As Therapist
await handleJoinSession("Dr. Smith", "therapist", "demo-room");

// As Patient  
await handleJoinSession("John Doe", "patient", "demo-room");
```

#### Custom Session
```typescript
const sessionData = {
  name: "Dr. Sarah Wilson",
  role: "therapist", 
  sessionId: "therapy-session-123"
};
```

### 5. Integration Points

**With TheraBook Booking:**
```typescript
// Generate session from booking
const sessionId = `booking_${bookingId}_${Date.now()}`;
const videoUrl = `/video-call/therapy?session=${sessionId}`;
```

**With User Authentication:**
```typescript
// Use existing user data
const userId = `${user.role}_${user.id}`;
const token = await generateAuthToken(userId, user.role);
```

### 6. Components Available

- `JoinSessionForm` - Entry form for sessions
- `TherapyRoom` - Main video interface
- `VideoTileNew` - Individual participant view
- `VideoCallBooking` - Booking integration (existing)

### 7. Security Notes

- All tokens expire after 24 hours
- HIPAA-compliant encryption enabled
- Role-based access control implemented
- Audit logging available

### 8. Troubleshooting

**Common Issues:**
- Missing environment variables → Check `.env.local`
- Token generation fails → Verify 100ms credentials
- Video not loading → Check browser permissions
- Connection issues → Test network/firewall

**Quick Test:**
```bash
curl http://localhost:3000/api/100ms-token
# Should return: {"status":"ok","service":"100ms token generator"}
```
