# 100ms Video Call System for TheraBook

## Overview

This is a comprehensive video therapy system built using **100ms RoomKit React** for secure, HIPAA-compliant video sessions between therapists and clients.

## 🚀 Features

### Core Video Call Features
- **HD Video & Audio**: Crystal clear video and audio quality
- **Screen Sharing**: Share therapeutic materials and presentations
- **Multi-Platform**: Works on desktop, tablet, and mobile
- **End-to-End Encrypted**: HIPAA-compliant security
- **Real-time Controls**: Mute/unmute, video on/off, etc.

### Session Management
- **Scheduling System**: Book video sessions with specific times
- **Lobby System**: Pre-call waiting area with session details
- **User Roles**: Separate interfaces for therapists and clients
- **Call Logging**: Track session duration and participants
- **Dashboard Integration**: Manage sessions from user dashboard

## 📁 File Structure

```
components/video-call/
├── VideoCallRoom.tsx          # Main video call interface
├── VideoCallLobby.tsx         # Pre-call lobby
├── VideoCallBooking.tsx       # Session creation form
└── VideoCallDashboard.tsx     # Session management

app/video-call/
├── room/page.tsx              # Video call room page
├── lobby/page.tsx             # Lobby page
├── create/page.tsx            # Session creation page
├── demo/page.tsx              # Feature demonstration
└── testing/page.tsx           # Testing interface

app/api/video-calls/
├── rooms/route.ts             # Room creation & management
├── booking/[bookingId]/route.ts  # Booking details
└── log/route.ts               # Call logging
```

## 🛠 Installation & Setup

### 1. Install Dependencies
```bash
npm install @100mslive/roomkit-react --save
```

### 2. Environment Variables
Add to your `.env.local`:
```env
# 100ms Configuration (when ready for production)
HMS_MANAGEMENT_TOKEN=your_management_token
HMS_TEMPLATE_ID=your_template_id
```

### 3. Development Server
```bash
npm run dev
```

## 📖 Usage Guide

### For Therapists

#### Creating a Video Session
1. Navigate to `/video-call/create`
2. Fill in client details and schedule time
3. Add session notes (optional)
4. Click "Create Video Call Session"

#### Joining a Session
1. Go to dashboard and find scheduled session
2. Click "Join Call" when ready (10 min before scheduled time)
3. Wait in lobby for client to join
4. Start the therapy session

### For Clients

#### Joining a Session
1. Receive booking ID from therapist
2. Navigate to `/video-call/lobby?bookingId=BOOKING_ID&userRole=client&userId=CLIENT_ID`
3. Wait for session time to arrive
4. Click "Join Video Call" when available

## 🔧 API Endpoints

### POST `/api/video-calls/rooms`
Create a new video call session

### GET `/api/video-calls/booking/[bookingId]`
Get booking details and room code

### POST `/api/video-calls/log`
Log call events (start, end, join, leave)

## 🧪 Testing

### Test Pages
- **Demo**: `/video-call/demo` - Full feature overview
- **Testing**: `/video-call/testing` - API testing interface
- **Create**: `/video-call/create` - Session creation
- **Lobby**: `/video-call/lobby` - Pre-call experience

## 🔗 Key URLs (Development)

- **Demo Page**: `http://localhost:3000/video-call/demo`
- **Create Session**: `http://localhost:3000/video-call/create`
- **Testing Suite**: `http://localhost:3000/video-call/testing`

---

**Built with ❤️ for secure therapy sessions using 100ms technology**
