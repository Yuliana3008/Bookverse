import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API_URL from "../config";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("form");
  const [message, setMessage] = useState("");
  // Nuevo estado para la visibilidad
  const [showPassword, setShowPassword] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token inválido.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setStatus("success");

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setMessage("El enlace es inválido o expiró.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f1ea] font-serif p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-stone-200">
        {status === "form" && (
          <>
            <h1 className="text-2xl font-black text-stone-800 mb-4">
              Nueva contraseña
            </h1>

            {message && (
              <div className="mb-4 p-3 text-sm bg-red-50 border-l-4 border-red-700 text-red-800">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Contraseña con botón de mostrar/ocultar */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-stone-300 bg-stone-50 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-xs font-sans font-bold uppercase tracking-tighter text-stone-500 hover:text-stone-900"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              {/* Campo Confirmar con el mismo estado de visibilidad */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-stone-300 bg-stone-50 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-stone-900 hover:bg-amber-800 text-white py-3 font-serif italic transition"
              >
                Actualizar contraseña
              </button>
            </form>
          </>
        )}

        {status === "success" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-700">
              ✅ Contraseña actualizada
            </h2>
            <p className="mt-2 text-stone-600">
              Serás redirigida al inicio de sesión…
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-700">
              ❌ Enlace inválido
            </h2>
            <p className="mt-2 text-stone-600">
              Solicita un nuevo enlace de recuperación.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;