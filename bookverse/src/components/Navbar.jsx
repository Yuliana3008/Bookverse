import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Users,
  LogIn,
  Edit3,
  BookA,
  Search,
  Grid,
  Home,
  Info,
  UserPlus,
  Wand2,
  Heart,
  Bell,
  MessageSquare,
  Clock,
  CheckCheck,
  BookText,
  Menu,
  X,
} from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_API_URL;

// --- Componente NavItem Unificado ---
const NavItem = ({ item, onClick, isCurrentPage, isMobile = false }) => {
  const isAnchorLink = item.to.includes("/#");
  const commonClasses = `text-stone-600 font-medium hover:text-amber-700 transition duration-150 flex items-center group ${
    isMobile ? "w-full py-3 px-4 hover:bg-amber-50 rounded-lg" : ""
  }`;
  const iconClasses =
    "w-4 h-4 mr-1.5 text-amber-600 group-hover:text-amber-700 transition-colors";

  if (isAnchorLink && isCurrentPage) {
    return (
      <a href={item.to.replace("/#", "#")} onClick={onClick} className={commonClasses}>
        <item.icon className={iconClasses} />
        {item.name}
      </a>
    );
  }

  return (
    <Link to={item.to} onClick={onClick} className={commonClasses}>
      <item.icon className={iconClasses} />
      {item.name}
    </Link>
  );
};

