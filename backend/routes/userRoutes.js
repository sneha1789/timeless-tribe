const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {
  registerUser,
  loginUser,
  verifyEmail,
  verifyMobile,
  resendOTP,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  deleteUserByAdmin,
  getUsersByAdmin,
  sendLoginOtp,
  verifyLoginOtp,
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
  
} = require('../controllers/userController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');
const { googleAuth } = require('../controllers/googleAuthController');
const { verifyRecaptcha } = require('../middleware/recaptchaMiddleware.js');

router.post('/register', verifyRecaptcha, registerUser);
router.post('/login', verifyRecaptcha, loginUser);

router.post('/verify-email', verifyEmail);
router.post('/verify-mobile', verifyMobile);
router.post('/resend-otp', resendOTP);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

router.route('/').get(protect, admin, getUsersByAdmin);

router.route('/:id').delete(protect, admin, deleteUserByAdmin);

router.post('/google-auth', googleAuth);
router.post('/send-login-otp', sendLoginOtp);
router.post('/verify-login-otp', verifyLoginOtp);

router.post('/forgot-password', forgotPasswordRequest);
router.post('/reset-password', resetPassword);

router.put('/profile/change-password', protect, changePassword);
router.post('/profile/request-change', protect, requestContactChange);
router.post('/profile/verify-change', protect, verifyContactChange);
router.post('/profile/delete', protect, deleteUserWithPasswordVerification);
router.put('/profile/set-password', protect, setPassword);
router.put(
  '/profile/picture',
  protect,
  upload.single('profilePicture'),
  updateProfilePicture,
);
router.delete('/profile/picture', protect, removeProfilePicture);

router.post('/profile/initiate-reset', protect, initiatePasswordReset);
router.post('/profile/execute-reset', protect, executePasswordReset);

module.exports = router;
