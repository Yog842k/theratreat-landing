import type { NextRequest } from 'next/server';
import { verifyAadhaar, verifyAadhaarMock } from '@/lib/idfy';
const { ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

// GET /api/kyc/verify-aadhaar
export async function GET(_request: NextRequest) {
  return ResponseUtils.success({
    usage: 'POST JSON to this endpoint to verify Aadhaar via IDfy',
    url: '/api/kyc/verify-aadhaar',
    method: 'POST',
    body: { aadhaar: '123412341234', name: 'Full Name', dob: '1990-01-01' },
    notes: [
      'Aadhaar must be 12 digits; spaces and hyphens are ignored',
      'DOB is optional (YYYY-MM-DD preferred; DD/MM/YYYY accepted)',
      'Set IDFY_CLIENT_ID and IDFY_CLIENT_SECRET or IDFY_API_KEY on the server',
      'Set IDFY_MODE=mock to use mock responses (or fallback when not configured)'
    ]
  }, 'Use POST to verify Aadhaar');
}

// POST /api/kyc/verify-aadhaar
// Body: { aadhaar: string, name: string, dob?: string, forceMock?: boolean }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawAadhaar: string = String(body?.aadhaar || '');
    const aadhaar: string = rawAadhaar.replace(/[\s-]/g, '');
    const name: string = String(body?.name || '').trim().replace(/\s+/g, ' ');
    const dob: string = String(body?.dob || '').trim();
    const forceMock: boolean = !!body?.forceMock;

    if (!aadhaar || !name) {
      return ResponseUtils.badRequest('aadhaar and name are required');
    }
    if (!/^\d{12}$/.test(aadhaar)) {
      return ResponseUtils.badRequest('Invalid Aadhaar format');
    }

    const allowMockEnv = (process.env.IDFY_MODE || '').toLowerCase() === 'mock' || process.env.IDFY_FALLBACK_TO_MOCK === '1';

    if (forceMock && allowMockEnv) {
  const mock = await verifyAadhaarMock({ aadhaar, name, dob });
      return ResponseUtils.success({
        nameOnId: mock.nameOnId,
        dobOnId: mock.dobOnId,
        match: mock.match,
        idfyStatus: mock.idfyStatus,
        fallbackUsed: true,
        forcedMock: true
      }, 'Aadhaar verified (mock)');
    }

    let res = await verifyAadhaar({ aadhaar, name, dob });
    let fallbackUsed = false;
    if (!res.ok) {
      const rawStr = JSON.stringify(res.raw || {});
      const insufficient = rawStr.toLowerCase().includes('insufficient') || rawStr.toLowerCase().includes('no credits') || rawStr.toLowerCase().includes('balance');
      const isPayloadIssue = res.httpStatus === 400 || res.httpStatus === 422;
      if (allowMockEnv && (insufficient || isPayloadIssue)) {
        res = await verifyAadhaarMock({ aadhaar, name, dob });
        fallbackUsed = true;
      } else {
        return ResponseUtils.errorCode(res.error || 'AADHAAR_VERIFY_FAILED', res.detail || 'Failed to verify Aadhaar', res.httpStatus || 400, res);
      }
    }

    return ResponseUtils.success({
      nameOnId: res.nameOnId,
      dobOnId: res.dobOnId,
      match: res.match,
      idfyStatus: res.idfyStatus,
      fallbackUsed,
      provider: res.provider
    }, 'Aadhaar verified');
  } catch (err: any) {
    return ResponseUtils.error('Aadhaar verification failed', 500, err?.message);
  }
}
