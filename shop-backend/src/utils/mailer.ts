import nodemailer from "nodemailer";

// Configure based on env variables, or mock for dev if missing
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "user",
    pass: process.env.SMTP_PASS || "pass",
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"QuickOrder Shop" <noreply@example.com>',
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // In dev, we might just want to log it if no real SMTP
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV-MOCK-EMAIL] To: ${to}, Subject: ${subject}`);
    }
    // throw error; // Don't crash if email fails?
    return null;
  }
};
