import { MongoClient, MongoClientOptions, Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options: MongoClientOptions = {};

let clientPromise: Promise<MongoClient> | undefined;

function ensureClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI as string | undefined;
  if (!uri) {
    throw new Error("MONGODB_URI not configured");
  }
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise!;
  }
  if (!clientPromise) {
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb(dbName = process.env.MONGODB_DB || "theratreat"): Promise<Db> {
  const client = await ensureClientPromise();
  return client.db(dbName);
}

export type ContactMessage = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: Date;
};
