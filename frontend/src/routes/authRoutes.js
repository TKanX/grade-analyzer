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

router.get('/login', (req, res) => {
  res.render('pages/auth/login', { redirect: req.query.redirect });
});

router.get('/password-reset', (req, res) => {
  res.render('pages/auth/password-reset');
});

module.exports = router;
