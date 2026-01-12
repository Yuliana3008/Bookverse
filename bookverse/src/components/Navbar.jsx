import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { io } from "socket.io-client";
import axios from 'axios';
import { 
    BookOpen, 
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
    CheckCheck
} from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL;

// --- Componente NavItem Unificado ---
const NavItem = ({ item, onClick, isCurrentPage }) => {
    const isAnchorLink = item.to.includes('/#');
    const commonClasses = "text-stone-600 font-medium hover:text-amber-700 transition duration-150 flex items-center group";
    const iconClasses = "w-4 h-4 mr-1.5 text-amber-600 group-hover:text-amber-700 transition-colors";
    
    if (isAnchorLink && isCurrentPage) {
        return (
            <a href={item.to.replace('/#', '#')} onClick={onClick} className={commonClasses}>
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);

    const dropdownRef = useRef(null);
    const notifRef = useRef(null);
    const socketRef = useRef(null);

    // 1. Cargar historial y conectar Socket
    useEffect(() => {
        if (isAuthenticated && userId) {
            fetchNotifications();

            socketRef.current = io(SOCKET_URL);
            socketRef.current.emit("join_user_room", userId);

            socketRef.current.on("nueva_notificacion", (data) => {
                setNotifications(prev => [data, ...prev]);
                setHasUnread(true);
            });
        }
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [isAuthenticated, userId]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${SOCKET_URL}/api/reviews/notifications/${userId}`);
            setNotifications(res.data);
            setHasUnread(res.data.some(n => !n.leido));
        } catch (error) {
            console.error("Error al cargar notificaciones", error);
        }
    };

    // 2. Manejo de cierre al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 3. Abrir notificaciones y marcar como leídas
    const handleToggleNotif = async () => {
        const newState = !isNotifOpen;
        setIsNotifOpen(newState);
        if (newState) setIsDropdownOpen(false);

        if (newState && hasUnread) {
            setHasUnread(false);
            try {
                await axios.put(`${SOCKET_URL}/api/reviews/notifications/read-all/${userId}`);
            } catch (e) { console.error(e); }
        }
    };

    const navItems = isAuthenticated
        ? [
            { name: 'Reseñas Recientes', to: '/reseñas-recientes', icon: BookA },
            { name: 'Añadir Reseña', to: '/add-review', icon: Edit3 }, 
            { name: 'Buscar Libros', to: '/buscar', icon: Search },
            { name: 'Libro Ideal', to: '/encuentra-tu-libro', icon: Wand2 }
          ]
        : [
            { name: 'Inicio', to: '/', icon: Home }, 
            { name: 'Quiénes somos', to: '/#quienes-somos', icon: Info }, 
            { name: 'Reseñas', to: '/#reseñas', icon: BookA }
          ];

    const isCurrentPageRoot = location.pathname === '/';

    return (
        <header className="sticky top-0 z-40 bg-[#fdfcf8] bg-opacity-95 backdrop-blur-sm shadow-sm border-b border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2 transition duration-200 hover:opacity-80">
                    <BookOpen className="w-8 h-8 text-amber-700" />
                    <span className="text-3xl font-extrabold text-stone-800 tracking-tight font-serif">BookVerse</span>
                </Link>
                
                {/* Navegación Central */}
                <nav className="hidden md:flex space-x-8 items-center">
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
                <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-2">
                            
                            {/* --- CUADRO DE NOTIFICACIONES --- */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={handleToggleNotif}
                                    className="relative p-2 text-stone-600 hover:bg-stone-100 rounded-full transition group"
                                >
                                    <Bell className="w-6 h-6 text-amber-700 group-hover:scale-110 transition-transform" />
                                    {hasUnread && (
                                        <span className="absolute top-1 right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                                        </span>
                                    )}
                                </button>

                                {isNotifOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-xl shadow-2xl z-50 overflow-hidden slide-in-top">
                                        <div className="p-3 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                                            <span className="font-bold text-stone-800 font-serif">Notificaciones</span>
                                            <CheckCheck size={16} className="text-stone-400" />
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-stone-400 text-sm italic">No hay interacciones aún</div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div key={n.id || Math.random()} className={`p-4 border-b border-stone-50 flex gap-3 hover:bg-amber-50/30 transition ${!n.leido ? 'bg-amber-50/50' : ''}`}>
                                                        <div className={`mt-1 shrink-0 ${n.tipo === 'comentario' ? 'text-blue-500' : 'text-rose-500'}`}>
                                                            {n.tipo === 'comentario' ? <MessageSquare size={16} /> : <Heart size={16} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-stone-800 leading-snug">
                                                                <span className="font-bold">{n.emisor_nombre}</span> 
                                                                {n.tipo === 'comentario' ? ' comentó tu reseña de ' : ' le dio corazón a '}
                                                                <span className="italic font-medium text-amber-800">"{n.libro || n.book_title}"</span>
                                                            </p>
                                                            <span className="text-[10px] text-stone-400 flex items-center gap-1 mt-1 font-medium">
                                                                <Clock size={10} /> {n.created_at ? new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Ahora'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* --- MENU DE USUARIO --- */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
                                    className="flex items-center px-3 py-2 rounded-lg transition duration-150 hover:bg-stone-100 focus:outline-none"
                                >
                                    <Users className="w-5 h-5 text-amber-700 mr-2" />
                                    <span className="text-sm font-semibold text-stone-800 font-serif">Hola, {userName}</span>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                        <Link to={`/mis-resenas/${userId}`} onClick={() => setIsDropdownOpen(false)} className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-800 flex items-center transition">
                                            <Grid className="w-4 h-4 mr-2" /> Mis Reseñas
                                        </Link>
                                        <Link to="/mis-favoritos" onClick={() => setIsDropdownOpen(false)} className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-800 flex items-center transition">
                                            <Heart className="w-4 h-4 mr-2 text-rose-500" /> Mis Favoritos
                                        </Link>
                                        <Link to="/editar-perfil" onClick={() => setIsDropdownOpen(false)} className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-800 flex items-center transition">
                                            <UserPlus className="w-4 h-4 mr-2" /> Editar Perfil
                                        </Link>
                                        <hr className="border-stone-100" />
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition">
                                            <LogIn className="w-4 h-4 mr-2" /> Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <button onClick={() => openModal('login')} className="text-stone-600 font-medium py-2 px-4 hover:text-amber-700 transition duration-200 font-serif">
                                Iniciar Sesión
                            </button>
                            <button onClick={() => openModal('register')} className="bg-amber-700 text-white font-bold py-2 px-5 rounded-full shadow-sm hover:bg-amber-800 transition duration-200 transform hover:scale-105 text-sm">
                                Crear Cuenta
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;