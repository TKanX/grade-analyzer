/**
 * @fileoverview Grade Routes
 * @description Routes for interacting with grades.
 */

const express = require('express');
const router = express.Router();

const rateLimiter = require('../utils/rateLimiter');

const gradeControllers = require('../controllers/gradeControllers');

router.use(rateLimiter());

router.get('/', gradeControllers.getGrades);

module.exports = router;
