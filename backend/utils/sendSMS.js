const axios = require('axios');

const sendSMSOTP = async (mobileNumber, otp) => {
  try {
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    let finalNumber;

    if (cleanNumber.startsWith('91') || cleanNumber.startsWith('977')) {
      finalNumber = cleanNumber;
    } else {
      finalNumber = `977${cleanNumber}`;
    }

    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        message: `Your Timeless Tribe verification code is: ${otp}. Valid for 10 minutes.`,
        language: 'english',
        route: 'q',
        numbers: finalNumber,
        flash: 0,
      },
      headers: {
        'cache-control': 'no-cache',
      },
    });

    if (response.data.return === true) {
      console.log(`✅ SMS OTP sent to ${finalNumber}: ${otp}`);
      return {
        success: true,
        messageId: response.data.request_id,
      };
    } else {
      throw new Error(response.data.message || 'SMS sending failed');
    }
  } catch (error) {
    console.error('❌ Fast2SMS Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

const sendPasswordResetSMS = async (mobileNumber, otp) => {
  try {
    const finalNumber = `977${mobileNumber.replace(/\D/g, '').slice(-10)}`;

    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        message: `Your Timeless Tribe password reset code is: ${otp}. Valid for 10 minutes.`,
        language: 'english',
        route: 'q',
        numbers: finalNumber,
      },
    });

    if (response.data.return === true) {
      console.log(`✅ Password Reset SMS sent to ${finalNumber}: ${otp}`);
      return { success: true };
    } else {
      throw new Error(response.data.message || 'SMS sending failed');
    }
  } catch (error) {
    console.error(
      '❌ Fast2SMS Reset Error:',
      error.response?.data || error.message,
    );
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

module.exports = { sendSMSOTP, sendPasswordResetSMS };
