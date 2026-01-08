import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; // Se agregó useNavigate
import { CheckCircle, XCircle, BookOpen } from 'lucide-react'; 

import Navbar from '../components/Navbar'; 
import AuthModal from '../components/AuthModal'; 
import Footer from '../components/Footer'; 

const BookVerseLayout = () => {
    const navigate = useNavigate(); // Inicialización del hook para navegación

    // Estado de autenticación
    const [authUser, setAuthUser] = useState(() => {
        const storedUser = localStorage.getItem('authUser');
        return storedUser ? JSON.parse(storedUser) : null;
    }); 
    
    const isAuthenticated = !!authUser; 
    const userName = authUser?.name || 'Usuario'; 
    const userId = authUser?.id;

    // Estado del modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [authMessage, setAuthMessage] = useState(null);
    
    // Estado de carga inicial
    const [isReady, setIsReady] = useState(false);

    // Sincronizar authUser con localStorage
    useEffect(() => {
        if (authUser) {
            localStorage.setItem('authUser', JSON.stringify(authUser));
        } else {
            localStorage.removeItem('authUser');
        }
    }, [authUser]);

    // Limpiar mensajes después de 5 segundos
    useEffect(() => {
        if (authMessage) {
            const timer = setTimeout(() => {
                setAuthMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [authMessage]);

    // Marcar como listo después de cargar
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Funciones de manejo
    const openModal = (mode) => {
        setAuthMode(mode);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setAuthMessage(null);
    };

    const handleLogout = () => {
        setAuthUser(null);
        localStorage.removeItem('authUser');
        setAuthMessage({ type: 'success', text: 'Sesión cerrada exitosamente' });
        
        // REDIRECCIÓN: Envía al usuario al inicio para que no vea la página vacía de "Mis Reseñas"
        navigate('/'); 
    };

    const handleEditProfile = () => {
        console.log('Editar perfil - Usuario:', authUser);
    };

    // --- PANTALLA DE CARGA ---
    if (!isReady) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-[#e9e4d5]">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-800 border-t-transparent"></div>
                    <BookOpen className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-900 w-6 h-6" />
                </div>
                <p className="mt-6 text-stone-800 font-serif italic text-xl tracking-tight">Abriendo los archivos de BookVerse...</p>
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
                {/* --- NOTIFICACIONES FLOTANTES --- */}
                {authMessage && (
                    <div className={`fixed top-24 right-6 z-[60] p-5 border-l-4 shadow-2xl transform transition-all duration-500 animate-in fade-in slide-in-from-right ${
                        authMessage.type === 'success' 
                            ? 'bg-[#f0f9eb] border-green-600 text-green-800' 
                            : 'bg-[#fef2f2] border-red-600 text-red-800'
                    } flex items-center min-w-[300px]`}>
                        <div className="mr-3">
                            {authMessage.type === 'success' 
                                ? <CheckCircle className="w-6 h-6" /> 
                                : <XCircle className="w-6 h-6" />
                            }
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
                
                <Outlet context={{ 
                    isAuthenticated, 
                    userName, 
                    userId, 
                    openModal,
                    setAuthMessage,
                    authUser,
                    setAuthUser,
                    handleLogout
                }} />
            </main>
            
            <Footer />
            
            <AuthModal
                isOpen={isModalOpen}
                onClose={closeModal}
                mode={authMode}
                setMode={setAuthMode}
                setAuthMessage={setAuthMessage}
                setAuthUser={setAuthUser}
                authMessage={authMessage}
            />
        </div>
    );
};

export default BookVerseLayout;