import nodemailer from 'nodemailer';

export async function sendDigestEmail(targetEmail: string, htmlContent: string): Promise<boolean> {
  // Read SMTP settings from environment variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.FROM_EMAIL || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error('SMTP configuration is missing in environment variables.');
    return false;
  }

  if (!targetEmail) {
    console.error('Target email address is not configured.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mailOptions = {
    from: `"AI News Aggregator" <${fromEmail}>`,
    to: targetEmail,
    subject: `Your AI Daily Digest - ${date}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
        <h1 style="color: #2563eb; text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">AI Daily Digest</h1>
        ${htmlContent}
        <div style="margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Generated automatically by your AI News Aggregator on ${new Date().toLocaleString()}
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
