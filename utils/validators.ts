import { z } from 'zod';
import { VALIDATION, USER_ROLES, SPECIALIZATIONS } from './constants';

// User Registration Schema
export const signupSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(VALIDATION.EMAIL_MAX_LENGTH, 'Email is too long'),
  password: z
    .string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .max(VALIDATION.PASSWORD_MAX_LENGTH, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  name: z
    .string()
    .min(VALIDATION.NAME_MIN_LENGTH, 'Name is too short')
    .max(VALIDATION.NAME_MAX_LENGTH, 'Name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  role: z.enum([
    USER_ROLES.PATIENT, 
    USER_ROLES.THERAPIST, 
    USER_ROLES.INSTRUCTOR,
    USER_ROLES.STUDENT,
    USER_ROLES.CLINIC,
    USER_ROLES.USER // legacy support
  ] as const),
});

// User Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(VALIDATION.EMAIL_MAX_LENGTH, 'Email is too long'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

// Therapist Profile Schema
export const therapistProfileSchema = z.object({
  specialization: z
    .array(z.enum(SPECIALIZATIONS as readonly [string, ...string[]]))
    .min(1, 'At least one specialization is required')
    .max(5, 'Maximum 5 specializations allowed'),
  licenseNumber: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 5, 'License number must be at least 5 characters'),
  yearsExperience: z
    .number()
    .int('Years of experience must be a whole number')
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience seems too high')
    .optional(),
  education: z
    .string()
    .max(500, 'Education description is too long')
    .optional(),
  bio: z
    .string()
    .max(VALIDATION.BIO_MAX_LENGTH, 'Bio is too long')
    .optional(),
  hourlyRate: z
    .number()
    .positive('Hourly rate must be positive')
    .max(1000, 'Hourly rate seems too high')
    .optional(),
});

// Patient Profile Schema
export const patientProfileSchema = z.object({
  dateOfBirth: z
    .string()
    .datetime('Invalid date format')
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 13 && age <= 120;
    }, 'Age must be between 13 and 120 years'),
  emergencyContact: z
    .string()
    .max(200, 'Emergency contact information is too long')
    .optional(),
  medicalHistory: z
    .string()
    .max(2000, 'Medical history is too long')
    .optional(),
});

// Appointment Schema
export const appointmentSchema = z.object({
  therapistId: z.string().cuid('Invalid therapist ID'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  notes: z
    .string()
    .max(500, 'Notes are too long')
    .optional(),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end > start;
}, 'End time must be after start time');

// Availability Schema
export const availabilitySchema = z.object({
  dayOfWeek: z
    .number()
    .int('Day of week must be an integer')
    .min(0, 'Day of week must be between 0 and 6')
    .max(6, 'Day of week must be between 0 and 6'),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
}).refine((data) => {
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return endMinutes > startMinutes;
}, 'End time must be after start time');

// Type exports for TypeScript
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TherapistProfileInput = z.infer<typeof therapistProfileSchema>;
export type PatientProfileInput = z.infer<typeof patientProfileSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;

// Validation helper functions
export const validateSignup = (data: unknown) => signupSchema.safeParse(data);
export const validateLogin = (data: unknown) => loginSchema.safeParse(data);
export const validateTherapistProfile = (data: unknown) => therapistProfileSchema.safeParse(data);
export const validatePatientProfile = (data: unknown) => patientProfileSchema.safeParse(data);
export const validateAppointment = (data: unknown) => appointmentSchema.safeParse(data);
export const validateAvailability = (data: unknown) => availabilitySchema.safeParse(data);
