const mongoose = require('mongoose');
const dns = require('dns');

// Use Google's public DNS to resolve MongoDB Atlas SRV records
// This fixes ECONNREFUSED on networks where the default DNS blocks SRV lookups
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI, {
                family: 4  // Force IPv4
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            console.error(`MongoDB Connection Attempt ${i + 1}/${retries} Failed:`, error.message);
            if (i < retries - 1) {
                console.log(`Retrying in 3 seconds...`);
                await new Promise(res => setTimeout(res, 3000));
            } else {
                console.error('All MongoDB connection attempts failed. Exiting.');
                process.exit(1);
            }
        }
    }
};

module.exports = connectDB;
