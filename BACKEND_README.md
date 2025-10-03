# TheraBook Backend API

A highly optimized backend API for the TheraBook therapy booking platform built with Next.js, MongoDB, and minimal dependencies.

## Architecture

### Core Technologies
- **Next.js API Routes** - Server-side API endpoints
- **MongoDB** - NoSQL database with native driver
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Node.js** - Runtime environment

### Key Features
- **Minimal Dependencies** - Only essential packages used
- **Optimized Database Queries** - Efficient MongoDB operations with indexes
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - User, Therapist, and Admin roles
- **Input Validation** - Comprehensive data validation
- **Error Handling** - Consistent error responses
- **Pagination** - Efficient data pagination
- **Database Indexes** - Optimized query performance

## Database Collections

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  userType: String, // 'user' | 'therapist' | 'admin'
  phone: String,
  isActive: Boolean,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
  
  // For therapists
  therapistProfile: {
    specializations: [String],
    experience: Number,
    qualifications: [String],
    bio: String,
    rating: Number,
    reviewCount: Number,
    availability: [Object],
    consultationFee: Number,
    isVerified: Boolean,
    isApproved: Boolean
  },
  
  // For users
  userProfile: {
    dateOfBirth: Date,
    gender: String,
    emergencyContact: Object,
    medicalHistory: [Object],
    preferences: Object
  }
}
```

### Bookings Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  therapistId: ObjectId,
  appointmentDate: Date,
  appointmentTime: String,
  sessionType: String,
  notes: String,
  status: String, // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  totalAmount: Number,
  paymentStatus: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Reviews Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  therapistId: ObjectId,
  bookingId: ObjectId,
  rating: Number, // 1-5
  comment: String,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Therapists
- `GET /api/therapists` - Get therapists with filters and pagination
- `POST /api/therapists` - Update therapist profile (therapist only)
- `GET /api/therapists/[id]` - Get therapist details

### Bookings
- `GET /api/bookings` - Get user's bookings with pagination
- `POST /api/bookings` - Create new booking (user only)
- `GET /api/bookings/[id]` - Get booking details
- `PATCH /api/bookings/[id]` - Update booking status

### Reviews
- `POST /api/reviews` - Create review (user only)

### Users
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update user profile

### Database Test
- `GET /api/test/db` - Test database connection
- `POST /api/test/db` - Initialize database (create indexes and seed data)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install mongodb bcryptjs jsonwebtoken
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   Update the environment variables:
   ```
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=therabook
  # Skip real DB (mock) for builds / preview envs
  SKIP_DB=false
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your system.

4. **Initialize Database**
   ```bash
   # Start the Next.js development server
   npm run dev
   
   # Initialize the database (creates indexes and admin user)
   curl -X POST http://localhost:3000/api/test/db
   ```

5. **Test Connection**
   ```bash
   curl http://localhost:3000/api/test/db
   ```

### (Optional) Legacy OpenSSL TLS Workaround
If you encounter TLS handshake errors on newer Node (e.g. `tlsv1 alert internal error`), you can temporarily enable the OpenSSL legacy provider:

Windows PowerShell (one session):
```powershell
setx NODE_OPTIONS "--openssl-legacy-provider"
# Restart terminal, then:
npm run dev
```
OR use the provided script (uses cross-env):
```bash
npm run dev:legacy-tls
```
Remove this once the root network / certificate issue is resolved. Do NOT rely on it in production.

## Authentication

### Register User
```javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "userType": "user", // or "therapist"
  "phone": "+1234567890"
}
```

### Login
```javascript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

### Using JWT Token
Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Database Optimization

### Indexes Created
- **Users**: email (unique), userType, isActive, specializations, rating, consultationFee
- **Bookings**: userId, therapistId, status, appointmentDate, compound indexes
- **Reviews**: therapistId, userId, bookingId (unique), createdAt

### Query Optimization
- Projection to exclude sensitive data (passwords)
- Aggregation pipelines for complex queries
- Pagination with skip/limit
- Filtering and sorting support

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Prevention**: Input sanitization
- **Role-Based Access**: User, Therapist, Admin roles

## Performance Optimizations

- **Connection Pooling**: MongoDB connection pool
- **Database Indexes**: Optimized query performance
- **Minimal Dependencies**: Reduced bundle size
- **Efficient Queries**: Optimized MongoDB operations
- **Pagination**: Memory-efficient data loading
- **Caching Ready**: Structure supports Redis integration

## Error Handling

Consistent error response format:
```javascript
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Development Tools

### Database Testing
```bash
# Test connection
GET /api/test/db

# Initialize database
POST /api/test/db
```

### Admin Account
Default admin credentials:
- Email: admin@therabook.com
- Password: Admin123!

## Scaling Considerations

1. **Database Sharding**: MongoDB supports horizontal scaling
2. **Caching Layer**: Redis can be added for session management
3. **Load Balancing**: Multiple Next.js instances can be deployed
4. **CDN Integration**: Static assets can be served via CDN
5. **Database Replication**: MongoDB replica sets for high availability

## Best Practices Implemented

- **Separation of Concerns**: Modular code structure
- **Environment Configuration**: Secure configuration management
- **Error Logging**: Comprehensive error logging
- **Input Validation**: Client and server-side validation
- **Security Headers**: CORS and security headers
- **API Versioning Ready**: Structure supports API versioning
- **Documentation**: Comprehensive API documentation

## Notification Testing (SNS Only)

Development tooling for testing SMS notifications without running a full payment flow:

### API Endpoint
`POST /api/notifications/test`

Body JSON fields:
- `userPhone` (required, E.164: +15551234567)
- `roomCode` (optional) – builds meeting link if `meetingUrl` not provided
- `meetingUrl` (optional override)
- `userName`, `therapistName`, `sessionType`, `timeSlot` (optional metadata)

Response includes:
```
{
  success: true,
  bookingId: "TEST-...",
  result: {
    smsDirect: true|false,
    smsTopic: true|false,
    errors: [ ... ]
  }
}
```

Disabled automatically when `NODE_ENV=production` (returns 403).

### Test Page
`/notifications-test` – Form UI that posts to the test endpoint.

### Required Environment
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
# Optional broadcast fan-out
# SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:booking-updates
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Security
Remove or guard this endpoint/page before production deployment. They are for development verification only.
