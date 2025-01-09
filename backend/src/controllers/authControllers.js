/**
 * @fileoverview Auth Controllers
 * @description Controllers for user authentication.
 */

const userService = require('../services/userService');
const emailService = require('../services/emailService');

const jwtUtils = require('../utils/jwtUtils');
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
  const token = jwtUtils.generateToken({ email }, process.env.JWT_SECRET, '1h');

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
    const payload = jwtUtils.verifyToken(token, process.env.JWT_SECRET);
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

/**
 * @function loginUser - Handle user login request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  // Check if the identifier is valid
  if (!identifier || !validationUtils.validateIdentifier(identifier)) {
    return res.badRequest('Invalid email or username.', 'INVALID_IDENTIFIER');
  }

  // Check if the password is valid
  if (!password || !validationUtils.validatePassword(password)) {
    return res.badRequest('Invalid password.', 'INVALID_PASSWORD');
  }

  // Log in the user
  try {
    const user = await userService.loginUser(identifier, password);
    const secret = await userService.getRefreshTokenSecret(
      user._id,
      process.env.JWT_SECRET,
    );

    // Log the user's login
    userService.addSafetyRecordById(
      user._id,
      'LOGIN_SUCCESS',
      req.ip,
      req.headers['user-agent'],
    );

    return res.success(
      {
        user,
        refreshToken: jwtUtils.generateToken(
          { userId: user._id },
          secret,
          '30d',
        ),
        accessToken: jwtUtils.generateToken(
          { userId: user._id },
          process.env.JWT_SECRET,
          '15m',
        ),
      },
      'User logged in successfully.',
    );
  } catch (error) {
    if (error.message === 'User not found') {
      return res.notFound('User not found.', 'USER_NOT_FOUND');
    }
    if (error.message === 'Invalid password') {
      // Log the failed login attempt
      await userService.addSafetyRecordById(
        error.user._id,
        'LOGIN_FAILED',
        req.ip,
        req.headers['user-agent'],
      );

      return res.unauthorized('Invalid password.', 'INVALID_PASSWORD');
    }
    if (error.message === 'Account locked') {
      return res.forbidden('Account locked.', 'ACCOUNT_LOCKED');
    }
    return res.internalServerError(
      'Error logging in user.',
      'LOGIN_USER_ERROR',
    );
  }
};

/**
 * @function refreshToken - Handle refresh token request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const refreshToken = async (req, res) => {
  const { refreshToken: refreshTokenBody } = req.body;

  // Check if the refresh token is valid
  if (!refreshToken) {
    return res.badRequest('Invalid refresh token.', 'INVALID_REFRESH_TOKEN');
  }

  // Verify the refresh token
  try {
    const userId = jwtUtils.decodeToken(refreshTokenBody).userId;
    const secret = await userService.getRefreshTokenSecret(
      userId,
      process.env.JWT_SECRET,
    );
    jwtUtils.verifyToken(refreshTokenBody, secret);

    // Generate a new access token
    const accessToken = jwtUtils.generateToken(
      { userId },
      process.env.JWT_SECRET,
      '15m',
    );
    return res.success({ accessToken }, 'Access token refreshed successfully.');
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.unauthorized('Token expired.', 'TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      return res.badRequest('Invalid token.', 'INVALID_TOKEN');
    }
    return res.internalServerError(
      'Error refreshing token.',
      'REFRESH_TOKEN_ERROR',
    );
  }
};

/**
 * @function resetPassword - Handle password reset request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const resetPassword = async (req, res) => {
  const { email, callbackUrl } = req.body;

  // Check if the email is valid
  if (!email || !validationUtils.validateEmail(email)) {
    return res.badRequest('Invalid email address.', 'INVALID_EMAIL');
  }

  // Check if the user exists
  const user = await userService.getUserByEmail(email);
  if (!user) {
    return res.notFound('User not found.', 'USER_NOT_FOUND');
  }

  // Generate a JWT token with the email (for verification)
  const token = jwtUtils.generateToken({ email }, process.env.JWT_SECRET, '1h');

  // Send the password reset email
  try {
    await emailService.sendEmailVerification(email, token, callbackUrl);

    // Log the password reset request
    userService.addSafetyRecordById(
      user._id,
      'PASSWORD_RESET_REQUESTED',
      req.ip,
      req.headers['user-agent'],
    );

    return res.success(null, 'Password reset email sent.');
  } catch (error) {
    console.error('Error sending password reset email: ', error);
    return res.internalServerError(
      'Error sending password reset email.',
      'SEND_EMAIL_ERROR',
    );
  }
};

/**
 * @function completeResetPassword - Handle password reset completion request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const completeResetPassword = async (req, res) => {
  const { token, password } = req.body;

  let email;

  // Verify JWT token
  try {
    const payload = jwtUtils.verifyToken(token, process.env.JWT_SECRET);
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

  // Check if the password is valid
  if (!password || !validationUtils.validatePassword(password)) {
    return res.badRequest('Invalid password.', 'INVALID_PASSWORD');
  }

  // Update the user's password
  try {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.notFound('User not found.', 'USER_NOT_FOUND');
    }

    const updatedUser = await userService.updateUserById(user._id, {
      password,
    });

    // Log the password reset
    userService.addSafetyRecordById(
      user._id,
      'PASSWORD_RESET_SUCCESS',
      req.ip,
      req.headers['user-agent'],
    );

    return res.success(updatedUser, 'Password reset successfully.');
  } catch (error) {
    return res.internalServerError(
      'Error resetting password.',
      'RESET_PASSWORD_ERROR',
    );
  }
};

module.exports = {
  registerUser,
  completeRegistration,
  loginUser,
  refreshToken,
  resetPassword,
  completeResetPassword,
};
