/**
 * @fileoverview Authentication Middleware
 * @description Middleware for user authentication.
 */

const jwtUtils = require('../utils/jwtUtils');

const PUBLIC_ROUTES = [
  '/api/auth/register',
  '/api/auth/complete-registration',
  '/api/auth/login',
  '/api/auth/refresh-token',
  '/api/auth/reset-password',
  '/api/auth/complete-reset-password',
];

/**
 * @function authMiddleware - Authenticate the user's JWT.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Function} - The next middleware function.
 */
const authMiddleware = (req, res, next) => {
  if (PUBLIC_ROUTES.includes(req.path)) {
    return next();
  }

  let token = req.headers['authorization'];

  if (!token) {
    return res.unauthorized('No token provided.', 'NO_TOKEN');
  }

  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  try {
    const payload = jwtUtils.verifyToken(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.unauthorized('Token expired.', 'TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      return res.unauthorized('Invalid token.', 'INVALID_TOKEN');
    } else {
      return res.internalServerError(
        'Error verifying token.',
        'VERIFY_TOKEN_ERROR',
      );
    }
  }
};

module.exports = authMiddleware;
