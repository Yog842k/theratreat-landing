import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
const database = require('@/lib/database');
const { ResponseUtils, ValidationUtils } = require('@/lib/utils');
let AuthMiddleware = require('@/lib/middleware');
if (AuthMiddleware && AuthMiddleware.default && !AuthMiddleware.requireRole) {
  AuthMiddleware = AuthMiddleware.default;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * API endpoint to create or update Razorpay sub-account for therapists/clinics
 * POST /api/payments/razorpay/create-subaccount
 * Body: { type: 'therapist' | 'clinic', entityId: string, bankDetails: {...} }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate - only therapists and clinic owners can create their own sub-accounts
    let user: any;
    try {
      user = await AuthMiddleware.requireRole(request, ['therapist', 'clinic-owner']);
    } catch (e: any) {
      return ResponseUtils.errorCode('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const body = await request.json();
    const { type, entityId, bankDetails } = body;

    if (!type || !['therapist', 'clinic'].includes(type)) {
      return ResponseUtils.badRequest('type must be "therapist" or "clinic"');
    }

    if (!entityId || !ValidationUtils.validateObjectId(entityId)) {
      return ResponseUtils.badRequest('Valid entityId (ObjectId) is required');
    }

    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName) {
      return ResponseUtils.badRequest('Bank details (accountNumber, ifscCode, accountHolderName) are required');
    }

    // Verify entity belongs to user
    let entity: any = null;
    if (type === 'therapist') {
      entity = await database.findOne('therapists', { _id: new ObjectId(entityId), userId: new ObjectId(user._id) });
      if (!entity) {
        return ResponseUtils.forbidden('Therapist not found or access denied');
      }
    } else if (type === 'clinic') {
      // For clinics, check if user is the owner
      const clinic = await database.findOne('clinics', { _id: new ObjectId(entityId) });
      if (!clinic) {
        return ResponseUtils.notFound('Clinic not found');
      }
      const ownerUser = await database.findOne('users', { email: clinic.owner.email, userType: 'clinic-owner' });
      if (!ownerUser || ownerUser._id.toString() !== user._id.toString()) {
        return ResponseUtils.forbidden('Access denied - you are not the clinic owner');
      }
      entity = clinic;
    }

    if (!entity) {
      return ResponseUtils.notFound(`${type} not found`);
    }

    // Import sub-account creation utility
    const { createRazorpaySubAccount, updateRazorpaySubAccount } = await import('@/lib/razorpay-subaccount');

    // Check if sub-account already exists
    const existingAccountId = entity.razorpayAccountId;
    let subAccount: any = null;

    if (existingAccountId) {
      // Update existing sub-account
      console.log('[RZP][CREATE-SUBACCOUNT] Updating existing sub-account:', existingAccountId);
      const updated = await updateRazorpaySubAccount(existingAccountId, bankDetails);
      if (updated) {
        subAccount = {
          id: existingAccountId,
          mode: entity.razorpayAccountMode || 'test',
          updated: true
        };
      } else {
        // If update fails, try creating a new one
        console.log('[RZP][CREATE-SUBACCOUNT] Update failed, creating new sub-account');
        subAccount = await createRazorpaySubAccount({
          name: type === 'therapist' ? entity.displayName : entity.name,
          email: user.email,
          contact: user.phone,
          bankDetails,
          type,
          entityId: entityId
        });
      }
    } else {
      // Create new sub-account
      subAccount = await createRazorpaySubAccount({
        name: type === 'therapist' ? entity.displayName : entity.name,
        email: user.email,
        contact: user.phone,
        bankDetails,
        type,
        entityId: entityId
      });
    }

    if (!subAccount || !subAccount.id) {
      return ResponseUtils.errorCode(
        'RAZORPAY_SUBACCOUNT_CREATE_FAILED',
        'Failed to create Razorpay sub-account. Please check bank details and try again.',
        500
      );
    }

    // Update entity with sub-account ID
    const updateData: any = {
      razorpayAccountId: subAccount.id,
      razorpayAccountMode: subAccount.mode,
      razorpayAccountLinkedAt: new Date(),
      updatedAt: new Date()
    };

    if (type === 'therapist') {
      await database.updateOne('therapists', { _id: new ObjectId(entityId) }, { $set: updateData });
    } else {
      await database.updateOne('clinics', { _id: new ObjectId(entityId) }, { $set: updateData });
    }

    return ResponseUtils.success({
      subAccount: {
        id: subAccount.id,
        mode: subAccount.mode,
        updated: subAccount.updated || false
      },
      message: subAccount.updated ? 'Sub-account updated successfully' : 'Sub-account created successfully'
    });
  } catch (error: any) {
    console.error('[RZP][CREATE-SUBACCOUNT] Error:', error);
    return ResponseUtils.errorCode(
      'RAZORPAY_SUBACCOUNT_ERROR',
      'Failed to process sub-account request',
      500,
      process.env.NODE_ENV !== 'production' ? error?.message : undefined
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      success: false,
      code: 'METHOD_NOT_ALLOWED',
      message: 'Use POST to create/update a Razorpay sub-account'
    }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}

