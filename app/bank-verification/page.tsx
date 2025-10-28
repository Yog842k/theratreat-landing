"use client";
import React, { useState } from 'react';

export default function BankVerificationPage() {
  const [accountNumber, setAccountNumber] = useState('');
  const [accountNumberConfirm, setAccountNumberConfirm] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountName, setAccountName] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setStatus('');
    if (accountNumber !== accountNumberConfirm) {
      setError('Account numbers do not match. Please re-enter.');
      return;
    }
    setStatus('Account numbers match.');
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Bank Verification</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          placeholder="Account Number"
          value={accountNumber}
          onChange={e => setAccountNumber(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Re-enter Account Number"
          value={accountNumberConfirm}
          onChange={e => setAccountNumberConfirm(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="IFSC Code"
          value={ifsc}
          onChange={e => setIfsc(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Account Holder Name"
          value={accountName}
          onChange={e => setAccountName(e.target.value)}
          required
        />
        <label style={{ fontSize: 14 }}>
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required />
          I confirm the above details are correct and consent to their use for payouts.
        </label>
        <button type="submit" disabled={loading || !consent}>
          Submit
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      {status && (
        <div style={{ marginTop: 24 }}>
          <strong>{status}</strong>
        </div>
      )}
      <div style={{ marginTop: 32, fontSize: 13, color: '#666' }}>
        <p>Please double-check your account number and name. Both account number fields must match for submission.</p>
      </div>
    </div>
  );
}
