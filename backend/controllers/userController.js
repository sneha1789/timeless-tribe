const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmailOTP, sendPasswordResetEmail } = require('../utils/sendOTP');
const { sendSMSOTP, sendPasswordResetSMS } = require('../utils/sendSMS');
const { uploadToCloudinary } = require('../utils/cloudinary');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const sendLoginOtp = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  try {
    const user = await User.findOne({ mobile });

    if (!user) {
      return res
        .status(404)
        .json({ message: 'User with this mobile number is not registered' });
    }

    const otp = generateOTP();
    user.loginOtp = otp;
    user.loginOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendSMSOTP(mobile, otp);

    res
      .status(200)
      .json({ message: 'OTP sent successfully to your mobile number.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const verifyLoginOtp = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res
      .status(400)
      .json({ message: 'Mobile number and OTP are required' });
  }

  try {
    const user = await User.findOne({
      mobile,
      loginOtp: otp,
      loginOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    user.loginOtp = null;
    user.loginOtpExpires = null;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isMobileVerified: user.isMobileVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password, mobile } = req.body;

  try {
    const userExists = await User.findOne({
      $or: [
        { email: email ? email.toLowerCase() : null },
        { mobile: mobile || null },
      ].filter((c) => Object.values(c)[0] !== null),
    });

    if (userExists) {
      if (email && userExists.email === email.toLowerCase()) {
        return res
          .status(400)
          .json({ message: 'User with this email already exists' });
      }
      if (mobile && userExists.mobile === mobile) {
        return res
          .status(400)
          .json({ message: 'User with this mobile number already exists' });
      }
    }

    const newUser_data = {
      name,
      password,
    };

    if (email) {
      newUser_data.email = email.toLowerCase();
      newUser_data.emailVerificationToken = generateOTP();
      newUser_data.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
    }

    if (mobile) {
      newUser_data.mobile = mobile;
      newUser_data.mobileVerificationToken = generateOTP();
      newUser_data.mobileVerificationExpires = Date.now() + 10 * 60 * 1000;
    }

    const user = await User.create(newUser_data);

    if (user) {
      if (user.email) {
        await sendEmailOTP(user.email, user.emailVerificationToken, name);
      }
      if (user.mobile) {
        await sendSMSOTP(user.mobile, user.mobileVerificationToken);
      }

      const responseData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,

        message:
          'User registered successfully. Please verify your email/mobile.',
      };
      res.status(201).json(responseData);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, mobile, password } = req.body;

  try {
    let user;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (mobile) {
      user = await User.findOne({ mobile: mobile });
    } else {
      return res
        .status(400)
        .json({ message: 'Email or mobile number is required.' });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPasswordRequest = async (req, res) => {
  const { email, mobile } = req.body;

  try {
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (mobile) {
      user = await User.findOne({ mobile });
    }

    if (user) {
      if (
        user.resetPasswordLockoutExpires &&
        user.resetPasswordLockoutExpires > Date.now()
      ) {
        const remainingTime = Math.ceil(
          (user.resetPasswordLockoutExpires - Date.now()) / (60 * 60 * 1000),
        );
        return res.status(429).json({
          message: `Too many failed attempts. Please try again in about ${remainingTime} hour(s).`,
        });
      }
    }

    if (user) {
      const resetToken = generateOTP();
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
      await user.save();

      if (email) {
        await sendPasswordResetEmail(user.email, resetToken, user.name);
      } else if (mobile) {
        await sendPasswordResetSMS(user.mobile, resetToken);
      }
    }

    res.status(200).json({
      message:
        'If an account exists with this credential, a reset OTP has been sent.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while processing request.' });
  }
};

const resetPassword = async (req, res) => {
  const { email, mobile, token, newPassword } = req.body;

  try {
    const user = await User.findOne(
      email ? { email: email.toLowerCase() } : { mobile },
    );

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    if (
      user.resetPasswordLockoutExpires &&
      user.resetPasswordLockoutExpires > Date.now()
    ) {
      const remainingTime = Math.ceil(
        (user.resetPasswordLockoutExpires - Date.now()) / (60 * 60 * 1000),
      );
      return res.status(429).json({
        message: `Too many failed attempts. Please try again in about ${remainingTime} hour(s).`,
      });
    }

    const isTokenValid =
      user.resetPasswordToken === token &&
      user.resetPasswordExpires > Date.now();

    if (isTokenValid) {
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.resetPasswordAttempts = 0;
      user.resetPasswordLockoutExpires = undefined;
      await user.save();

      res.status(200).json({
        message: 'Password has been reset successfully. Please log in.',
      });
    } else {
      user.resetPasswordAttempts += 1;

      if (user.resetPasswordAttempts >= 5) {
        user.resetPasswordLockoutExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
        return res.status(429).json({
          message:
            'Too many failed attempts. Your account is locked for 24 hours for security.',
        });
      }

      await user.save();
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while resetting password.' });
  }
};

const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationToken: otp,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      message: 'Email verified successfully',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyMobile = async (req, res) => {
  const { mobile, otp } = req.body;

  try {
    const user = await User.findOne({
      mobile: mobile,
      mobileVerificationToken: otp,
      mobileVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isMobileVerified = true;
    user.mobileVerificationToken = undefined;
    user.mobileVerificationExpires = undefined;
    await user.save();

    res.json({
      message: 'Mobile number verified successfully',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resendOTP = async (req, res) => {
  const { email, mobile, type } = req.body;

  try {
    let user;
    if (type === 'email') {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = await User.findOne({ mobile });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newOTP = generateOTP();

    if (type === 'email') {
      user.emailVerificationToken = newOTP;
      user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;

      const emailResult = await sendEmailOTP(email, newOTP, user.name);
      if (!emailResult.success) {
        return res.status(500).json({ message: 'Failed to send email OTP' });
      }
    } else {
      user.mobileVerificationToken = newOTP;
      user.mobileVerificationExpires = Date.now() + 10 * 60 * 1000;

      const smsResult = await sendSMSOTP(mobile, newOTP);

      if (!smsResult.success) {
        return res.status(500).json({ message: 'Failed to send SMS OTP' });
      }
    }

    await user.save();

    const responseData = {
      message: 'OTP sent successfully',
      type: type,
    };

    if (process.env.NODE_ENV === 'development') {
      responseData.otp = newOTP;
      responseData.debug = 'OTP shown only in development';
    }

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setPassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (
      user.password &&
      (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))
    ) {
      return res
        .status(400)
        .json({ message: 'Account already has a password.' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password created successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfilePicture = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided.' });
  }

  try {
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    const newImageUrl = uploadResult.secure_url;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: newImageUrl },
      { new: true },
    );

    res.json({
      success: true,
      message: 'Profile picture updated successfully.',
      profilePicture: updatedUser.profilePicture,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to upload image. ' + error.message });
  }
};

const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      dob: user.dob,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isMobileVerified: user.isMobileVerified,
      pendingEmail: user.pendingEmail,
      pendingMobile: user.pendingMobile,
      hasPassword:
        !!user.password &&
        (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')),
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.dob = req.body.dob || user.dob;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        dob: updatedUser.dob,
        profilePicture: updatedUser.profilePicture,
        isEmailVerified: updatedUser.isEmailVerified,
        isMobileVerified: updatedUser.isMobileVerified,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Please provide both old and new passwords.' });
  }

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect old password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } },
    );

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestContactChange = async (req, res) => {
  const { type, value } = req.body;
  const userId = req.user._id;

  if (!type || !value) {
    return res.status(400).json({ message: 'Type and value are required.' });
  }

  try {
    const user = await User.findById(userId);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    if (type === 'email' && user.emailLastChangedAt > sixtyDaysAgo) {
      return res.status(429).json({
        message: 'You can only change your email once every 60 days.',
      });
    }
    if (type === 'mobile' && user.mobileLastChangedAt > sixtyDaysAgo) {
      return res.status(429).json({
        message: 'You can only change your mobile number once every 60 days.',
      });
    }

    const existingUser = await User.findOne({ [type]: value });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res.status(400).json({
        message: `This ${type} is already associated with another account.`,
      });
    }

    const otp = generateOTP();
    const updateData = {
      changeVerificationToken: otp,
      changeVerificationExpires: Date.now() + 10 * 60 * 1000,
    };

    if (type === 'email') {
      updateData.pendingEmail = value;
      await sendEmailOTP(value, otp, user.name);
    } else {
      updateData.pendingMobile = value;
      await sendSMSOTP(value, otp);
    }

    await User.updateOne({ _id: userId }, { $set: updateData });

    res.json({
      message: `A verification OTP has been sent to your new ${type}.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyContactChange = async (req, res) => {
  const { token } = req.body;
  const userId = req.user._id;
  try {
    const user = await User.findOne({
      _id: userId,
      changeVerificationToken: token,
      changeVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    if (user.pendingEmail) {
      user.email = user.pendingEmail;
      user.isEmailVerified = true;
      user.emailLastChangedAt = Date.now();
      user.pendingEmail = undefined;
    } else if (user.pendingMobile) {
      user.mobile = user.pendingMobile;
      user.isMobileVerified = true;
      user.mobileLastChangedAt = Date.now();
      user.pendingMobile = undefined;
    }

    user.changeVerificationToken = undefined;
    user.changeVerificationExpires = undefined;
    const updatedUser = await user.save();

    res.json({
      message: 'Your contact information has been updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUserWithPasswordVerification = async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res
      .status(400)
      .json({ message: 'Password is required for account deletion.' });
  }

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    await user.deleteOne();
    res.json({ message: 'User account deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User account deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsersByAdmin = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeProfilePicture = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: '' },
      { new: true },
    );
    res.json({
      success: true,
      message: 'Profile picture removed.',
      profilePicture: updatedUser.profilePicture,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to remove picture. ' + error.message });
  }
};

const initiatePasswordReset = async (req, res) => {
  const { type } = req.body;
  if (!['email', 'mobile'].includes(type)) {
    return res
      .status(400)
      .json({ message: 'Invalid verification type specified.' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (type === 'email' && !user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is not verified.' });
    }
    if (type === 'mobile' && !user.isMobileVerified) {
      return res.status(400).json({ message: 'Mobile is not verified.' });
    }

    const resetToken = generateOTP();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    if (type === 'email') {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
    } else {
      await sendPasswordResetSMS(user.mobile, resetToken);
    }

    res.json({ message: `An OTP has been sent to your verified ${type}.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error while sending OTP.' });
  }
};

const executePasswordReset = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (
      user.resetPasswordLockoutExpires &&
      user.resetPasswordLockoutExpires > Date.now()
    ) {
      const remainingTime = Math.ceil(
        (user.resetPasswordLockoutExpires - Date.now()) / (60 * 60 * 1000),
      );
      return res.status(429).json({
        message: `Too many failed attempts. Your account is locked for password changes for about ${remainingTime} hour(s). Please contact support for assistance.`,
      });
    }

    const isTokenValid =
      user.resetPasswordToken === token &&
      user.resetPasswordExpires > Date.now();

    if (isTokenValid) {
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.resetPasswordAttempts = 0;
      user.resetPasswordLockoutExpires = undefined;
      await user.save();
      res.json({ message: 'Password has been reset successfully.' });
    } else {
      user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;

      if (user.resetPasswordAttempts >= 5) {
        user.resetPasswordLockoutExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
        return res.status(429).json({
          message:
            'Too many failed attempts. Your account is locked for password changes for 24 hours for security. Please contact support if you need immediate assistance.',
        });
      }

      await user.save();
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while resetting password.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  verifyMobile,
  resendOTP,
  sendLoginOtp,
  verifyLoginOtp,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  deleteUserByAdmin,
  getUsersByAdmin,
  forgotPasswordRequest,
  resetPassword,
  changePassword,
  requestContactChange,
  verifyContactChange,
  deleteUserWithPasswordVerification,
  setPassword,
  updateProfilePicture,
  removeProfilePicture,
  initiatePasswordReset,
  executePasswordReset,
};
