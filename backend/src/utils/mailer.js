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
Your password: ${password}
your role is: ${role}


— ARCOM Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Hi <b>${firstName}</b>,</p>
      <p>Your account has been created.</p>
      <p>
        <b>Username:</b> ${username}<br/>
        <b>Your password:</b> ${password}<br/>
        <b>Your role is:</b> ${role}
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
