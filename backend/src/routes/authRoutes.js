/**
 * @fileoverview Auth Routes
 * @description Routes for user authentication.
 */

const express = require('express');
const router = express.Router();

const rateLimiter = require('../utils/rateLimiter');

const authController = require('../controllers/authController');

const RATE_LIMIT_MAX_3 = 3;
const RATE_LIMIT_WINDOW_2_MINUTES = 120000; // 2 minutes (2 * 60 * 1000)

router.post(
  '/register',
  rateLimiter(RATE_LIMIT_MAX_3, RATE_LIMIT_WINDOW_2_MINUTES),
  authController.registerUser,
);

module.exports = router;
