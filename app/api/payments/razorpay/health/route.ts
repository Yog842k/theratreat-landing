import type { NextRequest } from 'next/server';
import { selectMode, getCredentials, validatePrefix, isWeakSecret, isSimulationEnabled } from '@/lib/razorpay-creds';
// Re-use existing utils pattern for consistent response envelope
const { ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function mask(val: string | undefined) {
  if (!val) return '';
  return val.length > 12 ? `${val.slice(0, 6)}…${val.slice(-4)}` : val;
}

export async function GET(_req: NextRequest) {
  try {
    const mode = selectMode();
    const creds = getCredentials();
    const keyId = creds?.keyId || '';
    const secret = creds?.keySecret || '';
    const publicKey = creds?.publicKey || keyId;
    const prefixIssue = keyId ? validatePrefix(keyId, mode) : null; // validatePrefix internally respects bypass flag now

  // Evaluate underlying weakness ignoring bypass (so we can tell if bypass is masking an issue)
  const configuredMinRaw = Number(process.env.RAZORPAY_SECRET_MIN || '');
  const min = Number.isFinite(configuredMinRaw) && configuredMinRaw > 0 ? configuredMinRaw : 25;
  const rawLength = (secret || '').trim().length;
  const lengthWeak = rawLength < min;
  const heuristicAllowed = rawLength >= 20 && rawLength < min && /[a-zA-Z]/.test(secret || '') && /\d/.test(secret || '');
  const underlyingWeak = !secret || (lengthWeak && !heuristicAllowed);
  const bypassWeak = process.env.RAZORPAY_ALLOW_WEAK === '1';
    const bypassPrefix = process.env.RAZORPAY_ALLOW_PREFIX_MISMATCH === '1';
    const effectiveWeak = bypassWeak ? false : underlyingWeak;
    const simulation = isSimulationEnabled();

    const data: any = {
      mode,
      configured: !!(keyId && secret),
      keyIdMasked: mask(keyId),
      publicKeyMasked: mask(publicKey),
      secretLength: secret.length,
      prefixValid: !prefixIssue,
      prefixIssue: prefixIssue || undefined,
  effectiveWeakSecret: effectiveWeak,
  underlyingWeakSecret: underlyingWeak,
  secretMinRequired: min,
  secretHeuristicAllowed: heuristicAllowed,
      bypass: {
        allowWeak: bypassWeak,
        allowPrefixMismatch: bypassPrefix,
        simulated: simulation
      },
      timestamp: new Date().toISOString()
    };

    const warnings: string[] = [];
    if (!data.configured) warnings.push('NO_CREDENTIALS');
  if (underlyingWeak && bypassWeak) warnings.push('WEAK_SECRET_MASKED_BY_BYPASS');
  if (!underlyingWeak && lengthWeak && heuristicAllowed) warnings.push('WEAK_LENGTH_BUT_HEURISTIC_ACCEPTED');
    if (prefixIssue && bypassPrefix) warnings.push('PREFIX_ISSUE_MASKED_BY_BYPASS');
    if (simulation) warnings.push('SIMULATION_ENABLED');
    if (process.env.NODE_ENV === 'production' && (bypassWeak || bypassPrefix)) {
      warnings.push('BYPASS_ACTIVE_IN_PRODUCTION');
    }
    if (warnings.length) data.warnings = warnings;

    if (process.env.NODE_ENV !== 'production') {
      data.dev = {
        hasTestPair: !!(process.env.RAZORPAY_TEST_KEY_ID && process.env.RAZORPAY_TEST_KEY_SECRET),
        hasLivePair: !!(process.env.RAZORPAY_LIVE_KEY_ID && process.env.RAZORPAY_LIVE_KEY_SECRET),
        hasLegacyPair: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
        allowWeakEnv: process.env.RAZORPAY_ALLOW_WEAK,
        allowPrefixMismatchEnv: process.env.RAZORPAY_ALLOW_PREFIX_MISMATCH,
        simulatedVar: process.env.RAZORPAY_SIMULATED
      };
    }

    return ResponseUtils.success(data, 'Health OK');
  } catch (e: any) {
    return ResponseUtils.error(`Health check failed: ${e?.message || 'unknown'}`, 500);
  }
}
