const { ResponseUtils } = require('@/lib/utils');

export async function GET() {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      return ResponseUtils.forbidden('Not available in production');
    }
    const keyIdRaw = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const keyId = keyIdRaw.trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    let sdkLoaded = false;
    try {
      require.resolve('razorpay');
      sdkLoaded = true;
    } catch {}

    const mode = keyId.startsWith('rzp_live_') ? 'live' : (keyId.startsWith('rzp_test_') ? 'test' : 'unknown');
    const maskedKey = keyId ? `${keyId.slice(0, 8)}…${keyId.slice(-4)}` : 'undefined';
    const secretLen = keySecret ? keySecret.length : 0;

    return ResponseUtils.success({
      mode,
      keyId: maskedKey,
      secretLen,
      sdkLoaded,
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (e) {
    return ResponseUtils.error('Failed to read debug info');
  }
}
