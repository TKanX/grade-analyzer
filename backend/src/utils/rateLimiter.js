/**
 * @fileoverview Rate Limiter
 * @description Rate limiter middleware to limit the number of requests per IP.
 */

const rateLimit = require('express-rate-limit');

const DEFAULT_MAX_REQUESTS = 150;
const DEFAULT_TIME_WINDOW = 300000; // 5 minutes (5 * 60 * 1000)
const TOO_MANY_REQUESTS_STATUS_CODE = 429;

/**
 * @function rateLimiter - Create a rate limiter middleware.
 * @param {number} max - The maximum number of requests.
 * @param {number} window - The time window in milliseconds.
 * @returns {Function} - A rate limiter middleware.
 */
const rateLimiter = (
  max = DEFAULT_MAX_REQUESTS,
  window = DEFAULT_TIME_WINDOW,
) => {
  if (process.env.NODE_ENV === 'test') {
    return (req, res, next) => {
      next();
    };
  }

  return rateLimit({
    windowMs: window,
    max,
    handler: (req, res) => {
      res.status(TOO_MANY_REQUESTS_STATUS_CODE).json({
        status: 'error',
        message: 'Too many requests, please try again later.',
        error: {
          code: 'TOO_MANY_REQUESTS',
          details: {
            max,
            window,
          },
        },
      });
    },
  });
};

module.exports = rateLimiter;
