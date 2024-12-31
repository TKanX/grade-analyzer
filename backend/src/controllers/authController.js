/**
 * @fileoverview Auth Controllers
 * @description Controllers for user authentication.
 */

const userService = require('../services/userService');
const emailService = require('../services/emailService');
const jwtService = require('../services/jwtService');

const validationUtils = require('../utils/validationUtils');

/**
 * @function registerUser - Handle user registration request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const registerUser = async (req, res) => {
  const { email, callbackUrl } = req.body;

  // Check if the email is valid
  if (!email || !validationUtils.validateEmail(email)) {
    return res.badRequest('Invalid email address.', 'INVALID_EMAIL');
  }

  // Generate a JWT token with the email (for verification)
  const token = jwtService.generateToken(
    { email },
    process.env.JWT_SECRET,
    '1h',
  );

  // Send the verification email
  try {
    await emailService.sendEmailVerification(email, token, callbackUrl);

    return res.success(null, 'Verification email sent.');
  } catch (error) {
    console.error('Error sending verification email: ', error);
    return res.internalServerError(
      'Error sending verification email.',
      'SEND_EMAIL_ERROR',
    );
  }
};

/**
 * @function completeRegistration - Handle user registration completion request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const completeRegistration = async (req, res) => {
  const { token, username, password } = req.body;

  let email;

  // Verify JWT token
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

  // Check if the username is valid
  if (!username || !validationUtils.validateUsername(username)) {
    return res.badRequest('Invalid username.', 'INVALID_USERNAME');
  }

  // Check if the password is valid
  if (!password || !validationUtils.validatePassword(password)) {
    return res.badRequest('Invalid password.', 'INVALID_PASSWORD');
  }

  // Check if the email is already in use
  const existingEmail = await userService.getUserByEmail(email);
  if (existingEmail) {
    return res.conflict('Email already in use.', 'EMAIL_IN_USE');
  }

  // Check if the username is already in use
  const existingUsername = await userService.getUserByUsername(username);
  if (existingUsername) {
    return res.conflict('Username already in use.', 'USERNAME_IN_USE');
  }

  // Create the user
  try {
    const user = await userService.createUser({ email, username, password });

    // Log the user's account creation
    userService.addSafetyRecordById(
      user._id,
      'ACCOUNT_CREATED',
      req.ip,
      req.headers['user-agent'],
    );

    return res.success(user, 'User created successfully.');
  } catch (error) {
    return res.internalServerError('Error creating user.', 'CREATE_USER_ERROR');
  }
};

module.exports = {
  registerUser,
  completeRegistration,
};
