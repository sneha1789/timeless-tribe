const express = require('express');
const router = express.Router();
const { handleContactForm } = require('../controllers/contactController');
const { verifyRecaptcha } = require('../middleware/recaptchaMiddleware');

// POST /api/contact/send
router.post('/send', verifyRecaptcha, handleContactForm);

module.exports = router;
