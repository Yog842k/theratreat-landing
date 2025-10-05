import Navigation from '@/components/Navigation';
import { CloudinaryTestClient, Badge } from './TestClient';

export const metadata = { title: 'Cloudinary Test | TheraTreat' };

export default function CloudinaryTestPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <Navigation />
      <main className="flex-1 px-5 md:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-10">
          <header className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Cloudinary Upload Test</h1>
            <p className="text-slate-600 max-w-2xl">Use this page to verify Cloudinary environment variables and the profile upload API route are working correctly.</p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <Badge label={process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Missing Config'} type={process.env.CLOUDINARY_CLOUD_NAME ? 'ok' : 'warn'} />
              <Badge label="Max 2MB" />
              <Badge label="JPG/PNG" />
            </div>
          </header>
          <CloudinaryTestClient />
          <details className="bg-white/70 border border-slate-200 rounded-xl p-5 shadow-sm text-sm">
            <summary className="cursor-pointer font-medium text-slate-800">Debug Info</summary>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <p>Cloud Name present: {process.env.CLOUDINARY_CLOUD_NAME ? 'Yes' : 'No'} (value not shown)</p>
              <p>API Key present: {process.env.CLOUDINARY_API_KEY ? 'Yes' : 'No'}</p>
              <p>API Secret present: {process.env.CLOUDINARY_API_SECRET ? 'Yes' : 'No'}</p>
              <p>Endpoint: /api/uploads/profile</p>
            </div>
          </details>
        </div>
      </main>
    </div>
  );
}

// Badge component provided by TestClient import
