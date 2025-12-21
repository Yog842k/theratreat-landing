"use client";
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function TheraStoreAdminLoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams?.get('next') || '/therastore/add-product';
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/therastore/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass, next }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Access denied');
      router.replace(json.redirect || next);
    } catch (e: any) {
      setError(e?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>TheraStore Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pass">Access Pass</Label>
              <Input
                id="pass"
                type="password"
                placeholder="Enter access pass"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying…' : 'Continue'}
            </Button>
          </form>
          <p className="text-[11px] text-slate-400 mt-4">You will be redirected to: {next}</p>
        </CardContent>
      </Card>
    </div>
  );
}


export default function TheraStoreAdminLogin() {
  return (
    <Suspense>
      <TheraStoreAdminLoginContent />
    </Suspense>
  );
}
