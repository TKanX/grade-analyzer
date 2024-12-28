/**
 * @fileoverview Auth Controller
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

module.exports = {
  registerUser,
};
