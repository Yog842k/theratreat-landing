import { ResponseUtils } from '@/lib/utils';
const database = require('@/lib/database');

export async function GET() {
  let dbMode = 'unknown';
  try {
    await database.connect();
    dbMode = database.mock ? 'mock' : 'real';
  } catch (e) {
    dbMode = 'error';
  }
  return ResponseUtils.success({
    status: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    dbMode
  }, 'API Health Check Successful');
}
