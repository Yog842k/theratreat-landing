// Diagnostic endpoint to help pinpoint Razorpay auth failures
// Does NOT expose secrets. Safe to call while debugging.
// Remove or protect before production hardening if needed.

export const runtime = 'nodejs';

export async function GET() {
  try {
    const rawKeyId = process.env.RAZORPAY_KEY_ID || '';
    const rawSecret = process.env.RAZORPAY_KEY_SECRET || '';
    const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

    const keyId = rawKeyId.trim();
    const secret = rawSecret.trim();

    const issues = [];

    if (!keyId) issues.push('RAZORPAY_KEY_ID missing');
    if (!secret) issues.push('RAZORPAY_KEY_SECRET missing');
    if (rawKeyId !== keyId) issues.push('Key ID has leading/trailing whitespace');
    if (rawSecret !== secret) issues.push('Secret has leading/trailing whitespace');

    const mode = keyId.startsWith('rzp_live_') ? 'live' : keyId.startsWith('rzp_test_') ? 'test' : 'unknown';

    // Minimal heuristic: typical secret lengths are usually > 30 chars. Report if unusually short.
    if (secret && secret.length < 25) {
      issues.push('Secret length unusually short (possible copy/paste truncation)');
    }

    let sdkAvailable = false;
    try { require.resolve('razorpay'); sdkAvailable = true; } catch {}

    // Attempt a very lightweight auth probe ONLY if both present.
    // We hit the /v1/orders with an impossible small amount and expect either validation or success auth wise.
    let authProbe = null;
    if (keyId && secret) {
      try {
        const auth = Buffer.from(`${keyId}:${secret}`).toString('base64');
        const probeRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 100, currency: 'INR', receipt: 'probe_auth_check' })
        });
        const text = await probeRes.text();
        let json = null; try { json = JSON.parse(text); } catch {}
        if (probeRes.status === 200 && json && json.id) {
          authProbe = { success: true, outcome: 'Order created (credentials valid)', orderId: json.id };
        } else if (probeRes.status === 401) {
          authProbe = { success: false, outcome: 'Authentication failed (401)', hint: 'Key/Secret pair invalid or mismatched', body: json || text };
        } else {
          // Not an auth failure; treat as partial success (e.g., validation error is still auth OK)
          const desc = json?.error?.description || json?.error?.reason || text || 'Unknown';
            if (/amount/i.test(desc) || /invalid/i.test(desc)) {
            authProbe = { success: true, outcome: 'Auth OK (received validation error)', body: json || text };
          } else {
            authProbe = { success: probeRes.status < 400, outcome: 'Non-auth response', status: probeRes.status, body: json || text };
          }
        }
      } catch (e) {
        authProbe = { success: false, outcome: 'Probe request failed', error: e.message };
      }
    }

    const maskedKey = keyId ? keyId.slice(0, 8) + '…' + keyId.slice(-4) : null;

    return new Response(JSON.stringify({
      success: true,
      mode,
      keyPresent: !!keyId,
      publicKeyMatch: publicKey && publicKey.trim() === keyId,
      secretPresent: !!secret,
      secretLength: secret ? secret.length : 0,
      sdkAvailable,
      issues,
      authProbe,
      maskedKey
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
  }
}
