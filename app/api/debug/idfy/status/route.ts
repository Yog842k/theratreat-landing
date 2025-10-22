import type { NextRequest } from 'next/server';
const { ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  try {
    const mode = (process.env.IDFY_MODE || '').toLowerCase() || 'real';
    const allowMock = process.env.IDFY_FALLBACK_TO_MOCK === '1';
    const base = process.env.IDFY_BASE_URL || 'https://eve.idfy.com/v3';
    const endpoint = process.env.IDFY_PAN_ENDPOINT || '/tasks/async/verify_with_source/ind_pan';
    const bankEndpoint = process.env.IDFY_BANK_ENDPOINT || '(auto-detect)';
    const bankDefaultEndpoints = [
      '/tasks/async/verify_with_source/ind_bank_account',
      '/tasks/async/verify_with_source/ind_bank_account_name',
      '/tasks/async/verify_with_source/ind_bank_account_v2',
      '/tasks/async/ind_bank_account',
      '/tasks/verify_with_source/ind_bank_account'
    ];
    const hasBasic = Boolean(process.env.IDFY_CLIENT_ID && process.env.IDFY_CLIENT_SECRET);
    const hasHeader = Boolean(process.env.IDFY_API_KEY);
    const hasCreds = hasBasic || hasHeader;
    const authStyle = hasHeader ? 'header' : (hasBasic ? 'basic' : 'none');
    return ResponseUtils.success({ mode, allowMock, base, endpoint, bankEndpoint, bankDefaultEndpoints, hasCreds, authStyle, hasBasic, hasHeader });
  } catch (err: any) {
    return ResponseUtils.error('Failed to read IDfy config', 500, err?.message);
  }
}
