/**
 * @fileoverview Routes Index
 * @description Index file for routes.
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

router.use('*', (req, res) => {
  res.notFound();
});

module.exports = router;
