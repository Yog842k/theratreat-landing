// Helper to create a Razorpay customer safely.
// Will no-op (return null) if credentials missing or creation fails.
// Requires server runtime.
// @ts-ignore - runtime import
import Razorpay from 'razorpay';
import { getCredentials } from '@/lib/razorpay-creds';

export interface CreatedCustomer {
  id: string;
  mode: string;
  email?: string;
  contact?: string;
}

export async function createRazorpayCustomer(params: { name?: string; email?: string; contact?: string; notes?: Record<string,string>; }): Promise<CreatedCustomer | null> {
  try {
    const creds = getCredentials();
    if (!creds) return null;
    const rzp: any = new Razorpay({ key_id: creds.keyId, key_secret: creds.keySecret });
    const customer = await rzp.customers.create({
      name: params.name?.slice(0, 200),
      email: params.email?.toLowerCase(),
      contact: params.contact?.slice(0, 20),
      notes: params.notes || {}
    });
    return { id: customer.id, mode: creds.mode, email: customer.email, contact: customer.contact };
  } catch (e) {
    console.warn('Razorpay customer creation skipped:', (e as any)?.message);
    return null;
  }
}

export default createRazorpayCustomer;
