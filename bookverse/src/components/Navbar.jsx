import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import { BookOpen, Users, LogIn, Edit3, BookA, Search, Grid, Home, Info, UserPlus } from 'lucide-react';

// --- Componente NavItem (Colores actualizados, misma lógica) ---
const NavItem = ({ item, onClick, isCurrentPage }) => {
    const isAnchorLink = item.to.includes('/#');
    const commonClasses = "text-stone-600 font-medium hover:text-amber-700 transition duration-150 flex items-center";
    
    if (isAnchorLink && isCurrentPage) {
        return (
            <a
                href={item.to.replace('/#', '#')} 
                onClick={onClick}
                className={commonClasses}
            >
                <item.icon className="w-4 h-4 mr-1 text-amber-600" />
                {item.name}
            </a>
        );
    }
    
    return (
        <Link
            to={item.to}
            onClick={onClick}
            className={commonClasses}
        >
            <item.icon className="w-4 h-4 mr-1 text-amber-600" />
            {item.name}
        </Link>
    );
};

// --- Componente Navbar (Añadida prop userId) ---
const Navbar = ({ isAuthenticated, userName, userId, openModal, handleLogout }) => {
    
    const location = useLocation(); 
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const navItems = isAuthenticated
        ? [
            { name: 'Reseñas Recientes', to: '/reseñas-recientes', icon: BookA },
            { name: 'Añadir Reseña', to: '/add-review', icon: Edit3 }, 
            { name: 'Buscar Libros', to: '/buscar', icon: Search }
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
                
                <Link to="/" className="flex items-center space-x-2 transition duration-200 hover:opacity-80">
                    <BookOpen className="w-8 h-8 text-amber-700" />
                    <span className="text-3xl font-extrabold text-stone-800 tracking-tight font-serif">BookVerse</span>
                </Link>
                
                <nav className="hidden md:flex space-x-8">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.name}
                            item={item}
                            onClick={() => setIsDropdownOpen(false)}
                            isCurrentPage={isCurrentPageRoot}
                        />
                    ))}
                </nav>
                
                <div className="flex items-center space-x-3">
                    {isAuthenticated ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center p-2 rounded-full transition duration-150 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <Users className="w-5 h-5 text-amber-700 mr-2" />
                                <span className="text-sm font-medium text-stone-800 font-serif">Hola, {userName}</span>
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
                                    
                                    {/* CAMBIO AQUÍ: Ahora navega a la página de edición de perfil */}
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
                                    >
                                        <LogIn className="w-4 h-4 mr-2" /> Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => openModal('register')}
                                className="hidden sm:inline bg-amber-700 text-white font-bold py-2 px-4 rounded-full shadow-md hover:bg-amber-800 transition duration-200 transform hover:scale-105"
                            >
                                Crear Cuenta
                            </button>
                            <button
                                onClick={() => openModal('login')}
                                className="text-amber-700 font-medium py-2 px-4 rounded-full border border-amber-700 hover:bg-amber-50 transition duration-200"
                            >
                                <LogIn className="w-5 h-5 inline mr-1 md:hidden" />
                                <span className="hidden md:inline font-serif">Iniciar Sesión</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;