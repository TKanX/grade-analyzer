/**
 * @fileoverview User Service
 * @description User service for interacting with the database.
 */

const mongoose = require('mongoose');
const User = require('../models/userSchema');
const { hashPassword, verifyPassword } = require('./passwordHashService');

const DEFAULT_SAFETY_RECORDS_LIMIT = 20; // The default number of safety records to return

/**
 * @function createUser - Create a new user.
 * @param {Object} user - The user object to create.
 * @returns {Promise<Object>} - The created user object.
 * @throws {Error} - Throws an error if the user fails to create.
 */
const createUser = async (user) => {
  try {
    if (user.password) {
      user.password = await hashPassword(user.password);
    } else {
      throw new Error('Password is required');
    }
    const newUser = new User(user);
    const savedUser = await newUser.save();
    return savedUser;
  } catch (error) {
    console.error('Error in creating user: ', error);
    throw error;
  }
};

/**
 * @function loginUser - Log in a user.
 * @param {string} identifier - The user's email or username.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} - The logged in user object.
 * @throws {Error} - Throws an error if the login fails.
 */
const loginUser = async (identifier, password) => {
  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) {
      throw { message: 'User not found', user: null };
    }
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw { message: 'Invalid password', user: user };
    }
    if (user.locked) {
      throw { message: 'Account locked', user: user };
    }
    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * @function getRefreshTokenSecret - Get the refresh token secret for a user. (Secret key + user Password)
 * @param {string} userId - The user's ID.
 * @param {string} secret - The secret key.
 * @returns {string} - The refresh token secret.
 * @throws {Error} - Throws an error if the secret fails to get.
 */
const getRefreshTokenSecret = async (userId, secret) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    return `${secret}.${user.password}.${user.locked}`;
  } catch (error) {
    throw error;
  }
};

/**
 * @function getUserById - Get a user by ID.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Object>} - The user object.
 * @throws {Error} - Throws an error if the user fails to get.
 */
const getUserById = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error('Error in getting user by ID: ', error);
    throw error;
  }
};

/**
 * @function getUserByEmail - Get a user by email.
 * @param {string} email - The user's email.
 * @returns {Promise<Object>} - The user object.
 * @throws {Error} - Throws an error if the user fails to get.
 */
const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: { $eq: email } });
    return user;
  } catch (error) {
    console.error('Error in getting user by email: ', error);
    throw error;
  }
};

/**
 * @function getUserByUsername - Get a user by username.
 * @param {string} username - The user's username.
 * @returns {Promise<Object>} - The user object.
 * @throws {Error} - Throws an error if the user fails to get.
 */
const getUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ username });
    return user;
  } catch (error) {
    console.error('Error in getting user by username: ', error);
    throw error;
  }
};

/**
 * @function updateUserById - Update a user by ID.
 * @param {string} userId - The user's ID.
 * @param {Object} update - The user object to update.
 * @returns {Promise<Object>} - The updated user object.
 * @throws {Error} - Throws an error if the user fails to update.
 */
const updateUserById = async (userId, update) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  try {
    if (update.password) {
      update.password = await hashPassword(update.password);
    }
    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      new: true,
    });
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  } catch (error) {
    console.error('Error in updating user by ID: ', error);
    throw error;
  }
};

/**
 * @function getSettingsById - Get the settings of a user by ID.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Object>} - The user's settings.
 * @throws {Error} - Throws an error if the user fails to get.
 */
const getSettingsById = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  try {
    const user = await User.findById(userId, { settings: 1 });
    if (!user) throw new Error('User not found');
    return user.settings;
  } catch (error) {
    console.error('Error in getting settings by ID: ', error);
    throw error;
  }
};

/**
 * @function updateSettingsById - Update the settings of a user by ID.
 * @param {string} userId - The user's ID.
 * @param {Object} settings - The user's settings.
 * @returns {Promise<Object>} - The updated user object.
 * @throws {Error} - Throws an error if the user fails to update.
 */
const updateSettingsById = async (userId, settings) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { settings },
      { new: true },
    );
    if (!updatedUser) throw new Error('User not found');
    return updatedUser;
  } catch (error) {
    console.error('Error in updating settings by ID: ', error);
    throw error;
  }
};

/**
 * @function addSafetyRecordById - Add a safety record to a user by ID. The safety records are limited to 100 records.
 * @param {string} userId - The user's ID.
 * @param {string} type - The type of safety record.
 * @param {string} ip - The IP address of the safety record.
 * @param {string} device - The device of the safety record.
 * @returns {Promise<Object>} - The updated user object.
 * @throws {Error} - Throws an error if the user fails to update.
 */
const addSafetyRecordById = async (userId, type, ip, device) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  try {
    const safetyRecord = { type, date: new Date(), ip, device };
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          safetyRecords: {
            $each: [safetyRecord],
            $sort: { date: -1 },
            $slice: -100,
          },
        },
      },
      { new: true },
    );

    if (!updatedUser) throw new Error('User not found');

    return updatedUser;
  } catch (error) {
    console.error('Error in adding safety record by ID: ', error);
    throw error;
  }
};

/**
 * @function getSafetyRecordsById - Get the safety records of a user by ID.
 * @param {string} userId - The user's ID.
 * @param {number} limit - The number of safety records to return.
 * @param {number} offset - The number of safety records to skip.
 * @returns {Promise<Array>} - The user's safety records.
 * @throws {Error} - Throws an error if the user fails to get.
 */
const getSafetyRecordsById = async (
  userId,
  limit = DEFAULT_SAFETY_RECORDS_LIMIT,
  offset = 0,
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  try {
    const user = await User.findById(userId, {
      safetyRecords: { $slice: [offset, limit] },
    });

    if (!user) throw new Error('User not found or no safety records');

    return user.safetyRecords;
  } catch (error) {
    console.error('Error in getting safety records by ID: ', error);
    throw error;
  }
};

module.exports = {
  createUser,
  loginUser,
  getRefreshTokenSecret,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  updateUserById,
  getSettingsById,
  updateSettingsById,
  addSafetyRecordById,
  getSafetyRecordsById,
};
