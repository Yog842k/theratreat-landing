import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (!MONGODB_URI) {
    // Avoid throwing at module import; surface clear error on first DB usage
    throw new Error('MONGODB_URI is not set. Create a .env.local with MONGODB_URI and restart the dev server.');
  }
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Increased to 10 seconds to give more time
      connectTimeoutMS: 10000, // Connection timeout increased
      socketTimeoutMS: 10000, // Socket timeout increased
      retryWrites: true,
      retryReads: true,
      // Add retry logic
      maxPoolSize: 10,
      minPoolSize: 1,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('[MongoDB] Successfully connected to database');
      return mongoose;
    }).catch((err) => {
      const errMsg = err?.message || String(err);
      // Provide helpful error message for common issues
      if (errMsg.includes('whitelist') || errMsg.includes('IP') || errMsg.includes('network')) {
        console.error('[MongoDB] Connection error: IP not whitelisted. Please add your IP to MongoDB Atlas Network Access: https://www.mongodb.com/docs/atlas/security-whitelist/');
      } else {
        console.error('[MongoDB] Connection error:', errMsg);
      }
      throw err;
    });
  }

  try {
    // Add a timeout wrapper to ensure we don't wait too long
    cached.conn = await Promise.race([
      cached.promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('MongoDB connection timeout after 12 seconds. Please check: 1) Your IP is whitelisted in MongoDB Atlas Network Access, 2) MONGODB_URI is correct, 3) Network connectivity')), 12000)
      )
    ]);
  } catch (e) {
    cached.promise = null;
    const msg = e?.message || String(e);
    // Provide helpful error message
    if (msg.includes('whitelist') || msg.includes('IP')) {
      throw new Error(`Failed to connect to MongoDB: ${msg}. Please add your IP address to MongoDB Atlas Network Access whitelist.`);
    }
    throw new Error(`Failed to connect to MongoDB: ${msg}`);
  }

  return cached.conn;
}

export default connectDB;
