import nodemailer from "nodemailer";

const hasSmtpConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransporter = () =>
    nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

const sendPasswordResetLink = async ({ email, resetLink }) => {
    if (!hasSmtpConfig()) {
        console.log(`Password reset requested for ${email}. Reset link: ${resetLink}`);
        return {
            delivered: false,
            message: "Email service not configured. Reset link logged to the backend console for local development.",
        };
    }

    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
        from,
        to: email,
        subject: "Prescripto password reset",
        text: `Hello,\n\nWe received a request to reset the password for your Prescripto account.\n\nReset your password using this secure link:\n${resetLink}\n\nThis link will expire in 30 minutes. If you did not request this password reset, you can safely ignore this email and your password will remain unchanged.\n\nRegards,\nPrescripto Support`,
        html: `
            <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
                <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
                    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                        <div style="padding:24px 28px;background:#111827;color:#ffffff;">
                            <h1 style="margin:0;font-size:22px;line-height:1.3;font-weight:700;">Password Reset Request</h1>
                            <p style="margin:8px 0 0;font-size:14px;color:#d1d5db;">Prescripto Account Security</p>
                        </div>
                        <div style="padding:28px;">
                            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hello,</p>
                            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                                We received a request to reset the password for your Prescripto account. Click the button below to create a new password.
                            </p>
                            <p style="margin:24px 0;text-align:center;">
                                <a href="${resetLink}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:13px 22px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:700;">
                                    Reset Password
                                </a>
                            </p>
                            <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4b5563;">
                                This secure link will expire in <strong>30 minutes</strong>. If you did not request this password reset, you can safely ignore this email and your password will remain unchanged.
                            </p>
                            <div style="margin-top:24px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
                                <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#4b5563;">If the button does not work, copy and paste this link into your browser:</p>
                                <p style="margin:0;font-size:13px;line-height:1.5;word-break:break-all;">
                                    <a href="${resetLink}" style="color:#2563eb;text-decoration:none;">${resetLink}</a>
                                </p>
                            </div>
                            <p style="margin:24px 0 0;font-size:15px;line-height:1.6;">
                                Regards,<br />
                                <strong>Prescripto Support</strong>
                            </p>
                        </div>
                    </div>
                    <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#6b7280;">
                        This is an automated email. Please do not reply to this message.
                    </p>
                </div>
            </div>
        `,
    });

    return {
        delivered: true,
        message: "Reset link sent to your email.",
    };
};

export { sendPasswordResetLink };
