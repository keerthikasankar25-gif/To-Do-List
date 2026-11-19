const mongoose = require('mongoose');
const dns = require('dns');

// On Windows, Node.js c-ares DNS resolver often defaults to 127.0.0.1,
// causing MongoDB SRV lookups (querySrv) to fail with ECONNREFUSED.
const currentDns = dns.getServers();
if (!currentDns.length || currentDns.includes('127.0.0.1')) {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
