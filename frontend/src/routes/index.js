/**
 * @fileoverview Routes Index
 * @description Index file for routes.
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');

router.use('/', authRoutes);

router.get('/404', (req, res) => {
  res.render('pages/404', { path: req.query.path || '/' });
});

router.get('/403', (req, res) => {
  res.render('pages/403', { path: req.query.path || '/' });
});

router.get('*', (req, res) => {
  res.redirect(`/404?path=${req.path}`);
});

module.exports = router;
