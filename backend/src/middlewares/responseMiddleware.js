/**
 * @fileoverview Response Middleware
 * @description Middleware for sending response.
 */

// HTTP Status Codes
const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * @function responseMiddleware - Middleware for sending response.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next function.
 * @returns {Function} - The next middleware function.
 */
const responseMiddleware = (req, res, next) => {
  /**
   * @function success - Sends a success response.
   * @param {Object} data - The data to send in the response.
   * @param {string} message - The message to send in the response.
   */
  res.success = (data, message = '') => {
    res.status(STATUS_CODES.OK).json({
      status: 'success',
      data: data,
      message: message,
    });
  };

  /**
   * @function error - Sends an error response.
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   * @param {number} statusCode - The status code to send in the response.
   */
  res.error = (
    message,
    code = 'ERROR',
    details = {},
    statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR,
  ) => {
    res.status(statusCode).json({
      status: 'error',
      message: message,
      error: {
        code: code,
        details: details,
      },
    });
  };

  /**
   * @function badRequest - Sends a bad request response.
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.badRequest = (
    message = 'Bad Request',
    code = 'BAD_REQUEST',
    details = {},
  ) => {
    res.error(message, code, details, STATUS_CODES.BAD_REQUEST);
  };

  /**
   * @function unauthorized - Sends an unauthorized response.
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.unauthorized = (
    message = 'Unauthorized',
    code = 'UNAUTHORIZED',
    details = {},
  ) => {
    res.error(message, code, details, STATUS_CODES.UNAUTHORIZED);
  };

  /**
   * @function forbidden - Sends a forbidden response.
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.forbidden = (message = 'Forbidden', code = 'FORBIDDEN', details = {}) => {
    res.error(message, code, details, STATUS_CODES.FORBIDDEN);
  };

  /**
   * @function notFound - Sends a not found response.
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.notFound = (message = 'Not Found', code = 'NOT_FOUND', details = {}) => {
    res.error(message, code, details, STATUS_CODES.NOT_FOUND);
  };

  /**
   * @function conflict - Sends a conflict response.
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.conflict = (message = 'Conflict', code = 'CONFLICT', details = {}) => {
    res.error(message, code, details, STATUS_CODES.CONFLICT);
  };

  /**
   * @function preconditionFailed - Sends a precondition failed response.
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.preconditionFailed = (
    message = 'Precondition Failed',
    code = 'PRECONDITION_FAILED',
    details = {},
  ) => {
    res.error(message, code, details, STATUS_CODES.PRECONDITION_FAILED);
  };

  /**
   * @function internalServerError - Sends an internal server error response.
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.internalServerError = (
    message = 'Internal Server Error',
    code = 'INTERNAL_SERVER_ERROR',
    details = {},
  ) => {
    res.error(message, code, details, STATUS_CODES.INTERNAL_SERVER_ERROR);
  };

  next();
};

module.exports = responseMiddleware;
