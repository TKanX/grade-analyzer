/**
 * @fileoverview Database Connection
 * @description Database connection and initialization.
 */

const mongoose = require('mongoose');

let isConnected = false;

/**
 * @function connect - Connect to the database.
 * @returns {Promise<void>} - A promise that resolves when the connection is established.
 * @throws {Error} - Throws an error if the connection fails.
 */
const connect = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return Promise.resolve();
  }

  console.log('Using new database connection');
  const db = await mongoose.connect(process.env.MONGODB_URI);

  isConnected = db.connections[0].readyState;

  return Promise.resolve();
};

/**
 * @function disconnect - Disconnect from the database.
 * @returns {Promise<void>} - A promise that resolves when the connection is closed.
 * @throws {Error} - Throws an error if the disconnection fails.
 */
const disconnect = async () => {
  if (!isConnected) {
    console.log('No active database connection to close');
    return;
  }

  console.log('Closing database connection');
  await mongoose.disconnect();

  isConnected = false;

  return;
};

module.exports = {
  connect,
  disconnect,
};
