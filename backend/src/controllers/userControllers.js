/**
 * @fileoverview User Controllers
 * @description Controllers for user-related operations.
 */

const userService = require('../services/userService');

const validationUtils = require('../utils/validationUtils');

const DEFAULT_SAFETY_RECORDS_LIMIT = 10; // The default number of safety records to return

/**
 * @function getUser - Get a user by ID.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userService.getUserById(id);

    // Check if user exists
    if (!user) {
      return res.notFound('User not found.', 'USER_NOT_FOUND');
    }

    return res.success(user, 'User found successfully.');
  } catch (error) {
    return res.internalServerError('Error getting user.', 'GET_USER_ERROR');
  }
};

/**
 * @function getSafetyRecords - Get a user's safety records.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const getSafetyRecords = async (req, res) => {
  const { id } = req.params;
  let { limit, offset } = req.query;

  // Check if user is not the same as the requested user
  if (req.user.userId !== id) {
    return res.forbidden(
      'Forbidden to get safety records for this user.',
      'ACCESS_DENIED',
    );
  }

  // Check if limit and offset are valid
  if (limit && !validationUtils.validateLimit(limit)) {
    return res.badRequest('Invalid limit.', 'INVALID_LIMIT');
  }
  if (offset && !validationUtils.validateOffset(offset)) {
    return res.badRequest('Invalid offset.', 'INVALID_OFFSET');
  }

  try {
    limit = limit ? parseInt(limit) : DEFAULT_SAFETY_RECORDS_LIMIT;
    offset = offset ? parseInt(offset) : 0;

    const safetyRecords = await userService.getSafetyRecordsById(
      id,
      limit,
      offset,
    );

    return res.success(safetyRecords, 'Safety records found successfully.');
  } catch (error) {
    return res.internalServerError(
      'Error getting safety records.',
      'GET_SAFETY_RECORDS_ERROR',
    );
  }
};

module.exports = { getUser, getSafetyRecords };
