const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const useInMemory = process.env.USE_IN_MEMORY_DB === 'true';
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/caresync';

    if (useInMemory) {
      console.log('🔄 Initializing Embedded In-Memory MongoDB Server for standalone zero-dependency execution...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log(`✅ In-Memory MongoDB Server running at: ${mongoUri}`);
    } else {
      console.log(`🔄 Connecting to external MongoDB at ${mongoUri}...`);
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`🌿 MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️ Failed to connect to configured MongoDB URI: ${err.message}`);
    console.log('🔄 Gracefully falling back to Embedded MongoMemoryServer...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const fallbackUri = mongod.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`✅ Fallback In-Memory MongoDB running at: ${fallbackUri}`);
      return conn;
    } catch (fallbackErr) {
      console.error('❌ Critical MongoDB connection failure:', fallbackErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error disconnecting DB:', err);
  }
};

module.exports = { connectDB, disconnectDB };

