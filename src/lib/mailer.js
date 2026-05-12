import nodemailer from 'nodemailer';

export async function sendMessageEmail({ name, email, subject, body }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email skipped: SMTP settings are missing.');
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `Matt Wright Portfolio <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL || 'mattwright10903@gmail.com',
    replyTo: email,
    subject: `Portfolio Message: ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${body}`,
  });

  return { sent: true };
}
