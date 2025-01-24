/**
 * @fileoverview Validation Utils
 * @description Utility functions for validation.
 */

const MAX_EMAIL_LENGTH = 254; // The maximum length of an email address
const MAX_USERNAME_LENGTH = 20; // The maximum length of a username
const MAX_LIMIT = 100; // The maximum limit value
const MAX_AVATAR_SIZE = 5242880; // 5MB in bytes (5 * 1024 * 1024)
const MAX_SCHOOL_LENGTH = 50; // The maximum length of a school name

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Check if the email is valid (contains an @ symbol and a period)
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])[^\s]{8,}$/; // Check if the password is valid (at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character)
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,}$/; // Check if the username is valid (at least 3 characters, alphanumeric characters and underscores only)
const NAME_REGEX = /^(?!.*\s{2,})[^\s](.{0,18}[^\s])?$|^$/; // Check if the name is valid (no more than 20 characters, no leading or trailing spaces, no consecutive spaces)
const AVATAR_REGEX = /^data:image\/[a-z]+;base64,/; // Check if the avatar is valid (base64 image)
const SCHOOL_REGEX = /^[a-zA-Z0-9\s]{3,}$/; // Check if the school name is valid (at least 3 characters, alphanumeric characters and spaces only)
const COUNTRY_REGEX = /^[a-zA-Z]{2}$/; // Check if the country code is valid (2 letter country code)
const TIME_FORMAT_REGEX = /^(12h|24h)$/; // Check if the time format is valid (12h or 24h)
const DATE_FORMAT_REGEX = /^(MM-DD-YYYY|DD-MM-YYYY|YYYY-MM-DD)$/; // Check if the date format is valid (MM-DD-YYYY, DD-MM-YYYY, or YYYY-MM-DD)
const THEME_REGEX = /^(light|dark|system)$/; // Check if the theme is valid (light, dark, or system)
const GRADE_NAME_REGEX = /^(?!.*\s{2,})[^\s](.{0,18}[^\s])?$/; // Check if the grade name is valid (at least 1 character, no more than 20 characters, no leading or trailing spaces, no consecutive spaces)

/**
 * @function validateEmail - Validate an email address.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if the email is valid, false otherwise.
 */
const validateEmail = (email) => {
  if (!email) {
    // Check if the email is empty
    return false;
  } else if (email.length > MAX_EMAIL_LENGTH) {
    // Check if the email is too long
    return false;
  } else {
    // Check if the email matches the regex pattern
    return EMAIL_REGEX.test(email);
  }
};

/**
 * @function validatePassword - Validate a password.
 * @param {string} password - The password to validate.
 * @returns {boolean} - True if the password is valid, false otherwise.
 */
const validatePassword = (password) => {
  if (!password) {
    // Check if the password is empty
    return false;
  } else {
    // Check if the password matches the regex pattern
    return PASSWORD_REGEX.test(password);
  }
};

/**
 * @function validateUsername - Validate a username.
 * @param {string} username - The username to validate.
 * @returns {boolean} - True if the username is valid, false otherwise.
 */
const validateUsername = (username) => {
  if (!username) {
    // Check if the username is empty
    return false;
  } else if (username.length > MAX_USERNAME_LENGTH) {
    // Check if the username is too long
    return false;
  } else {
    // Check if the username matches the regex pattern
    return USERNAME_REGEX.test(username);
  }
};

/**
 * @function validateIdentifier - Validate an identifier. (email or username)
 * @param {string} identifier - The identifier to validate.
 * @returns {boolean} - True if the identifier is valid, false otherwise.
 */
const validateIdentifier = (identifier) => {
  return validateEmail(identifier) || validateUsername(identifier);
};

/**
 * @function validateLimit - Validate a limit query parameter.
 * @param {string} limit - The limit query parameter to validate.
 * @returns {boolean} - True if the limit is valid, false otherwise.
 */
const validateLimit = (limit) => {
  return !isNaN(limit) && parseInt(limit) > 0 && parseInt(limit) <= MAX_LIMIT;
};

/**
 * @function validateOffset - Validate an offset query parameter.
 * @param {string} offset - The offset query parameter to validate.
 * @returns {boolean} - True if the offset is valid, false otherwise.
 */
const validateOffset = (offset) => {
  return !isNaN(offset) && parseInt(offset) >= 0;
};

/**
 * @function validateName - Validate a name.
 * @param {string} name - The name to validate.
 * @returns {boolean} - True if the name is valid, false otherwise.
 */
const validateName = (name) => {
  if (name === undefined || name === null) {
    // Check if the name is empty (null or undefined, but not an empty string)
    return false;
  } else {
    // Check if the name matches the regex pattern
    return NAME_REGEX.test(name);
  }
};

/**
 * @function validateAvatar - Validate a base64 avatar.
 * @param {string} avatar - The avatar to validate.
 * @returns {boolean} - True if the avatar is valid and less than 5MB, false otherwise.
 */
