import { NextRequest, NextResponse } from 'next/server';
const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const AuthUtils = require('@/lib/auth');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');

export async function GET(request: NextRequest) {
  try {
    const user = await AuthMiddleware.authenticate(request);

    // Get user with profile data
    const userData = await database.findOne('users', {
      _id: new ObjectId(user._id)
    }, {
      projection: { password: 0 }
    });

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch profile' },
      { status: error.message === 'Authentication failed' ? 401 : 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await AuthMiddleware.authenticate(request);
    const body = await request.json();

    const {
      name,
      phone,
      userProfile,
      preferences,
      currentPassword,
      newPassword
    } = body;

    const updateData: any = { updatedAt: new Date() };

    // Basic profile updates
    if (name) {
      updateData.name = ValidationUtils.sanitizeString(name);
    }

    if (phone) {
      if (!ValidationUtils.validatePhone(phone)) {
        return NextResponse.json(
          { success: false, message: 'Invalid phone number format' },
          { status: 400 }
        );
      }
      updateData.phone = phone;
    }

    // User profile updates (support 'user' and 'patient' roles)
    if (userProfile && (user.userType === 'user' || user.userType === 'patient')) {
      if (userProfile.dateOfBirth) {
        updateData['userProfile.dateOfBirth'] = userProfile.dateOfBirth;
      }
      if (userProfile.gender) {
        updateData['userProfile.gender'] = userProfile.gender;
      }
      // Location details
      if (userProfile.address) {
        updateData['userProfile.address'] = ValidationUtils.sanitizeString(userProfile.address);
      }
      if (userProfile.city) {
        updateData['userProfile.city'] = ValidationUtils.sanitizeString(userProfile.city);
      }
      if (userProfile.state) {
        updateData['userProfile.state'] = ValidationUtils.sanitizeString(userProfile.state);
      }
      if (userProfile.country) {
        updateData['userProfile.country'] = ValidationUtils.sanitizeString(userProfile.country);
      }
      if (userProfile.pinCode) {
        updateData['userProfile.pinCode'] = ValidationUtils.sanitizeString(userProfile.pinCode);
      }

      // Preferences
      if (userProfile.preferredLanguage) {
        updateData['userProfile.preferredLanguage'] = ValidationUtils.sanitizeString(userProfile.preferredLanguage);
      }
      if (Array.isArray(userProfile.preferredLanguages)) {
        updateData['userProfile.preferredLanguages'] = userProfile.preferredLanguages
          .filter((s: any) => typeof s === 'string' && s.trim().length)
          .map((s: string) => ValidationUtils.sanitizeString(s));
        // Also set preferredLanguage to the first selected for backward compatibility
        if (userProfile.preferredLanguages.length) {
          updateData['userProfile.preferredLanguage'] = ValidationUtils.sanitizeString(userProfile.preferredLanguages[0]);
        }
      }
      if (userProfile.seekingTherapy) {
        updateData['userProfile.seekingTherapy'] = ValidationUtils.sanitizeString(userProfile.seekingTherapy);
      }
      if (userProfile.preferredTherapistGender) {
        updateData['userProfile.preferredTherapistGender'] = ValidationUtils.sanitizeString(userProfile.preferredTherapistGender);
      }
      if (Array.isArray(userProfile.preferredTimeSlots)) {
        updateData['userProfile.preferredTimeSlots'] = userProfile.preferredTimeSlots.map((s: string) => ValidationUtils.sanitizeString(s));
      }

      // Health information
      if (userProfile.medicalHistory) {
        updateData['userProfile.medicalHistory'] = ValidationUtils.sanitizeString(userProfile.medicalHistory);
      }
      if (userProfile.allergies) {
        updateData['userProfile.allergies'] = ValidationUtils.sanitizeString(userProfile.allergies);
      }
      if (userProfile.currentMedications) {
        updateData['userProfile.currentMedications'] = ValidationUtils.sanitizeString(userProfile.currentMedications);
      }
      if (userProfile.previousTherapyExperience) {
        updateData['userProfile.previousTherapyExperience'] = ValidationUtils.sanitizeString(userProfile.previousTherapyExperience);
      }
      if (typeof userProfile.reasonForTherapy === 'string') {
        updateData['userProfile.reasonForTherapy'] = ValidationUtils.sanitizeString(userProfile.reasonForTherapy);
      }
      if (typeof userProfile.diagnosedConditions === 'string') {
        updateData['userProfile.diagnosedConditions'] = ValidationUtils.sanitizeString(userProfile.diagnosedConditions);
      }
      if (userProfile.disabilitySupport) {
        updateData['userProfile.disabilitySupport'] = ValidationUtils.sanitizeString(userProfile.disabilitySupport);
      }
      
      if (userProfile.emergencyContact) {
        updateData['userProfile.emergencyContact'] = {
          name: ValidationUtils.sanitizeString(userProfile.emergencyContact.name || ''),
          phone: userProfile.emergencyContact.phone || '',
          relationship: ValidationUtils.sanitizeString(userProfile.emergencyContact.relationship || '')
        };
      }

      // Consents
      if (userProfile.consents && typeof userProfile.consents === 'object') {
        const consents = userProfile.consents as any;
        if (typeof consents.smsEmail === 'boolean') {
          updateData['userProfile.consents.smsEmail'] = consents.smsEmail;
        }
        if (typeof consents.terms === 'boolean') {
          updateData['userProfile.consents.terms'] = consents.terms;
        }
        if (typeof consents.informationAccuracy === 'boolean') {
          updateData['userProfile.consents.informationAccuracy'] = consents.informationAccuracy;
        }
        if (typeof consents.responsibleUse === 'boolean') {
          updateData['userProfile.consents.responsibleUse'] = consents.responsibleUse;
        }
        if (typeof consents.emergencyDisclaimer === 'boolean') {
          updateData['userProfile.consents.emergencyDisclaimer'] = consents.emergencyDisclaimer;
        }
      }

      // Onboarding status
      if (typeof userProfile.onboardingCompleted === 'boolean') {
        updateData['userProfile.onboardingCompleted'] = userProfile.onboardingCompleted;
      }
    }

    // Preferences updates
    if (preferences) {
      if (preferences.notifications) {
        updateData['preferences.notifications'] = preferences.notifications;
      }
      if (preferences.privacy) {
        updateData['preferences.privacy'] = preferences.privacy;
      }
      if (preferences.language) {
        updateData['preferences.language'] = preferences.language;
      }
    }

    // Password update
    if (currentPassword && newPassword) {
      const userData = await database.findOne('users', {
        _id: new ObjectId(user._id)
      });

      if (!userData) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      const isCurrentPasswordValid = await AuthUtils.comparePassword(
        currentPassword,
        userData.password
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      if (!ValidationUtils.validatePassword(newPassword)) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 8 characters with uppercase, lowercase, and number' },
          { status: 400 }
        );
      }

      const hashedNewPassword = await AuthUtils.hashPassword(newPassword);
      updateData.password = hashedNewPassword;
    }

    const result = await database.updateOne('users',
      { _id: new ObjectId(user._id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
