import nodemailer from 'nodemailer';

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function sendMessageEmail({ name, email, subject, body }) {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const toEmail = process.env.CONTACT_TO_EMAIL || process.env.EMAIL_TO || process.env.ADMIN_EMAIL || 'mattwright10903@gmail.com';

  if (!host || !user || !pass) {
    console.warn('Email skipped: SMTP/EMAIL settings are missing. Message was still saved to the admin live inbox.');
    return { skipped: true };
  }

  const secureDefault = Number(port) === 465;
  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: String(process.env.SMTP_SECURE || process.env.EMAIL_SECURE || secureDefault) === 'true',
    auth: { user, pass },
  });

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject || 'New website message');
  const safeBody = escapeHtml(body).replace(/\n/g, '<br>');

  await transporter.sendMail({
    from: `Matt Wright Portfolio <${user}>`,
    to: toEmail,
    replyTo: email,
    subject: `New Portfolio Request: ${subject || 'Website message'}`,
    text: `New website project request\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${body}\n\nReply directly to this email to respond to the client.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#050505;color:#fff;padding:28px;border-radius:16px">
        <h2 style="margin:0 0 12px;color:#fff">New Portfolio Project Request</h2>
        <p style="margin:0 0 20px;color:#bbb">A new request was submitted through mattwright.online.</p>
        <div style="background:#111;border:1px solid #333;border-radius:14px;padding:18px">
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> <a style="color:#ef233c" href="mailto:${safeEmail}">${safeEmail}</a></p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <hr style="border:none;border-top:1px solid #333;margin:16px 0">
          <p style="line-height:1.6;color:#ddd">${safeBody}</p>
        </div>
        <p style="color:#777;margin-top:18px;font-size:12px">This message was also saved in the admin live inbox.</p>
      </div>
    `,
  });

  return { sent: true };
}
