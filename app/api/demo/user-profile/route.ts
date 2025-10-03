import { NextRequest, NextResponse } from 'next/server';

// This is a demo endpoint to create test user data
export async function POST(request: NextRequest) {
  try {
    const demoUser = {
      _id: "demo_user_id",
      name: "Sarah Johnson",
      email: "sarah.demo@theratreat.com",
      phone: "+91 98765 43210",
      userType: "user",
      userProfile: {
        dateOfBirth: "1995-06-15",
        gender: "female",
        address: "123 Main Street, Andheri West, Mumbai, Maharashtra 400058",
        medicalHistory: "Previous anxiety treatment in 2020. History of mild depression managed with therapy.",
        allergies: "Penicillin, Shellfish",
        currentMedications: "Vitamin D3 (1000 IU daily), Omega-3 supplements",
        emergencyContact: {
          name: "Michael Johnson",
          phone: "+91 98765 43211",
          relationship: "Spouse"
        }
      },
      preferences: {
        language: "English",
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        privacy: {
          profileVisibility: "private",
          shareHealthData: false
        }
      },
      kycStatus: "Verified",
      profilePicture: "",
      createdAt: new Date("2023-01-15"),
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      message: "Demo user data structure",
      user: demoUser
    });

  } catch (error) {
    console.error('Demo data error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create demo data' },
      { status: 500 }
    );
  }
}
