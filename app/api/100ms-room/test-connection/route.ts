import { NextRequest, NextResponse } from 'next/server';
import * as dns from 'dns';
import * as net from 'net';

interface ConnectionTestResult {
  success: boolean;
  endpoint: string;
  timestamp: string;
  duration?: number;
  error?: string;
  details?: any;
}

interface DNSTestResult {
  success: boolean;
  hostname: string;
  addresses?: string[];
  error?: string;
}

interface TCPTestResult {
  success: boolean;
  host: string;
  port: number;
  duration?: number;
  error?: string;
}

/**
 * Test DNS resolution
 */
async function testDNS(hostname: string): Promise<DNSTestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    dns.resolve4(hostname, (err, addresses) => {
      const duration = Date.now() - startTime;
      if (err) {
        resolve({
          success: false,
          hostname,
          error: err.message || String(err),
        });
      } else {
        resolve({
          success: true,
          hostname,
          addresses: addresses || [],
        });
      }
    });
  });
}

/**
 * Test TCP connection
 */
async function testTCP(host: string, port: number, timeoutMs = 5000): Promise<TCPTestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    let finished = false;

    const done = (result: TCPTestResult) => {
      if (!finished) {
        finished = true;
        try {
          socket.destroy();
        } catch {}
        resolve(result);
      }
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      done({
        success: true,
        host,
        port,
        duration: Date.now() - startTime,
      });
    });

    socket.once('timeout', () => {
      done({
        success: false,
        host,
        port,
        duration: Date.now() - startTime,
        error: 'Connection timeout',
      });
    });

    socket.once('error', (err: any) => {
      done({
        success: false,
        host,
        port,
        duration: Date.now() - startTime,
        error: err.message || err.code || 'Connection failed',
      });
    });

    try {
      socket.connect(port, host);
    } catch (err: any) {
      done({
        success: false,
        host,
        port,
        duration: Date.now() - startTime,
        error: err.message || 'Failed to initiate connection',
      });
    }
  });
}

