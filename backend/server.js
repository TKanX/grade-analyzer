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
app.use(bodyParser.json({ limit: '5mb' }));
app.use(preprocessRequestDetailsMiddleware);
app.use(responseMiddleware);
app.use(authMiddleware);

// Routes setup
app.use('/api', routes);

// Start the server
app.listen(port, host, () => {
  console.log(`Backend server is running on http://${host}:${port}`);
});

module.exports = app;
