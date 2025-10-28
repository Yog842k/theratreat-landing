// Minimal crypto utils for demo. Replace with real encryption in production.

export function encrypt(accountNumber: string): string {
  // TODO: Use real encryption (AES/KMS)
  return maskAccount(accountNumber);
}

export function maskAccount(accountNumber: string): string {
  if (!accountNumber) return '';
  const last4 = accountNumber.slice(-4);
  return '********' + last4;
}
