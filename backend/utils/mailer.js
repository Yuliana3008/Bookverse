import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"MyBookCompass 📚" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Confirma tu cuenta en MyBookCompass",
    html: `
      <div style="font-family: Georgia, serif; padding: 20px;">
        <h2>Bienvenido a MyBookCompass 📖</h2>
        <p>Gracias por registrarte. Para activar tu cuenta, confirma tu correo:</p>
        <a href="${verifyUrl}" 
           style="display:inline-block; padding:12px 20px; background:#b45309; color:white; text-decoration:none; border-radius:6px;">
           Confirmar cuenta
        </a>
        <p style="margin-top:20px; font-size:12px; color:#555;">
          Este enlace expira en 24 horas.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
