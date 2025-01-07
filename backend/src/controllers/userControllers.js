/**
 * @fileoverview User Controllers
 * @description Controllers for user-related operations.
 */

const userService = require('../services/userService');
const emailService = require('../services/emailService');
const jwtService = require('../services/jwtService');

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
 * @function getSettings - Get a user's settings.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const getSettings = async (req, res) => {
  const { id } = req.params;

  // Check if user is not the same as the requested user
  if (req.user.userId !== id) {
    return res.forbidden(
      'Forbidden to get settings for this user.',
      'ACCESS_DENIED',
    );
  }

  try {
    const settings = await userService.getSettingsById(id);

    return res.success(settings, 'Settings found successfully.');
  } catch (error) {
    return res.internalServerError(
      'Error getting settings.',
      'GET_SETTINGS_ERROR',
    );
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

/**
 * @function updateUsername - Update a user's username.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const updateUsername = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  // Check if user is not the same as the requested user
  if (req.user.userId !== id) {
    return res.forbidden('Forbidden to update this user.', 'ACCESS_DENIED');
  }

  // Check if username is valid
  if (!validationUtils.validateUsername(username)) {
    return res.badRequest('Invalid username.', 'INVALID_USERNAME');
  }

  // Check if username is already taken
  const existingUser = await userService.getUserByUsername(username);
  if (existingUser) {
    return res.conflict('Username already taken.', 'USERNAME_TAKEN');
  }

  // Update username
  try {
    const user = await userService.updateUserById(id, { username });
    return res.success(user, 'Username updated successfully.');
  } catch (error) {
    return res.internalServerError(
      'Error updating username.',
      'UPDATE_USERNAME_ERROR',
    );
  }
};

/**
 * @function updateEmail - Handle updating a user's email request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const updateEmail = async (req, res) => {
  const { id } = req.params;
  const { email, callbackUrl } = req.body;

  // Check if user is not the same as the requested user
  if (req.user.userId !== id) {
    return res.forbidden('Forbidden to update this user.', 'ACCESS_DENIED');
  }

  // Check if email is valid
  if (!validationUtils.validateEmail(email)) {
    return res.badRequest('Invalid email.', 'INVALID_EMAIL');
  }

  // Check if email is already taken
  const existingUser = await userService.getUserByEmail(email);
  if (existingUser) {
    return res.conflict('Email already taken.', 'EMAIL_TAKEN');
  }

  // Generate a JWT token for email verification
  const token = jwtService.generateToken(
    { email },
    process.env.JWT_SECRET,
    '1h',
  );

  // Send email verification
  try {
    await emailService.sendEmailVerification(email, token, callbackUrl);
    return res.success(null, 'Email verification sent successfully.');
  } catch (error) {
    return res.internalServerError(
      'Error sending verification email.',
      'SEND_EMAIL_ERROR',
    );
  }
};

/**
 * @function completeEmailUpdate - Handle completing an email update request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const completeEmailUpdate = async (req, res) => {
  const { id } = req.params;
  const { token } = req.body;

  // Check if user is not the same as the requested user
  if (req.user.userId !== id) {
    return res.forbidden('Forbidden to update this user.', 'ACCESS_DENIED');
  }

  let email;

  // Verify the token
  try {
    const payload = jwtService.verifyToken(token, process.env.JWT_SECRET);
    if (!payload.email) {
      return res.badRequest('Invalid token.', 'INVALID_TOKEN');
    }
    email = payload.email;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.unauthorized('Token expired.', 'TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      return res.badRequest('Invalid token.', 'INVALID_TOKEN');
    } else {
      return res.internalServerError(
        'Error verifying token.',
        'VERIFY_TOKEN_ERROR',
      );
    }
  }

  // Update email
  try {
    const user = await userService.updateUserById(id, { email });
    return res.success(user, 'Email updated successfully.');
  } catch (error) {
    return res.internalServerError(
      'Error updating email.',
      'UPDATE_EMAIL_ERROR',
    );
  }
};

module.exports = {
  getUser,
  getSettings,
  getSafetyRecords,
  updateUsername,
  updateEmail,
  completeEmailUpdate,
};
