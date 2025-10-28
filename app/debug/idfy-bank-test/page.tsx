
"use client";
import React, { useState } from 'react';

export default function IDfyBankTestPage() {
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [name, setName] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleProbe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);
    try {
      const res = await fetch('/api/debug/idfy/probe-bank');
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError('Error running probe.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>IDfy Bank Verification Test</h2>
      <form onSubmit={handleProbe} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button type="submit" disabled={loading}>
          {loading ? 'Probing...' : 'Probe Bank Verification Endpoint'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      {response && (
        <pre style={{ marginTop: 24, background: '#f9f9f9', padding: 16, borderRadius: 4 }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
      <div style={{ marginTop: 32, fontSize: 14, color: '#666' }}>
        <p>Make sure your environment variables for IDfy are set correctly in Amplify or <code>.env.local</code>:</p>
        <ul>
          <li><code>IDFY_BANK_ENDPOINT</code></li>
          <li><code>IDFY_API_KEY</code></li>
          <li><code>IDFY_API_SECRET</code></li>
        </ul>
  <p>This page calls <code>/api/debug/idfy/probe-bank</code> (GET) to auto-detect and test the bank verification endpoint.</p>
      </div>
    </div>
  );
}
