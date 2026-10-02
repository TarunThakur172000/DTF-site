import "server-only";
import mongoose from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: ReturnType<typeof mongoose.connect> | null;
};

const globalWithMongooseCache = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};
const cached = (globalWithMongooseCache.mongooseCache ??= {
  conn: null,
  promise: null,
});

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  cached.promise ??= mongoose.connect(MONGODB_URI);
  cached.conn = await cached.promise;

  return cached.conn;
}