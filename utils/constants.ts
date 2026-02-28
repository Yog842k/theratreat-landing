export const MESSAGES = {
  SUCCESS: {
    USER_CREATED: 'User created successfully',
    LOGIN_SUCCESS: 'Login successful',
    USER_RETRIEVED: 'User data retrieved successfully',
    APPOINTMENT_CREATED: 'Appointment created successfully',
    APPOINTMENT_UPDATED: 'Appointment updated successfully',
  },
  ERROR: {
    MISSING_FIELDS: 'Missing required fields',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_EXISTS: 'User already exists',
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Insufficient permissions',
    INVALID_TOKEN: 'Invalid or expired token',
    TOKEN_REQUIRED: 'Authorization token required',
    INTERNAL_ERROR: 'Internal server error',
  },
} as const;

export const USER_ROLES = {
  PATIENT: 'patient',
  THERAPIST: 'therapist',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
  CLINIC: 'clinic',
  ADMIN: 'admin',
  USER: 'user',
} as const;

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  BIO_MAX_LENGTH: 1000,
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  EXPIRES_IN: '24h',
  REFRESH_EXPIRES_IN: '7d',
} as const;

// Therapist Specializations
export const SPECIALIZATIONS = [
  'Anxiety Disorders',
  'Depression',
  'Trauma and PTSD',
  'Relationship Counseling',
  'Family Therapy',
  'Addiction Recovery',
  'Grief Counseling',
  'Child Psychology',
  'Adolescent Therapy',
  'Cognitive Behavioral Therapy',
  'Dialectical Behavior Therapy',
  'Mindfulness-Based Therapy',
  'Art Therapy',
  'Music Therapy',
  'Group Therapy',
] as const;

// Time Slots (in 30-minute intervals)
export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00',
] as const;

// Days of the week
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
