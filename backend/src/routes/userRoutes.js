/**
 * @fileoverview User Routes
 * @description Routes for user-related operations.
 */

const express = require('express');
const router = express.Router();

const rateLimiter = require('../utils/rateLimiter');

const userControllers = require('../controllers/userControllers');

router.use(rateLimiter());

router.get('/:id', userControllers.getUser);
router.get('/:id/settings', userControllers.getSettings);
router.get('/:id/safety-records', userControllers.getSafetyRecords);

module.exports = router;
