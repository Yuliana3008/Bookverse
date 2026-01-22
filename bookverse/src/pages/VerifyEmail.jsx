import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API_URL from "../config";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/auth/verify-email/${token}`
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setStatus("success");

        // redirigir al login después de 3s
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (err) {
        setStatus("error");
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center font-serif bg-[#f4f1ea]">
      {status === "loading" && <p>Verificando tu correo…</p>}

      {status === "success" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-700">
            ✅ Correo verificado
          </h1>
          <p className="mt-2">Ya puedes iniciar sesión.</p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-700">
            ❌ Enlace inválido o expirado
          </h1>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
