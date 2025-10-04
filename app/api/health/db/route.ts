import { NextResponse } from 'next/server';

// A small healthcheck endpoint that verifies DB connectivity and whether the
// runtime is using the mock fallback. Useful to call after deploy on Amplify.
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Import the existing commonjs database helper
    const databaseModule = await import('@/lib/database');
    const database: any = databaseModule.default || databaseModule;

    // Attempt to connect (this will either connect or cause the helper to
    // return a mock DB depending on env/config).
    let usedMock = false;
    try {
      const db = await database.connect();
      // The helper sets `mock = true` when it builds a mock DB
      usedMock = !!database.mock;
      const info = {
        ok: true,
        mock: usedMock,
        databaseName: usedMock ? 'mock' : (db?.databaseName || null)
      };
      return NextResponse.json(info);
    } catch (e) {
      // If connect threw (and REQUIRE_DB may be set), report the error
      return NextResponse.json({ ok: false, mock: false, error: String(e) }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
