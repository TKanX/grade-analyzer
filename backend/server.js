/**
 * @fileoverview Server Main File
 * @description Server configuration and initialization.
 */

// Load environment variables from .env file
require('dotenv').config();

// Load required modules
const express = require('express');
const bodyParser = require('body-parser');
const preprocessRequestDetailsMiddleware = require('./src/middlewares/preprocessRequestDetailsMiddleware');
const responseMiddleware = require('./src/middlewares/responseMiddleware');
const authMiddleware = require('./src/middlewares/authMiddleware');
const db = require('./src/db/db');
const routes = require('./src/routes');

const DEFAULT_PORT = 5000;
const port = process.env.PORT || DEFAULT_PORT;
const host = process.env.HOST || 'localhost';

const app = express();

// Trust the first proxy
app.set('trust proxy', 1);

// Connect to the database
db.connect();

// Middleware setup
app.use(bodyParser.json());
app.use(preprocessRequestDetailsMiddleware);
app.use(responseMiddleware);
app.use(authMiddleware);

// Routes setup
app.use('/api', routes);

// Start the server
const server = app.listen(port, host, () => {
  console.log(`Backend server is running on http://${host}:${port}`);
});

// Handle SIGTERM gracefully
process.on('SIGTERM', async () => {
  console.info('SIGTERM signal received.');
  console.log('Closing backend server...');
  await app.close();
});

// Handle SIGINT gracefully
process.on('SIGINT', async () => {
  console.info('SIGINT signal received.');
  console.log('Closing backend server...');
  await app.close();
});

app.close = async () => {
  await db.disconnect();
  server.close();
};

module.exports = app;
