import mongoose from "mongoose";

let connection: Promise<typeof mongoose> | null = null;

export function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI não configurada.");
  connection ??= mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  return connection;
}