const validateAvatar = (avatar) => {
  if (avatar === undefined || avatar === null) {
    // Check if the avatar is empty (null or undefined, but not an empty string)
    return false;
  } else if (avatar === '') {
    // Check if the avatar is empty (an empty string)
    return true;
  } else if (!AVATAR_REGEX.test(avatar)) {
    // Check if the avatar matches the regex pattern
    return false;
  } else {
    // Check if the avatar size is less than 5MB
    const avatarSize = Buffer.from(avatar.split(',')[1], 'base64').length;
    return avatarSize <= MAX_AVATAR_SIZE;
  }
};

/**
 * @function validateBirthday - Validate a birthday.
 * @param {string} birthday - The birthday to validate.
 * @returns {boolean} - True if the birthday is valid, false otherwise.
 */
const validateBirthday = (birthday) => {
  if (birthday === undefined) {
    // Check if the birthday is empty (undefined)
    return false;
  } else if (birthday === null) {
    // Check if the birthday is empty (null, but not an empty string)
    return true;
  } else {
    // Check if the birthday is a valid date
    return !isNaN(Date.parse(birthday));
  }
};

/**
 * @function validateSchool - Validate a school name.
 * @param {string} school - The school name to validate.
 * @returns {boolean} - True if the school name is valid, false otherwise.
 */
const validateSchool = (school) => {
  if (school === undefined || school === null) {
    // Check if the school name is empty (null or undefined, but not an empty string)
    return false;
  } else if (school === '') {
    // Check if the school name is empty (an empty string)
    return true;
  } else if (school.length > MAX_SCHOOL_LENGTH) {
    // Check if the school name is too long
    return false;
  } else {
    // Check if the school name matches the regex pattern
    return SCHOOL_REGEX.test(school);
  }
};

/**
 * @function validateCountry - Validate a country code.
 * @param {string} country - The country code to validate.
 * @returns {boolean} - True if the country code is valid, false otherwise.
 */
const validateCountry = (country) => {
  if (country === undefined || country === null) {
    // Check if the country code is empty (null or undefined, but not an empty string)
    return false;
  } else if (country === '') {
    // Check if the country code is empty (an empty string)
    return true;
  } else {
    // Check if the country code matches the regex pattern
    return COUNTRY_REGEX.test(country);
  }
};

/**
 * @function validateTimeFormat - Validate a time format.
 * @param {string} timeFormat - The time format to validate.
 * @returns {boolean} - True if the time format is valid, false otherwise.
 */
const validateTimeFormat = (timeFormat) => {
  if (timeFormat === undefined || timeFormat === null) {
    // Check if the time format is empty (null or undefined, but not an empty string)
    return false;
  } else {
    // Check if the time format matches the regex pattern
    return TIME_FORMAT_REGEX.test(timeFormat);
  }
};

/**
 * @function validateDateFormat - Validate a date format.
 * @param {string} dateFormat - The date format to validate.
 * @returns {boolean} - True if the date format is valid, false otherwise.
 */
const validateDateFormat = (dateFormat) => {
  if (dateFormat === undefined || dateFormat === null) {
    // Check if the date format is empty (null or undefined, but not an empty string)
    return false;
  } else {
    // Check if the date format matches the regex pattern
    return DATE_FORMAT_REGEX.test(dateFormat);
  }
};

/**
 * @function validateTheme - Validate a theme.
 * @param {string} theme - The theme to validate.
 * @returns {boolean} - True if the theme is valid, false otherwise.
 */
const validateTheme = (theme) => {
  if (theme === undefined || theme === null) {
    // Check if the theme is empty (null or undefined, but not an empty string)
    return false;
  } else {
    // Check if the theme matches the regex pattern
    return THEME_REGEX.test(theme);
  }
};

/**
 * @function validateGradeName - Validate a grade name.
 * @param {string} name - The grade name to validate.
 * @returns {boolean} - True if the grade name is valid, false otherwise.
 */
const validateGradeName = (name) => {
  if (!name) {
    // Check if the grade name is empty
    return false;
  } else {
    // Check if the grade name matches the regex pattern
    return GRADE_NAME_REGEX.test(name);
  }
};

/**
 * @function validateStartDate - Validate a start date.
 * @param {string} startDate - The start date to validate.
 * @returns {boolean} - True if the start date is valid, false otherwise.
 */
const validateStartDate = (startDate) => {
  if (!startDate) {
    // Check if the start date is empty
    return false;
  } else {
    // Check if the start date is a valid date
    return !isNaN(Date.parse(startDate));
  }
};

/**
 * @function validateEndDate - Validate an end date.
 * @param {string} endDate - The end date to validate.
 * @returns {boolean} - True if the end date is valid, false otherwise.
 */
const validateEndDate = (endDate) => {
  if (!endDate) {
    // Check if the end date is empty
    return false;
  } else {
    // Check if the end date is a valid date
    return !isNaN(Date.parse(endDate));
  }
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateIdentifier,
  validateLimit,
  validateOffset,
  validateName,
  validateAvatar,
  validateBirthday,
  validateSchool,
  validateCountry,
  validateTimeFormat,
  validateDateFormat,
  validateTheme,
  validateGradeName,
  validateStartDate,
  validateEndDate,
};
