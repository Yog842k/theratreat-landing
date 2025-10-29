
import type { NextRequest } from 'next/server';
import { Idfy } from '@/lib/idfy';
const { ResponseUtils } = require('@/lib/utils');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawPan: string = String(body?.pan || '');
    const pan: string = rawPan.replace(/\s|-/g, '').toUpperCase();
    const name: string = String(body?.name || '').trim().replace(/\s+/g, ' ');
    const dob: string = String(body?.dob || '').trim();
    const forceMock: boolean = !!body?.forceMock;

    if (!pan || !name) {
      return ResponseUtils.badRequest('pan and name are required');
    }
    const panFormat = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panFormat.test(pan)) {
      return ResponseUtils.badRequest('Invalid PAN format');
    }

    const allowMockEnv = process.env.IDFY_FALLBACK_TO_MOCK === '1' || (process.env.IDFY_MODE || '').toLowerCase() === 'mock';
    if (forceMock && allowMockEnv) {
      const mock = await Idfy.verifyPanMock({ pan, name, dob });
      return ResponseUtils.success({
        nameOnCard: mock.nameOnCard,
        dobOnCard: mock.dobOnCard,
        match: mock.match,
        idfyStatus: mock.idfyStatus,
        fallbackUsed: true,
        forcedMock: true
      }, 'PAN verified (mock)');
    }

    let res = await Idfy.verifyPan({ pan, name, dob });
    if (process.env.IDFY_DEBUG === '1') {
      console.log('[IDFY][PAN][DEBUG]', res);
    }
    if (!res.ok) {
      return ResponseUtils.error(res.error || 'PAN verification failed', res.detail || '', res.httpStatus || 400, res.raw);
    }
    return ResponseUtils.success({
      nameOnCard: res.nameOnCard,
      dobOnCard: res.dobOnCard,
      match: res.match,
      provider: res.provider,
      idfyStatus: res.idfyStatus,
      raw: res.raw
    }, 'PAN verified');
  } catch (err: any) {
    return ResponseUtils.error('Server error', err?.message || '', 500);
  }
}
