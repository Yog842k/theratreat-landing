// Helper to create Razorpay sub-accounts (connected accounts) for therapists and clinics
// This enables split payments where funds are automatically distributed
// @ts-ignore - runtime import
import Razorpay from 'razorpay';
import { getCredentials } from '@/lib/razorpay-creds';

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName?: string;
  upiId?: string;
}

export interface SubAccountParams {
  name: string;
  email: string;
  contact?: string;
  bankDetails: BankDetails;
  type: 'therapist' | 'clinic';
  entityId: string; // therapistId or clinicId
}

export interface CreatedSubAccount {
  id: string; // Razorpay account ID (acc_XXXX)
  mode: 'test' | 'live';
  email?: string;
  contact?: string;
}

/**
 * Creates a Razorpay connected account (sub-account) for split payments
 * This account will receive a portion of payments automatically
 */
export async function createRazorpaySubAccount(params: SubAccountParams): Promise<CreatedSubAccount | null> {
  try {
    const creds = getCredentials();
    if (!creds) {
      console.warn('[RZP][SUBACCOUNT] No Razorpay credentials available');
      return null;
    }

    const rzp: any = new Razorpay({ key_id: creds.keyId, key_secret: creds.keySecret });

    // Prepare account data for Razorpay
    const accountData: any = {
      email: params.email.toLowerCase(),
      phone: params.contact?.replace(/\D/g, '').slice(0, 10) || undefined,
      legal_business_name: params.name.slice(0, 200),
      business_type: 'individual', // For therapists, can be 'partnership' for clinics
      customer_facing_business_name: params.name.slice(0, 200),
      profile: {
        category: 'healthcare',
        subcategory: params.type === 'therapist' ? 'therapy' : 'clinic',
        description: `${params.type === 'therapist' ? 'Therapist' : 'Clinic'} account for ${params.name}`
      },
      notes: {
        type: params.type,
        entityId: params.entityId,
        createdVia: 'therabook-platform'
      }
    };

    // Add bank account details
    if (params.bankDetails.accountNumber && params.bankDetails.ifscCode) {
      accountData.accounts = {
        bank_account: {
          name: params.bankDetails.accountHolderName.slice(0, 100),
          number: params.bankDetails.accountNumber.replace(/\D/g, ''),
          ifsc: params.bankDetails.ifscCode.toUpperCase().replace(/\s/g, ''),
          type: 'savings' // Default to savings, can be made configurable
        }
      };
    }

    // Create the connected account
    const account = await rzp.accounts.create(accountData);

    if (!account || !account.id) {
      console.error('[RZP][SUBACCOUNT] Account creation returned invalid response:', account);
        return null;
      }

    return {
      id: account.id,
      mode: creds.mode,
      email: account.email,
      contact: account.phone
    };
  } catch (e: any) {
    const errorMsg = e?.error?.description || e?.message || 'Unknown error';
    console.error('[RZP][SUBACCOUNT] Failed to create sub-account:', {
      type: params.type,
      entityId: params.entityId,
      error: errorMsg,
      details: e?.error
    });
    
    // Don't throw - return null so registration can continue
    // The sub-account can be created later
    return null;
  }
}

/**
 * Updates an existing Razorpay sub-account with new bank details
 */
export async function updateRazorpaySubAccount(
  accountId: string,
  bankDetails: BankDetails
): Promise<boolean> {
  try {
    const creds = getCredentials();
    if (!creds) return false;

    const rzp: any = new Razorpay({ key_id: creds.keyId, key_secret: creds.keySecret });

    const updateData: any = {
      accounts: {
        bank_account: {
          name: bankDetails.accountHolderName.slice(0, 100),
          number: bankDetails.accountNumber.replace(/\D/g, ''),
          ifsc: bankDetails.ifscCode.toUpperCase().replace(/\s/g, ''),
          type: 'savings'
        }
      }
    };

    await rzp.accounts.edit(accountId, updateData);
    return true;
  } catch (e: any) {
    console.error('[RZP][SUBACCOUNT] Failed to update sub-account:', {
      accountId,
      error: e?.error?.description || e?.message
    });
    return false;
  }
}

export default createRazorpaySubAccount;

