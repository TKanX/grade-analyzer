/**
 * @fileoverview Auth Routes
 * @description Routes for user authentication.
 */

const express = require('express');
const router = express.Router();

const rateLimiter = require('../utils/rateLimiter');

const authControllers = require('../controllers/authControllers');

const RATE_LIMIT_MAX_3 = 3;
const RATE_LIMIT_WINDOW_2_MINUTES = 120000; // 2 minutes (2 * 60 * 1000)
const RATE_LIMIT_MAX_15 = 15;
const RATE_LIMIT_WINDOW_1_HOUR = 3600000; // 1 hour (60 * 60 * 1000)

router.post(
  '/register',
  rateLimiter(RATE_LIMIT_MAX_3, RATE_LIMIT_WINDOW_2_MINUTES),
  authControllers.registerUser,
);
router.post(
  '/complete-registration',
  rateLimiter(),
  authControllers.completeRegistration,
);

router.post(
  '/login',
  rateLimiter(RATE_LIMIT_MAX_15, RATE_LIMIT_WINDOW_1_HOUR),
  authControllers.loginUser,
);

module.exports = router;
