import mongoose from 'mongoose';

let mongod = null;

export const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : null;

  // =========================================================================
  // PRODUCTION ENVIRONMENT (Render, Cloud Deployments)
  // =========================================================================
  if (isProduction) {
    if (!mongoUri) {
      console.error(`
================================================================================
[MongoDB Fatal Error] Missing required MONGODB_URI in production!

In production mode (NODE_ENV=production), a direct MongoDB connection string
is required. The server will not fall back to localhost or in-memory databases.

TO FIX THIS ON RENDER:
1. Go to your Render Dashboard -> Your Web Service -> Environment.
2. Add an environment variable:
   Key:   MONGODB_URI
   Value: mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/minimal_tasklist?retryWrites=true&w=majority
3. Click "Save Changes" to trigger automatic redeployment.
================================================================================
`);
      throw new Error('MONGODB_URI environment variable is required in production.');
    }

    console.log('[MongoDB] Production mode detected. Connecting directly to MongoDB Atlas...');

    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000 // 15-second timeout for cloud DNS & Atlas handshake
      });
      console.log('[MongoDB] Successfully connected to MongoDB Atlas in production.');
      return;
    } catch (err) {
      console.error(`[MongoDB] Failed to connect to MongoDB Atlas at configured MONGODB_URI: ${err.message}`);
      throw err;
    }
  }

  // =========================================================================
  // DEVELOPMENT / TEST ENVIRONMENT (Local Machine)
  // =========================================================================
  // If a custom MONGODB_URI is provided locally (e.g. in .env), connect to it directly
  if (mongoUri) {
    try {
      console.log('[MongoDB] Development mode: Connecting to provided MONGODB_URI...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000
      });
      console.log('[MongoDB] Successfully connected to configured MONGODB_URI.');
      return;
    } catch (err) {
      console.warn(`[MongoDB] Error connecting to configured MONGODB_URI (${err.message}).`);
      throw err;
    }
  }

  // If no MONGODB_URI is set in development, first attempt local standalone MongoDB (localhost:27017)
  const defaultLocalUri = 'mongodb://127.0.0.1:27017/minimal_tasklist';
  try {
    await mongoose.connect(defaultLocalUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Connected to local standalone instance at ${defaultLocalUri}`);
    return;
  } catch (err) {
    console.log(`[MongoDB] Local standalone MongoDB not running on 27017 (${err.message}). Starting embedded MongoMemoryServer for development...`);
  }

  // Fallback to embedded MongoMemoryServer for zero-config local development
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    
    // Pin to a Debian 12-compatible MongoDB version for MongoMemoryServer
    const isWindows = process.platform === 'win32';
    const serverOptions = {
      instance: {
        dbName: 'minimal_tasklist'
      }
    };

    if (isWindows) {
      serverOptions.binary = { version: '7.0.3' };
    }

    mongod = await MongoMemoryServer.create(serverOptions);
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[MongoDB] Embedded MongoMemoryServer active at ${memoryUri} for local development.`);
  } catch (memErr) {
    console.error('[MongoDB] Failed to start embedded MongoMemoryServer:', memErr.message);
    throw memErr;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
