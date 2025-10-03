# 100ms Video Call System for TheraBook

A comprehensive video calling solution integrated into the TheraBook platform using 100ms technology.

## Features

### 🎥 Core Video Call Features
- **HD Video & Audio**: Crystal clear video and audio quality
- **Screen Sharing**: Share therapeutic materials and presentations
- **Multi-Participant Support**: Group therapy sessions
- **Cross-Platform**: Works on desktop, tablet, and mobile
- **HIPAA Compliant**: End-to-end encrypted, secure sessions

### 🛡️ Security & Compliance
- End-to-end encryption
- HIPAA compliance
- Secure room codes
- Session logging and audit trails
- Privacy controls

### 📱 User Experience
- **Pre-call Lobby**: Join 10 minutes before scheduled time
- **Smart Booking**: Integrated with existing appointment system
- **Dashboard Integration**: Manage all video calls from user dashboard
- **Real-time Status**: Live session status updates

## System Architecture

```
Frontend (React/Next.js)
    ↓
100ms RoomKit Integration
    ↓
API Layer (Next.js API Routes)
    ↓
Session Management & Logging
    ↓
Database (Bookings & Call Logs)
```

## Installation

1. **Install the 100ms package**:
```bash
npm install @100mslive/roomkit-react --save
```

2. **Environment Variables**:
Add to your `.env.local` file:
```env
HMS_ACCESS_KEY=your_access_key_here
HMS_SECRET=your_secret_here
HMS_TEMPLATE_ID=your_template_id_here
HMS_ROOM_CODE_PREFIX=therabook
```

## Components

### Core Components

#### `VideoCallRoom`
- Main video call interface using 100ms RoomKit
- Handles call controls and session management
- Located: `components/video-call/VideoCallRoom.tsx`

#### `VideoCallLobby`
- Pre-call waiting area
- Displays session details and participant info
- Located: `components/video-call/VideoCallLobby.tsx`

#### `VideoCallBooking`
- Create and schedule new video call sessions
- Form for therapist to set up appointments
- Located: `components/video-call/VideoCallBooking.tsx`

#### `VideoCallDashboard`
- Manage all video call sessions
- View upcoming, in-progress, and completed calls
- Located: `components/video-call/VideoCallDashboard.tsx`

### API Endpoints

#### Booking Management
- `GET /api/video-calls/booking/[bookingId]` - Get booking details
- `PATCH /api/video-calls/booking/[bookingId]` - Update booking status

#### Room Management
- `POST /api/video-calls/rooms` - Create new video call room
- `GET /api/video-calls/rooms` - List rooms by therapist/client

#### Session Logging
- `POST /api/video-calls/log` - Log call events
- `GET /api/video-calls/log` - Get call history

## Usage Flow

### 1. Creating a Session (Therapist)
```tsx
// Navigate to create session page
router.push('/video-call/create');

// Or use the component directly
<VideoCallBooking 
  therapistId="therapist-123"
  onBookingCreated={(bookingId) => {
    // Handle successful creation
  }}
/>
```

### 2. Joining a Session (Client/Therapist)
```tsx
// Navigate to lobby
router.push(`/video-call/lobby?bookingId=${bookingId}&userRole=client&userId=${userId}`);

// Which then leads to the actual call
router.push(`/video-call/room?roomCode=${roomCode}&userName=${userName}&userRole=${userRole}`);
```

### 3. Dashboard Integration
```tsx
// Add video calls to existing dashboard
<VideoCallDashboard userRole="client" userId="user-123" />
```

## Pages

### `/video-call/demo`
- Complete demo showcasing all features
- Test interface with API testing
- Feature overview and documentation

### `/video-call/create`
- Create new video call sessions
- Therapist-only access
- Form with scheduling and participant details

### `/video-call/lobby`
- Pre-call waiting area
- Session details and participant info
- Join call when ready

### `/video-call/room`
- Actual video call interface
- 100ms RoomKit integration
- Call controls and features

### `/video-call/test`
- Testing and verification page
- API endpoint testing
- System health checks

## Integration with Existing Dashboard

The video call system integrates seamlessly with the existing TheraBook user dashboard:

1. **New sidebar item**: "Video Calls" added to navigation
2. **Enhanced appointments**: "Join Session" buttons link to video calls
3. **Unified experience**: Consistent design and user flow

## Mock Data Structure

```typescript
interface VideoCallSession {
  id: string;
  roomCode: string;
  therapistId: string;
  clientId: string;
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}
```

## Testing

### Manual Testing
1. Visit `/video-call/test` for comprehensive testing interface
2. Run API tests to verify endpoints
3. Test individual components and pages

### API Testing
The test page includes automated testing for:
- Room creation
- Booking management
- Session logging
- Status updates

## Production Setup

### 1. 100ms Configuration
- Create account at [100ms.live](https://100ms.live)
- Set up room templates with appropriate roles
- Configure recording and streaming if needed
- Get API keys and template IDs

### 2. Database Integration
Replace mock data with actual database calls:
- User management
- Booking system
- Session logs
- Call history

### 3. Authentication
Integrate with existing auth system:
- Secure API endpoints
- User role validation
- Session management

### 4. Environment Configuration
```env
# Production environment variables
HMS_ACCESS_KEY=prod_access_key
HMS_SECRET=prod_secret
HMS_TEMPLATE_ID=prod_template_id
HMS_ENVIRONMENT=production
```

## Security Considerations

1. **API Security**: All endpoints should be protected with authentication
2. **Room Access**: Validate user permissions before allowing room access
3. **Data Privacy**: Ensure HIPAA compliance for all video call data
4. **Session Logs**: Implement secure logging for audit purposes

## Troubleshooting

### Common Issues

1. **Video/Audio not working**
   - Check browser permissions
   - Verify device access
   - Test with different browsers

2. **Can't join room**
   - Verify room code is valid
   - Check scheduling time restrictions
   - Ensure user has proper permissions

3. **API errors**
   - Check network connectivity
   - Verify API endpoints are running
   - Review server logs

## Future Enhancements

- [ ] Recording functionality
- [ ] Screen sharing controls
- [ ] Virtual backgrounds
- [ ] Chat during calls
- [ ] Breakout rooms for group therapy
- [ ] Integration with calendar systems
- [ ] Mobile app support
- [ ] Waiting room features
- [ ] Call quality monitoring

## Support

For technical support or questions:
1. Check the test page at `/video-call/test`
2. Review API documentation
3. Consult 100ms documentation
4. Contact development team

---

**Note**: This system uses mock data for demonstration. For production use, implement proper database integration and authentication.