const Navbar = ({ isAuthenticated, userName, userId, openModal, handleLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const socketRef = useRef(null);

  const api = axios.create({
    baseURL: SOCKET_URL,
    withCredentials: true,
  });

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/api/reviews/notifications/me`);
      setNotifications(res.data);
      setHasUnread(res.data.some((n) => !n.leido));
    } catch (error) {
      console.error("Error al cargar notificaciones", error);
    }
  };

  // Cargar notificaciones y Socket
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchNotifications();

      socketRef.current = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket"],
      });

      socketRef.current.emit("join_user_room", userId);

      socketRef.current.on("nueva_notificacion", (data) => {
        setNotifications((prev) => [data, ...prev]);
        setHasUnread(true);
      });
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [isAuthenticated, userId]);

  // Cierre al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        const menuButton = document.getElementById('mobile-menu-button');
        if (!menuButton?.contains(event.target)) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleToggleNotif = () => {
    const newState = !isNotifOpen;
    setIsNotifOpen(newState);
    if (newState) {
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleNotificationClick = async (n) => {
    setIsNotifOpen(false);
    setIsMobileMenuOpen(false);

    try {
      if (!n.leido && n.id) {
        await api.put(`/api/reviews/notifications/read/${n.id}`);
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, leido: true } : x))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHasUnread((prev) => {
        if (!n.leido) {
          const remainingUnread = notifications.some(
            (x) => x.id !== n.id && !x.leido
          );
          return remainingUnread;
        }
        return prev;
      });

      navigate(`/review/${n.review_id}`);
    }
  };

  const navItems = isAuthenticated
    ? [
        { name: "Reseñas Recientes", to: "/reseñas-recientes", icon: BookA },
        { name: "Añadir Reseña", to: "/add-review", icon: Edit3 },
        { name: "Buscar Libros", to: "/buscar", icon: Search },
        { name: "Libro Ideal", to: "/encuentra-tu-libro", icon: Wand2 },
      ]
    : [
        { name: "Inicio", to: "/", icon: Home },
        { name: "Quiénes somos", to: "/#quienes-somos", icon: Info },
        { name: "Reseñas", to: "/#reseñas", icon: BookA },
      ];

  const isCurrentPageRoot = location.pathname === "/";

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fdfcf8] bg-opacity-95 backdrop-blur-sm shadow-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 transition duration-200 hover:opacity-80"
          >
            <BookText className="w-6 h-6 sm:w-8 sm:h-8 text-amber-700" />
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-800 tracking-tight font-serif">
              MyBookCompass
            </span>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8 items-center">
            {navItems.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                onClick={() => setIsDropdownOpen(false)}
                isCurrentPage={isCurrentPageRoot}
              />
            ))}
          </nav>

          {/* Acciones Derecha */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notificaciones */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={handleToggleNotif}
                    className="relative p-2 text-stone-600 hover:bg-stone-100 rounded-full transition group"
                    type="button"
                    aria-label="Notificaciones"
                  >
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700 group-hover:scale-110 transition-transform" />
                    {hasUnread && (
                      <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                      </span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="fixed sm:absolute right-2 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white border border-stone-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                        <span className="font-bold text-stone-800 font-serif">
                          Notificaciones
                        </span>
                        <CheckCheck size={16} className="text-stone-400" />
                      </div>

                      <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-stone-400 text-sm italic">
                            No hay interacciones aún
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <button
                              type="button"
                              key={n.id || `${n.tipo}-${n.review_id}-${n.created_at}`}
                              onClick={() => handleNotificationClick(n)}
                              className={`w-full text-left p-4 border-b border-stone-50 flex gap-3 hover:bg-amber-50/30 transition ${
                                !n.leido
                                  ? "bg-amber-100/70 border-l-4 border-l-amber-500 shadow-sm"
                                  : "bg-white border-stone-50 hover:bg-amber-50/30"
                              }`}
                              title="Ver reseña"
                            >
                              <div
                                className={`mt-1 shrink-0 ${
                                  n.tipo === "comentario"
                                    ? "text-blue-500"
                                    : "text-rose-500"
                                }`}
                              >
                                {n.tipo === "comentario" ? (
                                  <MessageSquare size={16} />
                                ) : (
                                  <Heart size={16} />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-stone-800 leading-snug">
                                  <span className="font-bold">{n.emisor_nombre}</span>
                                  {n.tipo === "comentario"
                                    ? " comentó tu reseña de "
                                    : " le dio corazón a "}
                                  <span className="italic font-medium text-amber-800">
                                    "{n.libro || n.book_title}"
                                  </span>
                                </p>

                                <span className="text-[10px] text-stone-400 flex items-center gap-1 mt-1 font-medium">
                                  <Clock size={10} />{" "}
                                  {n.created_at
                                    ? new Date(n.created_at).toLocaleTimeString([], {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "Ahora"}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Menú Usuario Desktop */}
                <div className="hidden sm:block relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(!isDropdownOpen);
                      setIsNotifOpen(false);
                    }}
                    className="flex items-center px-3 py-2 rounded-lg transition duration-150 hover:bg-stone-100 focus:outline-none"
                    type="button"
                  >
                    <Users className="w-5 h-5 text-amber-700 mr-2" />
                    <span className="text-sm font-semibold text-stone-800 font-serif hidden md:inline">
                      Hola, {userName}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-lg shadow-xl z-50 overflow-hidden">
                      <Link
                        to={`/mis-resenas/${userId}`}
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-800 flex items-center transition"
                      >
                        <Grid className="w-4 h-4 mr-2" /> Mis Reseñas
                      </Link>

                      <Link
                        to="/mis-favoritos"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-800 flex items-center transition"
                      >
                        <Heart className="w-4 h-4 mr-2 text-rose-500" /> Mis Favoritos
                      </Link>

                      <Link
                        to="/editar-perfil"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-800 flex items-center transition"
                      >
                        <UserPlus className="w-4 h-4 mr-2" /> Editar Perfil
                      </Link>

                      <hr className="border-stone-100" />

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition"
                        type="button"
                      >
                        <LogIn className="w-4 h-4 mr-2" /> Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>

                {/* Botón Menú Móvil (Autenticado) */}
                <button
                  id="mobile-menu-button"
                  onClick={() => {
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                    setIsDropdownOpen(false);
                    setIsNotifOpen(false);
                  }}
                  className="sm:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition"
                  type="button"
                  aria-label="Menú"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-amber-700" />
                  ) : (
                    <Menu className="w-6 h-6 text-amber-700" />
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Botones No Autenticado Desktop */}
                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    onClick={() => openModal("login")}
                    className="text-stone-600 font-medium py-2 px-3 lg:px-4 hover:text-amber-700 transition duration-200 font-serif text-sm"
                    type="button"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => openModal("register")}
                    className="bg-amber-700 text-white font-bold py-2 px-4 lg:px-5 rounded-full shadow-sm hover:bg-amber-800 transition duration-200 transform hover:scale-105 text-sm"
                    type="button"
                  >
                    Crear Cuenta
                  </button>
                </div>

                {/* Botón Menú Móvil (No Autenticado) */}
                <button
                  id="mobile-menu-button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="sm:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition"
                  type="button"
                  aria-label="Menú"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-amber-700" />
                  ) : (
                    <Menu className="w-6 h-6 text-amber-700" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Menú Móvil */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden mt-4 pb-4 border-t border-stone-200 pt-4 animate-fadeIn"
          >
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  onClick={closeMobileMenu}
                  isCurrentPage={isCurrentPageRoot}
                  isMobile={true}
                />
              ))}

              {isAuthenticated ? (
                <>
                  <hr className="my-2 border-stone-200" />
                  <Link
                    to={`/mis-resenas/${userId}`}
                    onClick={closeMobileMenu}
                    className="flex items-center py-3 px-4 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                  >
                    <Grid className="w-4 h-4 mr-1.5 text-amber-600" /> Mis Reseñas
                  </Link>
                  <Link
                    to="/mis-favoritos"
                    onClick={closeMobileMenu}
                    className="flex items-center py-3 px-4 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                  >
                    <Heart className="w-4 h-4 mr-1.5 text-rose-500" /> Mis Favoritos
                  </Link>
                  <Link
                    to="/editar-perfil"
                    onClick={closeMobileMenu}
                    className="flex items-center py-3 px-4 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                  >
                    <UserPlus className="w-4 h-4 mr-1.5 text-amber-600" /> Editar Perfil
                  </Link>
                  <hr className="my-2 border-stone-200" />
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="flex items-center py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition w-full text-left"
                    type="button"
                  >
                    <LogIn className="w-4 h-4 mr-1.5" /> Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2 border-stone-200" />
                  <button
                    onClick={() => {
                      openModal("login");
                      closeMobileMenu();
                    }}
                    className="flex items-center py-3 px-4 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition w-full text-left font-medium"
                    type="button"
                  >
                    <LogIn className="w-4 h-4 mr-1.5 text-amber-600" /> Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      openModal("register");
                      closeMobileMenu();
                    }}
                    className="bg-amber-700 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-amber-800 transition duration-200 mx-4 text-center"
                    type="button"
                  >
                    Crear Cuenta
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Navbar;