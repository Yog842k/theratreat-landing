// Authentication routes
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  SIGNUP_ACCOUNT_TYPE: '/auth/signup/account-type',
  LOGOUT: '/auth/logout',
} as const;

// API routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  USER: {
    ME: '/api/user/me',
    PROFILE: '/api/user/profile',
  },
} as const;

// Dashboard routes
export const DASHBOARD_ROUTES = {
  PATIENT: '/dashboard/patient',
  THERAPIST: '/dashboard/therapist',
  PROFILE: '/profile',
} as const;

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/signup/account-type',
  '/therabook/onboarding/patient',
  '/about',
  '/contact',
  '/therabook',
  '/theralearn',
  '/therastore',
  '/theraself',
] as const;

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/therabook/smart-selector',
] as const;

// Routes that should redirect authenticated users
export const AUTH_REDIRECT_ROUTES = [
  '/auth/login',
  '/auth/signup',
] as const;

// Default redirect routes after login based on role
export const DEFAULT_REDIRECT_ROUTES = {
  patient: DASHBOARD_ROUTES.PATIENT,
  therapist: DASHBOARD_ROUTES.THERAPIST,
  admin: '/admin/dashboard',
} as const;
