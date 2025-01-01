/**
 * @fileoverview Main File (Both frontend and backend)
 * @description Main file for both frontend and backend servers.
 */

// Log starting message
console.log('Starting application...');

const { spawn } = require('child_process');
const path = require('path');

/**
 * @function startServer - Start a server process.
 * @param {string} scriptPath - The path to the server script.
 * @param {string} cwd - The current working directory for the server.
 */
function startServer(scriptPath, cwd) {
  const server = spawn('node', [scriptPath], { stdio: 'inherit', cwd });

  server.on('close', (code) => {
    console.log(`${scriptPath} process exited with code ${code}`);
  });
}

// Start backend server
startServer('server.js', path.join(__dirname, 'backend'));

// Start frontend server
startServer('server.js', path.join(__dirname, 'frontend'));
