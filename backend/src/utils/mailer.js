import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 465),
  secure: process.env.EMAIL_SECURE === "true", // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Sent when an Admin CREATES a new user account ──────────────────────
// The password is temporary. The user must change it in Account Settings.
export async function sendCredentialsEmail({
  to,
  firstName,
  username,
  password,
  role,
}) {
  const subject = "Your ARCOM account credentials";
  const text = `Hi ${firstName},

Your account has been created.

Username: ${username}
Temporary Password: ${password}
Your role is: ${role}

IMPORTANT: This is a temporary password. Please log in and change it
immediately inside Account Settings.

— ARCOM Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Hi <b>${firstName}</b>,</p>
      <p>Your account has been created.</p>
      <p>
        <b>Username:</b> ${username}<br/>
        <b>Temporary Password:</b> ${password}<br/>
        <b>Your role is:</b> ${role}
      </p>
      <p style="color:#c0392b; font-weight:bold;">
        ⚠️ This is a temporary password. Please log in and change it immediately
        inside <em>Account Settings</em>.
      </p>
      <p>— ARCOM Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
}

// ─── Sent when an Admin RESETS an existing user's password ───────────────
export async function sendPasswordResetEmail({
  to,
  firstName,
  username,
  newPassword,
}) {
  const subject = "Your ARCOM password has been reset";
  const text = `Hi ${firstName},

An admin has reset your ARCOM account password.

Username: ${username}
New Temporary Password: ${newPassword}

IMPORTANT: This is a temporary password. Please log in and change it
immediately inside Account Settings.

— ARCOM Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Hi <b>${firstName}</b>,</p>
      <p>An admin has reset your ARCOM account password.</p>
      <p>
        <b>Username:</b> ${username}<br/>
        <b>New Temporary Password:</b> ${newPassword}
      </p>
      <p style="color:#c0392b; font-weight:bold;">
        ⚠️ This is a temporary password. Please log in and change it immediately
        inside <em>Account Settings</em>.
      </p>
      <p>— ARCOM Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
}
