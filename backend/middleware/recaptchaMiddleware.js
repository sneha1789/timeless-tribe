const axios = require('axios');

const verifyRecaptcha = async (req, res, next) => {
  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ message: 'reCAPTCHA token is missing.' });
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
    );

    if (response.data.success) {
      next();
    } else {
      res
        .status(401)
        .json({ message: 'reCAPTCHA verification failed. Please try again.' });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500).json({ message: 'Error verifying reCAPTCHA.' });
  }
};

module.exports = { verifyRecaptcha };
