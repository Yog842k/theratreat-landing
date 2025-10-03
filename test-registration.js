// Test the therapist registration API endpoint
async function testTherapistRegistration() {
  const testData = {
    fullName: "Dr. Test Therapist",
    email: "test.therapist@example.com",
    password: "securepassword123",
    phoneNumber: "+91 9876543210",
    gender: "female",
    dateOfBirth: "1990-01-01",
    residentialAddress: "Test Address",
    currentCity: "Mumbai",
    preferredLanguages: ["English", "Hindi"],
    panCard: "ABCDE1234F",
    aadhaar: "123456789012",
    qualification: "PhD Psychology",
    university: "Test University",
    graduationYear: "2015",
    licenseNumber: "LIC123456",
    designations: ["Clinical Psychologist"],
    primaryConditions: ["Anxiety", "Depression"],
    experience: "5 years",
    workplaces: "Test Clinic",
    onlineExperience: true,
    preferredDays: ["Monday", "Tuesday"],
    preferredTimeSlots: ["10:00 AM - 12:00 PM"],
    weeklySessions: "10-15",
    sessionDurations: ["45 minutes"],
    sessionFee: "2000",
    dynamicPricing: false,
    freeFirstSession: true,
    paymentMode: "Bank Transfer",
    bankDetails: {
      accountHolder: "Dr. Test Therapist",
      bankName: "Test Bank",
      accountNumber: "1234567890",
      ifscCode: "TEST0001234",
      upiId: "test@testbank"
    },
    hasClinic: true,
    bio: "Experienced therapist specializing in anxiety and depression.",
    linkedIn: "https://linkedin.com/in/testtherapist",
    website: "https://testtherapist.com",
    instagram: "@testtherapist",
    therapyLanguages: ["English", "Hindi"],
    agreements: {
      accuracy: true,
      verification: true,
      guidelines: true,
      confidentiality: true,
      independent: true,
      norms: true,
      conduct: true,
      terms: true,
      digitalConsent: true,
      secureDelivery: true,
      declaration: true,
      serviceAgreement: true
    },
    isCompletingRegistration: true
  };

  try {
    const response = await fetch('/api/therapist-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration test successful:', result);
      return { success: true, data: result };
    } else {
      console.error('❌ Registration test failed:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ Network error during registration test:', error);
    return { success: false, error: error.message };
  }
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  window.testTherapistRegistration = testTherapistRegistration;
}

module.exports = { testTherapistRegistration };
