import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetEmail = async ({ toEmail, resetUrl, userName }) => {
  await resend.emails.send({
    from: 'Moilearn <onboarding@resend.dev>', 
    to: toEmail,
    subject: 'Reset your Moilearn password',
    html: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 520px; margin: auto; padding: 32px; background: #ffffff; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #16a34a, #166534); padding: 4px; border-radius: 8px; margin-bottom: 28px; width: fit-content;">
          <span style="color: white; font-weight: 700; font-size: 18px; padding: 8px 16px; display: block;">Moilearn</span>
        </div>
        <h2 style="color: #111827; font-size: 22px; margin-bottom: 8px;">Password Reset Request</h2>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">Hi ${userName || 'there'},</p>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
          We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: #16a34a; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Reset Password
        </a>
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email. Your password won't change.
        </p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        <p style="color: #d1d5db; font-size: 12px;">© ${new Date().getFullYear()} Moilearn. All rights reserved.</p>
      </div>
    `,
  });
};