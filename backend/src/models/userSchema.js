/**
 * @fileoverview User Schema
 * @description User schema for the MongoDB database.
 */

const mongoose = require('mongoose');

// Define the settings schema
const settingsSchema = new mongoose.Schema({
  timeFormat: {
    type: String,
    enum: ['12h', '24h'],
    required: true,
    default: '12h',
  },
  dateFormat: {
    type: String,
    enum: ['MM-DD-YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'],
    required: true,
    default: 'MM-DD-YYYY',
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    required: true,
    default: 'system',
  },
});

// Define the safety record schema
const safetyRecordSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'PASSWORD_RESET_REQUESTED',
        'PASSWORD_RESET_SUCCESS',
        'EMAIL_CHANGED',
        'PASSWORD_CHANGED',
        'ACCOUNT_CREATED',
        'ACCOUNT_LOCKED',
        'ACCOUNT_UNLOCKED',
      ],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    device: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      name: {
        type: String,
        required: true,
        trim: true,
        default: function defaultName() {
          return this.username;
        },
      },
      avatar: {
        type: String,
        required: false,
        default: '',
      },
      birthday: {
        type: Date,
        required: false,
        default: null,
        max: Date.now(),
      },
      school: {
        type: String,
        required: false,
        default: '',
        trim: true,
      },
      country: {
        type: String,
        required: false,
        default: '',
        trim: true,
      },
    },
    roles: {
      type: [String],
      required: true,
      default: ['USER'],
    },
    locked: {
      type: Boolean,
      required: true,
      default: false,
    },
    settings: {
      type: settingsSchema,
      required: true,
      default: {},
      select: false, // Do not return the settings by default
    },
    safetyRecords: {
      type: [safetyRecordSchema],
      required: false,
      default: [],
      select: false, // Do not return the safety records by default
    },
  },
  {
    timestamps: true,
  },
);

// Index the username field
userSchema.index({ username: 1 }, { unique: true });

// Index the email field
userSchema.index({ email: 1 }, { unique: true });

// Index the roles field
userSchema.index({ roles: 1 });

// Index the locked field
userSchema.index({ locked: 1 });

// Delete the password field when converting to JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

// Create the user model
const User = mongoose.model('User', userSchema);

module.exports = User;
