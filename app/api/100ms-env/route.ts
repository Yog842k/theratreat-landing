import { NextResponse } from 'next/server';
import hmsConfig from '@/lib/hms-config';

// Returns ONLY boolean presence flags plus non-sensitive public values (like subdomain)
// Never return raw secrets here.
export async function GET() {
  return NextResponse.json({
    accessKey: !!hmsConfig.accessKey,
    secret: !!hmsConfig.secret,
    templateId: !!hmsConfig.templateId,
    subdomain: !!hmsConfig.subdomain,
    subdomainValue: hmsConfig.subdomain || null,
    managementToken: !!hmsConfig.managementToken,
    generatedAt: Date.now()
  }, { headers: { 'Cache-Control': 'no-store' }});
}
