import React, { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, BookOpen } from "lucide-react";
import { io } from "socket.io-client"; // ✅ NUEVO

import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";
import API_URL from "../config";

const BookVerseLayout = () => {
  const navigate = useNavigate();

  // ✅ Sesión real (cookie + /me)
  const [authUser, setAuthUser] = useState(null);

  // UI states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const isAuthenticated = !!authUser;
  const userName = authUser?.name || "Usuario";
  const userId = authUser?.id ?? null;

  // ✅ SOCKET: lo guardamos en un ref para NO recrearlo en cada render
  const socketRef = useRef(null);

  /**
   * ✅ checkSession:
   * - pide /me con credentials: include para enviar cookies
   * - si hay sesión, setAuthUser(user)
   * - si no, setAuthUser(null)
   */
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        setAuthUser(null);
        return null;
      }

      const data = await res.json();
      const user = data?.user ?? null;
      setAuthUser(user);
      return user;
    } catch (err) {
      setAuthUser(null);
      return null;
    }
  }, [API_URL]);

  // Alias opcional
  const refreshSession = checkSession;

  // ✅ Check inicial (al cargar)
  useEffect(() => {
    let mounted = true;

    (async () => {
      await checkSession();
      if (mounted) setIsReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, [checkSession]);

  // ✅ Auto-limpiar notificaciones
  useEffect(() => {
    if (!authMessage) return;
    const t = setTimeout(() => setAuthMessage(null), 5000);
    return () => clearTimeout(t);
  }, [authMessage]);

  // Modal handlers
  const openModal = (mode) => {
    setAuthMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAuthMessage(null);
  };

  // ✅ Logout real (borra cookie)
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
    } catch (e) {}

    // ✅ desconectar socket al salir (opcional pero recomendado)
    try {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    } catch (e) {}

    setAuthUser(null);
    setAuthMessage({ type: "success", text: "Sesión cerrada exitosamente" });
    navigate("/");
  };

  const handleEditProfile = () => {
    console.log("Editar perfil - Usuario:", authUser);
  };

  /* =========================================================
      ✅ SOCKET.IO: conectar + escuchar notificaciones
      - Conecta una vez cuando la app está lista
      - Se une al cuarto cuando authUser existe
  ========================================================= */

  // 1) Conectar socket una sola vez cuando ya está listo el layout
  useEffect(() => {
    if (!isReady) return;

    // evitar crear más de un socket
    if (socketRef.current) return;

    const socket = io(API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"], // ✅ mejor compatibilidad en deploy
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Socket conectado:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("🔴 Socket connect_error:", err?.message || err);
    });

    // escuchar notificaciones
    socket.on("nueva_notificacion", (data) => {
      console.log("🔔 Nueva notificación:", data);

      const texto =
        data?.tipo === "favorito"
          ? `${data.emisor_nombre || "Alguien"} añadió tu reseña a favoritos`
          : `${data.emisor_nombre || "Alguien"} comentó tu reseña`;

      setAuthMessage({ type: "success", text: texto });
    });

    return () => {
      try {
        socket.off("nueva_notificacion");
        socket.disconnect();
      } catch (e) {}
      socketRef.current = null;
    };
  }, [isReady]);

  // 2) Unirse al cuarto del usuario cuando se loguea
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (!authUser?.id) return;

    socket.emit("join_user_room", authUser.id);
    console.log("📡 join_user_room:", authUser.id);
  }, [authUser?.id]);

  // ⏳ Loading (hasta validar /me)
  if (!isReady) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#e9e4d5]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-800 border-t-transparent"></div>
          <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-900 w-6 h-6" />
        </div>
        <p className="mt-6 text-stone-800 font-serif italic text-xl">
          Abriendo los archivos de BookVerse...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-serif bg-[#f4f1ea] selection:bg-amber-200">
      <Navbar
        isAuthenticated={isAuthenticated}
        userName={userName}
        userId={userId}
        openModal={openModal}
        handleLogout={handleLogout}
        onEditProfileClick={handleEditProfile}
      />

      <main className="relative">
        {/* Notificación */}
        {authMessage && (
          <div
            className={`fixed top-24 right-6 z-[60] p-5 border-l-4 shadow-2xl transform transition-all duration-300 ${
              authMessage.type === "success"
                ? "bg-[#f0f9eb] border-green-600 text-green-800"
                : "bg-[#fef2f2] border-red-600 text-red-800"
            } flex items-center min-w-[300px]`}
          >
            <div className="mr-3">
              {authMessage.type === "success" ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
            </div>

            <div className="flex-grow font-serif italic font-bold">
              {authMessage.text}
            </div>

            <button
              onClick={() => setAuthMessage(null)}
              className="ml-4 text-stone-400 hover:text-stone-900 transition-colors"
            >
              &times;
            </button>
          </div>
        )}

        <Outlet
          context={{
            // estado
            isAuthenticated,
            authUser,
            userName,
            userId,

            // acciones
            openModal,
            handleLogout,
            setAuthUser,
            setAuthMessage,

            // refrescar sesión desde cualquier página/modal
            checkSession,
            refreshSession,
          }}
        />
      </main>

      <Footer />

      <AuthModal
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={authMode}
        setMode={setAuthMode}
        setAuthMessage={setAuthMessage}
        setAuthUser={setAuthUser}
        checkSession={checkSession}
      />
    </div>
  );
};

export default BookVerseLayout;
