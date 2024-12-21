/**
 * @fileoverview Server Main File
 * @description Server configuration and initialization.
 */

// Load environment variables from .env file
require('dotenv').config();

// Load required modules
const express = require('express');

const DEFAULT_PORT = 3000;
const port = process.env.PORT || DEFAULT_PORT;
const host = process.env.HOST || 'localhost';

const app = express();

// Load public files
app.use(express.static('public'));

// Load the renderer (EJS)
app.set('views', './src/views');
app.set('view engine', 'ejs');

// Start the server
const server = app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

// Handle SIGTERM gracefully
process.on('SIGTERM', async () => {
  console.info('SIGTERM signal received.');
  console.log('Closing server...');
  await app.close();
});

// Handle SIGINT gracefully
process.on('SIGINT', async () => {
  console.info('SIGINT signal received.');
  console.log('Closing server...');
  await app.close();
});

app.close = async () => {
  server.close();
};

module.exports = app;
