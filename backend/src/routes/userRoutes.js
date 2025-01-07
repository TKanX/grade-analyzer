/**
 * @fileoverview User Routes
 * @description Routes for user-related operations.
 */

const express = require('express');
const router = express.Router();

const rateLimiter = require('../utils/rateLimiter');

const userControllers = require('../controllers/userControllers');

const RATE_LIMIT_MAX_3 = 3;
const RATE_LIMIT_WINDOW_2_MINUTES = 120000; // 2 minutes (2 * 60 * 1000)

router.use(rateLimiter());

router.get('/:id', userControllers.getUser);
router.get('/:id/settings', userControllers.getSettings);
router.get('/:id/safety-records', userControllers.getSafetyRecords);

router.put('/:id/username', userControllers.updateUsername);
router.put(
  '/:id/email',
  rateLimiter(RATE_LIMIT_MAX_3, RATE_LIMIT_WINDOW_2_MINUTES),
  userControllers.updateEmail,
);

module.exports = router;
