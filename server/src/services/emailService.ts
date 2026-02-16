import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getSecret } from '../utils/crypto.js';

dotenv.config();

let smtpPass: string;
try {
  smtpPass = getSecret('SMTP_PASS');
} catch {
  smtpPass = process.env.SMTP_PASS || '';
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: smtpPass,
  },
});

// ─── Email Templates ─────────────────────────────────────

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f4f7fa; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4285F4, #5a9cf5); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px; color: #333; }
    .body h2 { color: #1e1b2e; font-size: 20px; margin-top: 0; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; }
    .info-table td:first-child { font-weight: 600; color: #555; width: 140px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-pending { background: #fff3cd; color: #856404; }
    .badge-approved { background: #d4edda; color: #155724; }
    .badge-rejected { background: #f8d7da; color: #721c24; }
    .btn { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #4285F4, #5a9cf5); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; }
    .footer { padding: 20px 32px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Form Genie</h1>
      <p>Smart Google Form Automation</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Form Genie. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Send Functions ─────────────────────────────────────

export async function sendRegistrationEmail(userData: {
  name: string;
  email: string;
  contact: string;
  plan: string;
  transactionId: string;
  screenshotUrl: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'arasukirubanandhan2430035@ssn.edu.in';

  const planMap: Record<string, string> = {
    starter: 'Starter – 150 submissions (₹100)',
    pro: 'Pro – 300 submissions (₹180)',
    executive: 'Executive – 500 submissions (₹300)',
  };

  const content = `
    <h2>🆕 New User Registration — Approval Required</h2>
    <p>A new user has registered and is awaiting your approval.</p>
    <table class="info-table">
      <tr><td>Name</td><td>${userData.name}</td></tr>
      <tr><td>Email</td><td>${userData.email}</td></tr>
      <tr><td>Contact</td><td>${userData.contact}</td></tr>
      <tr><td>Plan</td><td>${planMap[userData.plan] || userData.plan}</td></tr>
      <tr><td>Transaction ID</td><td><strong>${userData.transactionId}</strong></td></tr>
      <tr><td>Status</td><td><span class="badge badge-pending">Pending Approval</span></td></tr>
    </table>
    <p><strong>Payment Screenshot:</strong></p>
    <a href="${userData.screenshotUrl}" class="btn" style="color: #fff;">View Screenshot</a>
    <p style="margin-top: 24px; color: #666; font-size: 13px;">
      Login to the admin dashboard to approve or reject this user.
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"Form Genie" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `New User Registration – Approval Required: ${userData.name}`,
      html: baseTemplate(content),
    });
    console.log('✅ Registration email sent to admin');
  } catch (error) {
    console.error('❌ Failed to send registration email:', error);
  }
}

export async function sendApprovalEmail(userEmail: string, userName: string) {
  const content = `
    <h2>🎉 Account Approved!</h2>
    <p>Hi <strong>${userName}</strong>,</p>
    <p>Great news! Your Form Genie account has been <span class="badge badge-approved">Approved</span>.</p>
    <p>You can now log in and start using the smart form automation features.</p>
    <a href="#" class="btn" style="color: #fff;">Login Now</a>
    <p style="margin-top: 24px; color: #666; font-size: 13px;">
      If you have any questions, feel free to contact us via WhatsApp.
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"Form Genie" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Form Genie — Account Approved ✅',
      html: baseTemplate(content),
    });
    console.log('✅ Approval email sent to', userEmail);
  } catch (error) {
    console.error('❌ Failed to send approval email:', error);
  }
}

export async function sendRejectionEmail(userEmail: string, userName: string) {
  const content = `
    <h2>Account Update</h2>
    <p>Hi <strong>${userName}</strong>,</p>
    <p>We regret to inform you that your Form Genie registration has been <span class="badge badge-rejected">Rejected</span>.</p>
    <p>This may be due to an invalid payment or incomplete information. If you believe this is an error, please reach out to our support team.</p>
    <a href="https://wa.me/917708414584" class="btn" style="color: #fff;">Contact Support</a>
    <p style="margin-top: 24px; color: #666; font-size: 13px;">
      You may re-register with valid payment details.
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"Form Genie" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Form Genie — Registration Update',
      html: baseTemplate(content),
    });
    console.log('✅ Rejection email sent to', userEmail);
  } catch (error) {
    console.error('❌ Failed to send rejection email:', error);
  }
}
