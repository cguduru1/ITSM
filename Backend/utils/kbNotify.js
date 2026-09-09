import axios from "axios";
import nodemailer from "nodemailer";

// Slack Webhook Notification
export async function notifySlack(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await axios.post(webhookUrl, { text: message });
  } catch (err) {
    console.error("Slack Notification Failed:", err?.response?.data || err.message);
  }
}
// Lazy Transporter Helper
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // True for 465, false for other ports
    auth: { user, pass }
  });
}

// Email Notification
export async function notifyEmail(to, subject, text) {
  if (!to) return;

  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn("Email skipped: SMTP credentials not fully configured in process.env");
      return;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text
    });
  } catch (err) {
    console.error("Email Notification Failed:", err.message);
  }
}
