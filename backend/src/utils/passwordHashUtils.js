/**
 * @fileoverview Password Hash Utils
 * @description Utility functions for hashing and comparing passwords.
 */

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10; // The number of salt rounds to use for hashing

/**
 * @function hashPassword - Hash a password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - The hashed password.
 * @throws {Error} - Throws an error if the password fails to hash.
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error in hashing password: ', error);
    throw error;
  }
};

/**
 * @function verifyPassword - Verify a password against a hash.
 * @param {string} password - The password to verify.
 * @param {string} hash - The hash to verify the password against.
 * @returns {Promise<boolean>} - A promise that resolves to true if the password is valid, false otherwise.
 * @throws {Error} - Throws an error if the password verification fails.
 */
const verifyPassword = async (password, hash) => {
  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    console.error('Error in verifying password: ', error);
    throw error;
  }
};

module.exports = { hashPassword, verifyPassword };
