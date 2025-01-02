/**
 * @fileoverview Auth Routes
 * @description Routes for user authentication.
 */

const express = require('express');
const router = express.Router();

router.get('/register', (req, res) => {
  return res.render('pages/auth/register');
});

router.get('/register/complete', (req, res) => {
  if (!req.query.token) {
    return res.redirect('/register');
  }
  return res.render('pages/auth/complete-registration', {
    token: req.query.token,
  });
});

module.exports = router;
