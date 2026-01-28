const nodemailer = require("nodemailer");
const env = require("../configs/env");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.emailUser,
        pass: env.emailPass,
      },
    });
  }

  async sendOtp(email, otp, purpose) {
    const subject =
      purpose === "VERIFY" ? "Verify your account" : "Reset your password";

    try {
      await this.transporter.sendMail({
        from: `"Smart Shuttle Dispatch System" <${env.emailUser}>`,
        to: email,
        subject,
        html: `
        <h3>Your OTP Code</h3>
        <h1>${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
        <p>Thank you for using Smart Shuttle Dispatch System</p>
      `,
      });
      console.log(`✅ Email sent to ${email}`);
    } catch (error) {
      console.error(`❌ Email send failed to ${email}:`, error.message);
      throw error;
    }
  }
}

module.exports = new EmailService();
