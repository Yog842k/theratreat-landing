const { MongoClient } = require('mongodb');

/**
 * Lightweight MongoDB helper with:
 *  - Safe credential handling (no hard‑coded URI)
 *  - Optional mock mode (SKIP_DB=true) for builds / preview deployments
 *  - Fast fail (short serverSelectionTimeoutMS) to avoid long "Starting..." hangs
 *  - Reuse of a single client across route invocations (Next.js hot reload safe)
 */
class Database {
  constructor() {
    this.client = null;
    this.db = null;
    this.mock = false;
  }

  buildMockDb() {
    this.mock = true;
    return {
      collection: () => ({
        findOne: async () => null,
        find: () => ({ toArray: async () => [] }),
        insertOne: async () => ({ insertedId: 'mock-id' }),
        insertMany: async (docs) => ({ insertedCount: docs?.length || 0 }),
        updateOne: async () => ({ matchedCount: 1, modifiedCount: 1 }),
        updateMany: async () => ({ modifiedCount: 0 }),
        deleteOne: async () => ({ deletedCount: 1 }),
        deleteMany: async () => ({ deletedCount: 0 }),
        createIndex: async () => 'mock_index',
        aggregate: () => ({ toArray: async () => [] })
      }),
      stats: async () => ({ db: 'therabook-mock', collections: 0, dataSize: 0, indexSize: 0 })
    };
  }

  async connect() {
    if (this.db) return this.db;

    // Allow skipping DB entirely (e.g. during build or when credentials absent)
    if (process.env.SKIP_DB === 'true') {
      console.warn('[DB] SKIP_DB=true -> using mock database.');
      this.db = this.buildMockDb();
      return this.db;
    }

  const uri = process.env.MONGODB_URI; // MUST be provided in env
  const dbName = process.env.MONGODB_DB; // If not set, use DB from URI

    if (!uri) {
      console.warn('[DB] MONGODB_URI missing -> using mock database.');
      this.db = this.buildMockDb();
      return this.db;
    }

    const primaryErrors = [];
    const attemptConnect = async (label, uriToUse) => {
      const isSrv = /mongodb\+srv:/i.test(uriToUse);
      const forceTls = process.env.DB_FORCE_TLS === 'true';
      const useTLS = isSrv || forceTls; // SRV clusters (Atlas) need TLS; local usually not

      const baseOpts = {
        maxPoolSize: 8,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 4000,
        socketTimeoutMS: 20000,
        connectTimeoutMS: 8000,
        retryWrites: true,
        appName: 'theratreat-app'
      };

      if (useTLS) {
        baseOpts.tls = true;
        baseOpts.tlsAllowInvalidCertificates = false;
      }

      const start = Date.now();
      console.log(`[DB] Connecting(${label}) -> srv:${isSrv} tls:${!!baseOpts.tls}`);
      const client = new MongoClient(uriToUse, baseOpts);
      await client.connect();
      const chosenDb = dbName ? client.db(dbName) : client.db();
      const resolvedName = chosenDb?.databaseName || dbName || '(default-from-uri)';
      console.log(`[DB] Connected(${label}) in ${Date.now()-start}ms (${resolvedName})`);
      // Store for future use
      this.client = client;
      this.db = chosenDb;
      return true;
    };

    try {
      // Keep timeouts low so failed Atlas handshake doesn't block startup
      await attemptConnect('primary', uri);
      return this.db;
    } catch (err) {
      console.error('[DB] Connection failed:', err?.message);
      primaryErrors.push(err?.message || String(err));
      // Try alternate URI if provided
      const alt = process.env.MONGODB_URI_ALT;
      if (alt) {
        try {
          await attemptConnect('alt', alt);
          return this.db;
        } catch (altErr) {
          console.error('[DB] Alternate connection failed:', altErr?.message);
          primaryErrors.push('ALT:' + (altErr?.message || String(altErr)));
        }
      }
      if (process.env.REQUIRE_DB === '1' || /true/i.test(process.env.REQUIRE_DB || '')) {
        console.error('[DB] REQUIRE_DB=1 set -> not falling back to mock. Throwing error. Attempts:', primaryErrors);
        const aggregateErr = new Error('Database connection failed (all attempts)');
        aggregateErr.attempts = primaryErrors;
        throw aggregateErr;
      }
      console.warn('[DB] Falling back to mock database so app can continue. (Set REQUIRE_DB=1 to disable this)');
      this.db = this.buildMockDb();
    }
    return this.db;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  async getCollection(name) {
    if (!this.db) {
      await this.connect();
    }
    return this.db.collection(name);
  }

  // Optimized query methods
  async findOne(collection, filter, options = {}) {
    const coll = await this.getCollection(collection);
    return await coll.findOne(filter, options);
  }

  async findMany(collection, filter = {}, options = {}) {
    const coll = await this.getCollection(collection);
    return await coll.find(filter, options).toArray();
  }

  async insertOne(collection, document) {
    const coll = await this.getCollection(collection);
    return await coll.insertOne(document);
  }

  async insertMany(collection, documents) {
    const coll = await this.getCollection(collection);
    return await coll.insertMany(documents);
  }

  async updateOne(collection, filter, update, options = {}) {
    const coll = await this.getCollection(collection);
    return await coll.updateOne(filter, update, options);
  }

  async updateMany(collection, filter, update, options = {}) {
    const coll = await this.getCollection(collection);
    return await coll.updateMany(filter, update, options);
  }

  async deleteOne(collection, filter) {
    const coll = await this.getCollection(collection);
    return await coll.deleteOne(filter);
  }

  async deleteMany(collection, filter) {
    const coll = await this.getCollection(collection);
    return await coll.deleteMany(filter);
  }

  async aggregate(collection, pipeline) {
    const coll = await this.getCollection(collection);
    return await coll.aggregate(pipeline).toArray();
  }

  async createIndex(collection, indexSpec, options = {}) {
    const coll = await this.getCollection(collection);
    return await coll.createIndex(indexSpec, options);
  }
}

// Singleton instance
const database = new Database();

module.exports = database;
