const database = require('@/lib/database');
const DatabaseInitializer = require('@/lib/db-init');
const { ResponseUtils } = require('@/lib/utils');

export async function GET(request) {
  try {
    // Test database connection
    const db = await database.connect();
    
    // Get database stats
    const stats = await db.stats();
    
    return ResponseUtils.success({
      status: 'Connected',
      database: stats.db,
      collections: stats.collections,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize
    }, 'Database connection successful');

  } catch (error) {
    console.error('Database test error:', error);
    return ResponseUtils.error('Database connection failed');
  }
}

export async function POST(request) {
  try {
    // Initialize database (create indexes and seed data)
    await DatabaseInitializer.initialize();
    
    return ResponseUtils.success(null, 'Database initialized successfully');

  } catch (error) {
    console.error('Database initialization error:', error);
    return ResponseUtils.error('Database initialization failed');
  }
}
