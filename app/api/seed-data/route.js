import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Therapist from '@/lib/models/Therapist';
import { hashPassword } from '@/lib/authUtils';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await connectDB();
    
    // Sample user data for therapists
    const therapistUsers = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@therabook.com',
        password: await hashPassword('password123'),
        userType: 'therapist',
        phone: '+91-9876543210',
        isVerified: true
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@therabook.com',
        password: await hashPassword('password123'),
        userType: 'therapist',
        phone: '+91-9876543211',
        isVerified: true
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@therabook.com',
        password: await hashPassword('password123'),
        userType: 'therapist',
        phone: '+91-9876543212',
        isVerified: true
      }
    ];

    // Create users first
    const createdUsers = [];
    for (const userData of therapistUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
      } else {
        createdUsers.push(existingUser);
      }
    }

    // Sample therapist profiles
    const therapistProfiles = [
      {
        userId: createdUsers[0]._id,
        displayName: 'Dr. Sarah Johnson',
        title: 'Licensed Clinical Psychologist',
        specializations: ['Anxiety Disorders', 'Depression', 'Cognitive Behavioral Therapy'],
        experience: 8,
        education: [
          { degree: 'PhD in Clinical Psychology', institution: 'Harvard University', year: 2015 },
          { degree: 'MA in Psychology', institution: 'Stanford University', year: 2012 }
        ],
        consultationFee: 2500,
        sessionTypes: ['video', 'audio', 'in-clinic'],
        languages: ['English', 'Hindi'],
        location: 'Mumbai, Maharashtra',
        bio: 'Experienced psychologist specializing in anxiety and depression treatment with CBT approaches.',
        rating: 4.8,
        reviewCount: 127,
        totalSessions: 340,
        isVerified: true
      },
      {
        userId: createdUsers[1]._id,
        displayName: 'Dr. Michael Chen',
        title: 'Psychiatrist & Therapist',
        specializations: ['ADHD', 'Autism Spectrum', 'Child Psychology'],
        experience: 12,
        education: [
          { degree: 'MD Psychiatry', institution: 'AIIMS Delhi', year: 2012 },
          { degree: 'MBBS', institution: 'MAMC Delhi', year: 2008 }
        ],
        consultationFee: 3000,
        sessionTypes: ['video', 'in-clinic'],
        languages: ['English', 'Mandarin', 'Hindi'],
        location: 'Delhi, NCR',
        bio: 'Specialist in child and adolescent psychiatry with focus on neurodevelopmental disorders.',
        rating: 4.9,
        reviewCount: 89,
        totalSessions: 256,
        isVerified: true
      },
      {
        userId: createdUsers[2]._id,
        displayName: 'Dr. Priya Sharma',
        title: 'Marriage & Family Therapist',
        specializations: ['Relationship Therapy', 'Family Counseling', 'Trauma Recovery'],
        experience: 6,
        education: [
          { degree: 'MA in Marriage & Family Therapy', institution: 'Tata Institute', year: 2018 },
          { degree: 'BA Psychology', institution: 'Delhi University', year: 2016 }
        ],
        consultationFee: 2000,
        sessionTypes: ['video', 'audio', 'in-clinic'],
        languages: ['English', 'Hindi', 'Punjabi'],
        location: 'Bangalore, Karnataka',
        bio: 'Dedicated to helping couples and families build stronger, healthier relationships.',
        rating: 4.7,
        reviewCount: 94,
        totalSessions: 198,
        isVerified: true
      }
    ];

    // Create therapist profiles
    const createdTherapists = [];
    for (const therapistData of therapistProfiles) {
      const existingTherapist = await Therapist.findOne({ userId: therapistData.userId });
      if (!existingTherapist) {
        const therapist = new Therapist(therapistData);
        await therapist.save();
        createdTherapists.push(therapist);
      } else {
        createdTherapists.push(existingTherapist);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully!',
      data: {
        users: createdUsers.length,
        therapists: createdTherapists.length
      }
    });

  } catch (error) {
    console.error('Seed data error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to seed data',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
