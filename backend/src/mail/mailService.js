import nodemailer from "nodemailer";
import { config } from "../config/config.js";

let transporter;

// Built lazily so a missing/incomplete SMTP config doesn't crash the app at
// import time — it only surfaces when an email actually needs to be sent.
const getTransporter = () => {
  if (transporter) return transporter;

  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS.");
  }

  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort) || 587,
    secure: config.smtpSecure === "true",
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  return transporter;
};

/**
 * Generic mail sender. Reused by every email notification in the app so
 * Nodemailer setup lives in exactly one place.
 * Never throws-and-swallows: callers decide how to handle/log failures.
 */
export const sendMail = async ({ to, subject, html }) => {
  const mailer = getTransporter();

  return mailer.sendMail({
    from: config.mailFrom || config.smtpUser,
    to,
    subject,
    html,
  });
};

export default { sendMail };
