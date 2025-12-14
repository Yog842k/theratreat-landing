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
    // Simple in-memory mock DB that persists for the lifetime of the process.
    // This improves developer experience when SKIP_DB=true so flows like
    // register -> login work as expected during local testing.
    this.mock = true;
    const collections = new Map();

    const getCollection = (name) => {
      if (!collections.has(name)) {
        collections.set(name, {
          docs: [],
          nextId: 1
        });
      }
      const col = collections.get(name);

      return {
        findOne: async (filter = {}) => {
          // very small matcher: supports equality on top-level fields and _id
          const keys = Object.keys(filter || {});
          for (const d of col.docs) {
            let match = true;
            for (const k of keys) {
              // support ObjectId-like _id string matching
              if (k === '_id') {
                if (String(d._id) !== String(filter._id)) { match = false; break; }
              } else if (d[k] !== filter[k]) { match = false; break; }
            }
            if (match) return d;
          }
          return null;
        },
        find: () => ({ toArray: async () => col.docs.slice() }),
        insertOne: async (doc) => {
          const inserted = { ...doc };
          // Enforce password hashing if password is present and not already hashed
          if (inserted.password && typeof inserted.password === 'string' && !inserted.password.startsWith('$2')) {
            try {
              const bcrypt = require('bcryptjs');
              inserted.password = await bcrypt.hash(inserted.password, 12);
            } catch (err) {
              console.error('[DB] Password hashing failed:', err);
            }
          }
          // assign a simple string id if none provided
          if (!inserted._id) inserted._id = `mock-${col.nextId++}`;
          col.docs.push(inserted);
          return { insertedId: inserted._id };
        },
        insertMany: async (docs) => {
          for (const d of docs) {
            if (!d._id) d._id = `mock-${col.nextId++}`;
            col.docs.push({ ...d });
          }
          return { insertedCount: docs.length };
        },
        updateOne: async (filter, update) => {
          // find index
          const idx = col.docs.findIndex(d => Object.keys(filter || {}).every(k => String(d[k]) === String(filter[k])));
          if (idx === -1) return { matchedCount: 0, modifiedCount: 0 };
          const found = col.docs[idx];
          if (update && update.$set) {
            Object.assign(found, update.$set);
            col.docs[idx] = found;
          }
          return { matchedCount: 1, modifiedCount: 1 };
        },
        updateMany: async () => ({ modifiedCount: 0 }),
        deleteOne: async (filter) => {
          const idx = col.docs.findIndex(d => Object.keys(filter || {}).every(k => String(d[k]) === String(filter[k])));
          if (idx === -1) return { deletedCount: 0 };
          col.docs.splice(idx, 1);
          return { deletedCount: 1 };
        },
        deleteMany: async () => ({ deletedCount: 0 }),
        createIndex: async () => 'mock_index',
        aggregate: () => ({ toArray: async () => [] })
      };
    };

    return {
      collection: (name) => getCollection(name),
      stats: async () => ({ db: 'therabook-mock', collections: collections.size, dataSize: 0, indexSize: 0 })
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

    const debug = process.env.DB_DEBUG === '1' || process.env.DB_DEBUG === 'true';
    const sanitize = (full) => {
      if (!full) return '(empty)';
      try {
        // Strip credentials while keeping host(s) & db
        // mongodb+srv://user:pass@cluster0.abc.mongodb.net/dbname?retryWrites=true
        return full.replace(/:\/\/.*?:.*?@/,'://***:***@');
      } catch { return '(unparseable)'; }
    };
    if (debug) {
      console.log('[DB][debug] NODE_ENV=%s REQUIRE_DB=%s SKIP_DB=%s', process.env.NODE_ENV, process.env.REQUIRE_DB, process.env.SKIP_DB);
      console.log('[DB][debug] Primary URI (sanitized): %s', sanitize(uri));
      if (process.env.MONGODB_URI_ALT) console.log('[DB][debug] Alt URI (sanitized): %s', sanitize(process.env.MONGODB_URI_ALT));
    }

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
      if (debug) {
        console.warn('[DB][debug] Using mock DB because real connection attempts failed. Attempts summary:', primaryErrors);
      }
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

  // Convert string id to Mongo ObjectId when available; fall back to string
  toObjectId(id) {
    try {
      const { ObjectId } = require('mongodb');
      // If already an ObjectId or invalid string, this may throw; catch below
      return new ObjectId(String(id));
    } catch {
      return id;
    }
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
