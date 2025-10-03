const { ResponseUtils } = require('@/lib/utils');

// Returns only the public key for client-side Razorpay checkout.
// Never expose RAZORPAY_KEY_SECRET directly. A limited, masked debug view
// is available via ?debug=1 in non-production to help diagnose auth issues.
export async function GET(request) {
	try {
		const url = new URL(request.url);
		const debug = url.searchParams.get('debug');

		const publicKey = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '');
		const serverKey = (process.env.RAZORPAY_KEY_ID || '');
		const keyId = publicKey || serverKey; // prefer explicit NEXT_PUBLIC if present

		if (!keyId) {
			return ResponseUtils.error('Razorpay public key not configured', 500);
		}

		const payload = { keyId };

		if (debug && process.env.NODE_ENV !== 'production') {
			const secret = (process.env.RAZORPAY_KEY_SECRET || '');
			payload.debug = {
				source: publicKey ? 'NEXT_PUBLIC_RAZORPAY_KEY_ID' : 'RAZORPAY_KEY_ID',
				maskedKey: keyId.length > 12 ? `${keyId.slice(0,8)}…${keyId.slice(-4)}` : keyId,
				mode: keyId.startsWith('rzp_live_') ? 'live' : (keyId.startsWith('rzp_test_') ? 'test' : 'unknown'),
				hasSecret: !!secret,
				secretLength: secret ? secret.length : 0,
				secretPresent: !!secret,
				// Explicitly do NOT include the secret content
				envNodeEnv: process.env.NODE_ENV
			};
		}

		return ResponseUtils.success(payload);
	} catch (e) {
		console.error('Razorpay config route error:', e);
		return ResponseUtils.error('Failed to load payment config');
	}
}
