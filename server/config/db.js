import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  const isCustomUri = !!process.env.MONGODB_URI;
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/minimal_tasklist';
  
  try {
    // For custom/Atlas URI, allow standard 10s timeout; for default localhost, allow 2.5s
    const timeout = isCustomUri ? 10000 : 2500;
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeout
    });
    console.log(`[MongoDB] Connected successfully to ${isCustomUri ? 'configured database' : uri}`);
    return;
  } catch (err) {
    if (isCustomUri) {
      console.error(`[MongoDB] Error connecting to configured MONGODB_URI: ${err.message}`);
      throw err;
    }
    console.warn(`[MongoDB] Local standalone MongoDB on 27017 not available (${err.message}). Starting embedded MongoMemoryServer...`);
  }

  try {
    // Start embedded MongoDB instance for effortless local full-stack development
    mongod = await MongoMemoryServer.create({
      binary: {
        version: '6.0.19'
      },
      instance: {
        dbName: 'minimal_tasklist'
      }
    });
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[MongoDB] Embedded MongoMemoryServer running at ${memoryUri}`);
  } catch (memErr) {
    console.error('[MongoDB] Failed to start embedded MongoMemoryServer:', memErr);
    throw memErr;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
