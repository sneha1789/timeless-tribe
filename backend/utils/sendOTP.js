// Import the shared transporter instead of creating a new one
const { emailTransporter } = require('./sendEmail');

const sendEmailOTP = async (email, otp, userName = 'User') => {
  try {
    const mailOptions = {
      from: `"Timeless Tribe" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Timeless Tribe',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #e53935, #c62828); padding: 25px 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Timeless Tribe</h1>
            <p style="margin: 8px 0 0; font-size: 16px;">Email Verification</p>
          </div>
          <div style="padding: 30px 30px 40px; background: #ffffff;">
            <h2 style="color: #333; margin-top: 0; margin-bottom: 20px; font-size: 20px;">Hello ${userName},</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Thank you for registering! Use the One-Time Password (OTP) below to verify your email address:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #f1f1f1; color: #c62828; padding: 12px 25px; font-size: 28px; font-weight: bold; letter-spacing: 4px; border-radius: 6px; border: 1px solid #ddd;">
                ${otp}
              </div>
            </div>
            <p style="color: #777; font-size: 14px; text-align: center;">
              This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
          <div style="background: #f1f1f1; color: #888; padding: 15px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 12px;">
              &copy; ${new Date().getFullYear()} Timeless Tribe. All rights reserved.
            </p>
          </div>
        </div>
      `, // Slightly improved HTML template
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log(`Email OTP sent to ${email}: ${otp}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email OTP:', error);
    // Return a more user-friendly error
    return { success: false, error: 'Failed to send verification email.' };
  }
};

const sendPasswordResetEmail = async (email, otp, userName = 'User') => {
  try {
    const mailOptions = {
        from: `"Timeless Tribe" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request - Timeless Tribe',
         html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #e53935, #c62828); padding: 25px 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Timeless Tribe</h1>
                <p style="margin: 8px 0 0; font-size: 16px;">Password Reset</p>
              </div>
              <div style="padding: 30px 30px 40px; background: #ffffff;">
                <h2 style="color: #333; margin-top: 0; margin-bottom: 20px; font-size: 20px;">Hello ${userName},</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                  You requested to reset your password. Use the OTP below to complete the process:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <div style="display: inline-block; background: #f1f1f1; color: #c62828; padding: 12px 25px; font-size: 28px; font-weight: bold; letter-spacing: 4px; border-radius: 6px; border: 1px solid #ddd;">
                    ${otp}
                  </div>
                </div>
                <p style="color: #777; font-size: 14px; text-align: center;">
                  This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.
                </p>
              </div>
              <div style="background: #f1f1f1; color: #888; padding: 15px; text-align: center; border-top: 1px solid #eee;">
                <p style="margin: 0; font-size: 12px;">
                  &copy; ${new Date().getFullYear()} Timeless Tribe. All rights reserved.
                </p>
              </div>
            </div>
      `, // Slightly improved HTML template
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`Password Reset OTP sent to ${email}: ${otp}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email OTP:', error);
    return { success: false, error: 'Failed to send password reset email.' };
  }
};

module.exports = {
  sendEmailOTP,
  sendPasswordResetEmail,
};
