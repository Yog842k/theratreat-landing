import { MongoClient, Db, Collection, WithId, Document } from "mongodb";

const uri = process.env.DATABASE_URL;
if (!uri) {
  throw new Error("DATABASE_URL is not set");
}
const mongoUri: string = uri;

const globalForMongo = global as unknown as { mongoClient?: MongoClient; mongoDb?: Db };

export async function getDb(): Promise<Db> {
  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(mongoUri);
    await globalForMongo.mongoClient.connect();
    globalForMongo.mongoDb = globalForMongo.mongoClient.db();
  }
  if (!globalForMongo.mongoDb) {
    globalForMongo.mongoDb = globalForMongo.mongoClient.db();
  }
  return globalForMongo.mongoDb;
}

export async function getBlogsCollection(): Promise<Collection<Document>> {
  const db = await getDb();
  return db.collection("blogs");
}

export function mapBlog(doc: WithId<Document>) {
  return {
    id: doc._id.toString(),
    title: doc.title ?? "Untitled",
    slug: doc.slug ?? "",
    summary: doc.summary ?? "",
    category: doc.category ?? "General",
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    coverImage: doc.coverImage ?? "",
    readTime: doc.readTime ?? "",
    content: doc.content ?? "",
    status: doc.status ?? "draft",
    author: doc.author ?? "Admin",
    scheduledFor: doc.scheduledFor ?? null,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
  };
}
