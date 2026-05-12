import nodemailer from 'nodemailer';

export async function sendMessageEmail({ name, email, subject, body }) {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const toEmail = process.env.CONTACT_TO_EMAIL || process.env.EMAIL_TO || process.env.ADMIN_EMAIL || 'mattwright10903@gmail.com';

  if (!host || !user || !pass) {
    console.warn('Email skipped: SMTP/EMAIL settings are missing.');
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: String(process.env.SMTP_SECURE || process.env.EMAIL_SECURE || 'true') === 'true',
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `Matt Wright Portfolio <${user}>`,
    to: toEmail,
    replyTo: email,
    subject: `Portfolio Message: ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${body}`,
  });

  return { sent: true };
}
