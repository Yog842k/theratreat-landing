import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const SignupClient = dynamic(() => import('./SignupClient'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="text-sm text-gray-500">Loading signup form…</div>
    </div>
  ),
});

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}> {/* server boundary */}
      <SignupClient />
    </Suspense>
  );
}
