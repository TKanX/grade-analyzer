/**
 * @fileoverview Preprocess Request Details Middleware
 * @description Middleware for preprocessing request details.
 */

const MAX_IP_LENGTH = 45; // Maximum length for IPv6

/**
 * @function preprocessRequestDetailsMiddleware - Middleware for preprocessing request details.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next function.
 * @returns {Function} - The next middleware function.
 */
const preprocessRequestDetailsMiddleware = (req, res, next) => {
  // Check if X-FORWARDED-FOR header is present
  if (req.headers['x-forwarded-for']) {
    // Get the first IP address from the X-FORWARDED-FOR header
    const ip = req.headers['x-forwarded-for'].split(',')[0].trim();

    // Limit the length of the IP address to prevent ReDoS
    if (ip.length <= MAX_IP_LENGTH) {
      // Maximum length for IPv6 is 45 characters
      req.ip = ip;
    } else {
      req.ip = 'unknown';
    }
  } else {
    // Populate the IP address from the request object
    if (req.ip && req.ip.length <= MAX_IP_LENGTH) {
      // Check length before matching
      req.ip =
        req.ip.match(/(?:\d{1,3}\.){3}\d{1,3}|[a-fA-F0-9:]+/g)?.[0] ||
        'unknown';
    } else {
      req.ip = 'unknown';
    }
  }

  // Populate the User-Agent from the request object
  req.headers['user-agent'] = req.headers['user-agent'] || 'unknown';

  next();
};

module.exports = preprocessRequestDetailsMiddleware;
