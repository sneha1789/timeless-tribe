const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required',
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture, sub: googleId } = payload;

    console.log('Google auth payload:', { email, name, googleId });

    let user = await User.findOne({ email: email });

    if (user) {
      user.googleId = googleId;
      user.isEmailVerified = true;
      user.profilePicture = picture;
      await user.save();
      console.log('Existing user updated:', user.email);
    } else {
      user = await User.create({
        name: name,
        email: email,
        password: `google-oauth-${Date.now()}`,
        googleId: googleId,
        isEmailVerified: true,
        profilePicture: picture,
      });
      console.log('New user created:', user.email);
    }

    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,

        profilePicture: user.profilePicture,
      },
      message: 'Google authentication successful',
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({
      success: false,
      message: 'Google authentication failed: ' + error.message,
    });
  }
};

module.exports = { googleAuth };
