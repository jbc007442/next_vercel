import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Reusable function
export const sendOTPEmail = async (
  email: string,
  otp: string,
  type: 'signup' | 'login' = 'login'
) => {
  try {
    const isSignup = type === 'signup';

    const subject = isSignup ? 'Verify your Crontex account' : 'Your Crontex login OTP';

    const title = isSignup ? 'Welcome to Crontex 🎉' : 'Login to Crontex 🔐';

    const message = isSignup
      ? 'Thank you for signing up! Please verify your account using the OTP below.'
      : 'Use the OTP below to securely login to your account.';

    const info = await transporter.sendMail({
      from: `"Crontex" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; text-align: center; padding: 20px;">
          
          <h2 style="color: #333;">${title}</h2>
          
          <p style="color: #555;">
            ${message}
          </p>

          <div style="
            margin: 20px 0;
            padding: 15px;
            font-size: 28px;
            letter-spacing: 6px;
            font-weight: bold;
            background: #f4f4f4;
            border-radius: 8px;
            display: inline-block;
          ">
            ${otp}
          </div>

          <p style="color: #777;">
            This OTP is valid for <b>5 minutes</b>.
          </p>

          <p style="color: #999; font-size: 12px;">
            If you didn’t request this, you can safely ignore this email.
          </p>

        </div>
      `,
    });

    console.log(`✅ ${type.toUpperCase()} Email sent:`, info.messageId);
  } catch (error) {
    console.error('❌ Email error:', error);
    throw new Error('Failed to send OTP email');
  }
};
