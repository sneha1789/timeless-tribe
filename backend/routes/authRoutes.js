const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);

      res.redirect(
        `${
          process.env.FRONTEND_URL
        }/auth/success?token=${token}&user=${encodeURIComponent(
          JSON.stringify({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
          }),
        )}`,
      );
    } catch (error) {
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/error?message=Authentication failed`,
      );
    }
  },
);

router.get('/user', (req, res) => {
  res.json(req.user || null);
});

module.exports = router;
