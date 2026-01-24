import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: `MyBookCompass <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Confirma tu cuenta en MyBookCompass",
      html: `
        <div style="font-family: serif; background:#f4f1ea; padding:40px">
          <div style="max-width:500px;margin:auto;background:#fff;padding:30px;border-radius:8px">
            <h2 style="color:#7c2d12">Bienvenida a MyBookCompass 📚</h2>
            <p>Gracias por registrarte.</p>
            <p>Haz clic en el botón para confirmar tu correo:</p>
            <a href="${verifyUrl}"
               style="display:inline-block;margin-top:20px;padding:12px 20px;
                      background:#7c2d12;color:white;text-decoration:none;
                      border-radius:6px;font-weight:bold">
              Confirmar cuenta
            </a>
            <p style="margin-top:30px;font-size:12px;color:#666">
              Si no creaste esta cuenta, ignora este mensaje.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    throw error;
  }
};
