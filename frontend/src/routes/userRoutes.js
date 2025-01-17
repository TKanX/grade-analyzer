/**
 * @fileoverview User Routes
 * @description Routes for user management.
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  return res.render('pages/user/profile');
});

router.get('/edit', (req, res) => {
  return res.render('pages/user/edit-profile');
});

router.get('/account', (req, res) => {
  return res.render('pages/user/account');
});

router.get('/account/complete-email-update', (req, res) => {
  if (!req.query.token) {
    return res.redirect('/user/account');
  }
  return res.render('pages/user/complete-email-update', {
    token: req.query.token,
  });
});

router.get('/settings', (req, res) => {
  res.render('pages/user/settings');
});

router.get('/security', (req, res) => {
  res.render('pages/user/security');
});

router.get('/logout', (req, res) => {
  res.render('pages/user/logout');
});

module.exports = router;
