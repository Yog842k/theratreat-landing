# TheraBook Video Calling System

A secure, HIPAA-compliant video calling system built with Next.js 13 and 100ms React SDK, specifically designed for therapy sessions.

## 🚀 Features

### Core Video Calling
- **HD Video & Audio**: Crystal clear communication with adaptive quality
- **Screen Sharing**: Share documents, presentations, or therapeutic materials
- **Recording**: Session recording capabilities (therapist-controlled)
- **Waiting Room**: Secure patient waiting before session starts

### Security & Compliance
- **HIPAA Compliant**: Secure data handling and privacy protection
- **End-to-End Encryption**: All communications are encrypted
- **Token-Based Authentication**: Secure session access
- **Audit Logs**: Complete session tracking and compliance reporting

### Professional Features
- **Role-Based Access**: Different permissions for therapists and patients
- **Session Controls**: Mute, camera toggle, hand raising, chat
- **Professional UI**: Clean, distraction-free interface
- **Mobile Responsive**: Works seamlessly on all devices

## 🏗️ Architecture

### Components Structure
```
components/video-call/
├── JoinSessionForm.tsx     # Session entry form
├── TherapyRoom.tsx         # Main video call interface  
├── VideoTile.tsx           # Individual participant video
└── VideoTileNew.tsx        # Enhanced video tile component
```

### API Routes
```
app/api/
└── 100ms-token/
    └── route.ts            # Token generation endpoint
```

### Pages
```
app/video-call/
├── therapy/page.tsx        # Main therapy video page
├── secure-therapy/page.tsx # Enhanced therapy page with features
└── demo/page.tsx          # Existing demo page
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
The required packages are already installed:
- `@100mslive/react-sdk`
- `@100mslive/roomkit-react`
- `@100mslive/types-prebuilt`

### 2. Configure 100ms

1. **Create 100ms Account**: Sign up at [100ms.live](https://100ms.live)

2. **Get Credentials**: From your 100ms dashboard, collect:
   - Management Token
   - Room ID  
   - Subdomain

3. **Environment Variables**: Copy `.env.example.100ms` to `.env.local`:
   ```bash
   cp .env.example.100ms .env.local
   ```

4. **Update Environment Variables**:
   ```env
   HMS_MANAGEMENT_TOKEN=your_management_token_here
   HMS_ROOM_ID=your_room_id_here 
   HMS_SUBDOMAIN=your_subdomain
   ```

### 3. Configure 100ms Dashboard

1. **Create Room Template**:
   - Go to Templates in 100ms Dashboard
   - Create a new template with these roles:
     - `therapist` (host permissions)
     - `patient` (guest permissions)

2. **Set Permissions**:
   - **Therapist**: Can publish audio/video, share screen, record, remove participants
   - **Patient**: Can publish audio/video, raise hand, chat

3. **Security Settings**:
   - Enable waiting room
   - Set maximum participants (typically 2 for therapy)
   - Configure recording settings

## 🎯 Usage

### For Development
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to video calling pages:
   - Demo: `/video-call/demo`
   - Therapy: `/video-call/therapy` 
   - Secure Therapy: `/video-call/secure-therapy`

### For Therapists
1. Access the therapy video page
2. Enter your name and select "Therapist" role
3. Share the session ID with your patient
4. Use host controls to manage the session

### For Patients  
1. Receive session ID from therapist
2. Access the therapy video page
3. Enter your name and session ID
4. Select "Patient" role and join

## 🔧 API Reference

### POST /api/100ms-token

Generates authentication tokens for video sessions.

**Request Body:**
```json
{
  "user_id": "string",
  "role": "therapist" | "patient", 
  "room_id": "string" // optional
}
```

**Response:**
```json
{
  "token": "string",
  "user_id": "string",
  "role": "string",
  "room_id": "string"
}
```

**Error Response:**
```json
{
  "error": "string"
}
```

## 🎨 Customization

### Styling
The components use TailwindCSS classes and can be customized by modifying the className props.

### Branding
Update colors, logos, and text in the component files to match your brand.

### Features
Add new features by extending the HMS hooks and actions:
- `useHMSActions` - Control session behavior
- `useHMSStore` - Access session state
- Custom selectors for specific data

## 🔒 Security Considerations

### Environment Variables
- Never commit actual credentials to version control
- Use different credentials for development/production
- Rotate tokens regularly

### Session Management
- Implement session timeouts
- Add rate limiting to token generation
- Monitor for unusual activity

### Compliance
- Ensure proper consent collection
- Implement data retention policies  
- Maintain audit logs

## 🚦 Testing

### Local Testing
1. Open multiple browser tabs/windows
2. Join as different roles (therapist/patient)
3. Test all features (audio, video, controls)

### Multi-User Testing
1. Share your local development URL (using ngrok or similar)
2. Have others join as different participants
3. Test real network conditions

## 📱 Mobile Support

The interface is fully responsive and works on:
- iOS Safari 14+
- Android Chrome 80+
- Mobile browsers with WebRTC support

### Mobile-Specific Features
- Touch-friendly controls
- Optimized layouts for small screens
- Battery usage optimization

## 🔍 Troubleshooting

### Common Issues

**Token Generation Fails:**
- Check environment variables are set correctly
- Verify 100ms credentials in dashboard
- Ensure API route is accessible

**Video/Audio Not Working:**
- Check browser permissions for camera/microphone
- Verify HTTPS is used (required for WebRTC)
- Test with different browsers

**Connection Issues:**
- Check network connectivity
- Verify firewall settings allow WebRTC
- Test with different networks

### Debug Mode
Add debug logging by setting:
```env
NODE_ENV=development
```

## 📈 Performance

### Optimization Tips
- Use appropriate video quality settings
- Implement connection quality monitoring
- Add retry logic for failed connections
- Cache tokens appropriately

### Monitoring
- Track session success rates
- Monitor video quality metrics
- Log connection failures

## 🤝 Integration with TheraBook

The video calling system integrates with the existing TheraBook features:

### Booking Integration
- Link video sessions to appointments
- Auto-generate session IDs from bookings
- Send session links via email/SMS

### User Management
- Sync with existing user accounts
- Inherit user roles and permissions
- Maintain session history

### Billing Integration
- Track session duration for billing
- Generate session reports
- Export usage data

## 📚 Additional Resources

- [100ms Documentation](https://docs.100ms.live)
- [React SDK Reference](https://docs.100ms.live/react/v2/how-to-guides/install-the-sdk/react)
- [HIPAA Compliance Guide](https://docs.100ms.live/security/hipaa)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review 100ms documentation
3. Contact the development team
4. Submit issues on the project repository

## 📝 License

This project is part of the TheraBook system. See the main project license for details.
