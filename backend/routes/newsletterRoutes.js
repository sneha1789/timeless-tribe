const express = require('express');
const router = express.Router();
const { subscribeToNewsletter } = require('../controllers/newsletterController');
const { verifyRecaptcha } = require('../middleware/recaptchaMiddleware');

// The route for the form submission
// POST /api/newsletter/subscribe
router.post('/subscribe', verifyRecaptcha, subscribeToNewsletter);

module.exports = router;
