import { NextRequest, NextResponse } from 'next/server';
const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
const { ObjectId } = require('mongodb');

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Check if user already exists
    const existingUser = await database.findOne('users', { email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 400 }
      );
    }

    // Create test user
    const hashedPassword = await AuthUtils.hashPassword(password);
    const user = {
      name,
      email,
      password: hashedPassword,
      userType: 'user',
      userProfile: {
        dateOfBirth: '1995-06-15',
        gender: 'female',
        address: '123 Main Street, Mumbai, Maharashtra 400001',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        currentMedications: 'None',
        emergencyContact: {
          name: 'Emergency Contact',
          phone: '+91 9876543210',
          relationship: 'Parent'
        }
      },
      preferences: {
        language: 'English',
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        privacy: {
          profileVisibility: 'private',
          shareHealthData: false
        }
      },
      kycStatus: 'Verified',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await database.insertOne('users', user);
    
    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      userId: result.insertedId
    });

  } catch (error: any) {
    console.error('Test user creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create test user' },
      { status: 500 }
    );
  }
}