/**
 * Test connection to 100ms API endpoints
 * Helps diagnose network connectivity issues
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const results: ConnectionTestResult[] = [];
  const diagnostics: any = {
    dns: null as DNSTestResult | null,
    tcp: null as TCPTestResult | null,
  };
  
  // Test endpoints - use actual API endpoints that exist
  const endpoints = [
    { name: 'Rooms API (GET)', url: 'https://api.100ms.live/v2/rooms', method: 'GET' },
  ];

  const managementToken = process.env.HMS_MANAGEMENT_TOKEN;

  // First, test DNS resolution
  try {
    diagnostics.dns = await testDNS('api.100ms.live');
  } catch (error: any) {
    diagnostics.dns = {
      success: false,
      hostname: 'api.100ms.live',
      error: error.message || String(error),
    };
  }

  // Then test TCP connection to port 443 (HTTPS)
  if (diagnostics.dns?.success && diagnostics.dns.addresses && diagnostics.dns.addresses.length > 0) {
    try {
      diagnostics.tcp = await testTCP(diagnostics.dns.addresses[0], 443, 5000);
    } catch (error: any) {
      diagnostics.tcp = {
        success: false,
        host: diagnostics.dns.addresses[0],
        port: 443,
        error: error.message || String(error),
      };
    }
  } else {
    // Try with hostname if DNS failed
    try {
      diagnostics.tcp = await testTCP('api.100ms.live', 443, 5000);
    } catch (error: any) {
      diagnostics.tcp = {
        success: false,
        host: 'api.100ms.live',
        port: 443,
        error: error.message || String(error),
      };
    }
  }

  for (const endpoint of endpoints) {
    const testStart = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      let response: Response;
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Only add auth header if we have a token and it's the rooms endpoint
        if (managementToken && endpoint.url.includes('/v2/rooms')) {
          headers['Authorization'] = `Bearer ${managementToken}`;
        }

        response = await fetch(endpoint.url, {
          method: (endpoint as any).method || 'GET',
          headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError' || fetchError.code === 'UND_ERR_CONNECT_TIMEOUT') {
          results.push({
            success: false,
            endpoint: endpoint.name,
            timestamp: new Date().toISOString(),
            duration: Date.now() - testStart,
            error: 'Connection timeout',
            details: {
              code: fetchError.code,
              message: 'Request timed out after 10 seconds',
            },
          });
          continue;
        }
        
        throw fetchError;
      }

      const duration = Date.now() - testStart;
      const status = response.status;
      const contentType = response.headers.get('content-type') || '';

      results.push({
        success: response.ok,
        endpoint: endpoint.name,
        timestamp: new Date().toISOString(),
        duration,
        ...(response.ok ? {} : {
          error: `HTTP ${status}`,
          details: {
            status,
            statusText: response.statusText,
            contentType,
          },
        }),
      });
    } catch (error: any) {
      results.push({
        success: false,
        endpoint: endpoint.name,
        timestamp: new Date().toISOString(),
        duration: Date.now() - testStart,
        error: error.name || 'Connection failed',
        details: {
          message: error.message,
          code: error.code,
          cause: error.cause?.message,
        },
      });
    }
  }

  const totalDuration = Date.now() - startTime;
  const allSuccessful = results.every(r => r.success);
  const hasToken = !!managementToken;

  return NextResponse.json({
    success: allSuccessful,
    timestamp: new Date().toISOString(),
    totalDuration,
    hasManagementToken: hasToken,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasTemplateId: !!process.env.HMS_TEMPLATE_ID,
      hasSubdomain: !!process.env.HMS_SUBDOMAIN,
      hasProxy: !!(process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.PROXY),
    },
    diagnostics,
    tests: results,
    recommendations: generateRecommendations(results, hasToken, diagnostics),
  });
}

function generateRecommendations(
  results: ConnectionTestResult[],
  hasToken: boolean,
  diagnostics: any
): string[] {
  const recommendations: string[] = [];

  const baseApiTest = results.find(r => r.endpoint === 'API Base');
  const roomsApiTest = results.find(r => r.endpoint === 'Rooms API');

  // DNS diagnostics
  if (diagnostics?.dns && !diagnostics.dns.success) {
    recommendations.push('🔍 DNS Resolution Failed: Cannot resolve api.100ms.live');
    recommendations.push('💡 Check your DNS settings. Try using a public DNS like 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare)');
    recommendations.push('💡 Verify your network allows DNS queries on port 53');
  }

  // TCP diagnostics
  if (diagnostics?.tcp && !diagnostics.tcp.success) {
    recommendations.push('🔌 TCP Connection Failed: Cannot establish connection to api.100ms.live:443');
    recommendations.push('💡 Check if your firewall allows outbound HTTPS connections (port 443)');
    recommendations.push('💡 Verify your network/VPN allows connections to external APIs');
    if (diagnostics.tcp.error?.includes('timeout')) {
      recommendations.push('⏱️ Connection is timing out. This suggests a firewall or network restriction.');
    }
  }

  if (!baseApiTest?.success) {
    if (diagnostics?.dns?.success && diagnostics?.tcp?.success) {
      recommendations.push('❌ DNS and TCP work, but HTTP request fails. This may be a proxy or SSL/TLS issue.');
      recommendations.push('💡 Check if you need to configure HTTPS_PROXY or HTTP_PROXY environment variables');
    } else {
      recommendations.push('❌ Cannot reach 100ms API base URL. Check your internet connection and firewall settings.');
      recommendations.push('💡 Verify that api.100ms.live is accessible from your network.');
    }
  }

  if (baseApiTest?.success && !roomsApiTest?.success) {
    if (roomsApiTest?.error === 'Connection timeout') {
      recommendations.push('⏱️ Connection to 100ms API is timing out. This may be due to network latency or firewall restrictions.');
      recommendations.push('💡 Try increasing the timeout or check if your network allows outbound HTTPS connections.');
    } else if (roomsApiTest?.details?.status === 401) {
      recommendations.push('🔑 Authentication failed. Verify that your HMS_MANAGEMENT_TOKEN is correct and not expired.');
    } else if (roomsApiTest?.details?.status === 403) {
      recommendations.push('🚫 Access forbidden. Check that your management token has the required permissions.');
    } else {
      recommendations.push(`⚠️ Rooms API returned error: ${roomsApiTest?.error}. Check the details for more information.`);
    }
  }

  if (!hasToken) {
    recommendations.push('⚠️ HMS_MANAGEMENT_TOKEN is not configured. Room creation will fail without it.');
  }

  // Network environment checks
  if (process.env.HTTPS_PROXY || process.env.HTTP_PROXY) {
    recommendations.push('ℹ️ Proxy detected. Ensure your proxy is configured correctly and allows connections to api.100ms.live');
  }

  if (baseApiTest?.success && roomsApiTest?.success) {
    recommendations.push('✅ All connection tests passed! Your network can reach 100ms API.');
  }

  // Additional troubleshooting
  if (!baseApiTest?.success || !roomsApiTest?.success) {
    recommendations.push('');
    recommendations.push('🔧 Troubleshooting Steps:');
    recommendations.push('1. Test from command line: curl -I https://api.100ms.live');
    recommendations.push('2. Check firewall rules for outbound HTTPS (port 443)');
    recommendations.push('3. Verify VPN/proxy settings if applicable');
    recommendations.push('4. Try from a different network to isolate the issue');
    recommendations.push('5. Check 100ms service status: https://status.100ms.live');
  }

  return recommendations;
}

