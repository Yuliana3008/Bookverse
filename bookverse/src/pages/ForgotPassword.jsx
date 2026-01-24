import { useState } from "react";
import { Mail } from "lucide-react";
import API_URL from "../config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      setMessage({
        type: "success",
        text:
          data.message ||
          "Si el correo existe, se enviará un enlace para restablecer la contraseña.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: "Error al enviar el correo. Intenta más tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f1ea] font-serif p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-stone-200">
        <h1 className="text-2xl font-black text-stone-800 mb-2">
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-stone-600 mb-6">
          Introduce tu correo y te enviaremos un enlace para restablecerla.
        </p>

        {message && (
          <div
            className={`mb-4 p-3 text-sm border-l-4 ${
              message.type === "success"
                ? "bg-stone-100 border-amber-700 text-stone-800"
                : "bg-red-50 border-red-700 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-stone-300 bg-stone-50 focus:border-amber-700 outline-none"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-amber-800 text-white py-3 font-serif italic transition disabled:opacity-50"
          >
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
