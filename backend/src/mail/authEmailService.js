import { sendMail } from "./mailService.js";
import { buildPasswordResetEmail } from "./authEmailTemplates.js";

export const sendPasswordResetEmail = async (admin, resetLink) => {
  const { subject, html } = buildPasswordResetEmail({ name: admin.name, resetLink });

  return sendMail({ to: admin.email, subject, html });
};
