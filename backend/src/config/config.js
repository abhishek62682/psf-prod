import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  databaseUrl: process.env.MONGO_CONNECTION_STRING,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
 
  frontendDomains: (process.env.FRONTEND_DOMAIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  
  adminPanelUrl: process.env.ADMIN_PANEL_URL || "http://localhost:5174",
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpSecure: process.env.SMTP_SECURE,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  mailFrom: process.env.MAIL_FROM,
};

export const config = Object.freeze(_config);
