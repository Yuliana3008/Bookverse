import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, LogIn, Mail, Lock, CheckCircle, XCircle } from 'lucide-react';
import API_URL from '../config';  // ✅ Importar API_URL

const AuthModal = ({ isOpen, onClose, mode, setMode, setAuthMessage, setAuthUser, authMessage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const resetForm = useCallback(() => {
        setEmail('');
        setPassword('');
        setName('');
    }, []);

    useEffect(() => {
        if (!isOpen) resetForm();
    }, [isOpen, resetForm]);

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setAuthMessage(null);

        // ✅ Usar API_URL completo
        const endpoint = mode === 'register' 
            ? `${API_URL}/api/auth/register` 
            : `${API_URL}/api/auth/login`;
        
        const payload = mode === 'register' 
            ? { name, email, password } 
            : { email, password };

        console.log('🔍 Haciendo petición a:', endpoint); // Debug

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                if (mode === 'register') {
                    setAuthMessage({ 
                        type: 'success', 
                        text: `¡Cuenta creada! Ya puedes ingresar.` 
                    });
                    setMode('login');
                } else {
                    setAuthMessage({ 
                        type: 'success', 
                        text: `Bienvenido, ${data.name}.` 
                    });
                    setAuthUser({ name: data.name, id: data.id });
                    setTimeout(onClose, 1500); 
                }
            } else {
                const errorData = await response.json();
                setAuthMessage({ 
                    type: 'error', 
                    text: errorData.error || 'Error en la autenticación.' 
                });
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            setAuthMessage({ 
                type: 'error', 
                text: 'Error de conexión con el servidor.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const isLogin = mode === 'login';

    return (
        <div 
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex justify-center items-center p-4 transition-all duration-500" 
            onClick={onClose}
        >
            <div 
                className="w-full max-w-md p-10 bg-[#fdfcf8] border border-stone-200 shadow-2xl relative overflow-hidden" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Detalle decorativo superior típico de diseño editorial */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-700"></div>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <p className="text-[10px] tracking-[0.3em] text-amber-800 font-bold uppercase mb-1">BookVerse</p>
                        <h2 className="text-3xl font-serif font-black text-stone-900 italic">
                            {isLogin ? 'Bienvenido' : 'Nueva Cuenta'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-amber-800 transition-colors">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                {authMessage && (
                    <div className={`p-4 mb-6 text-sm font-serif italic border-l-4 ${
                        authMessage.type === 'success' 
                            ? 'bg-stone-100 border-amber-600 text-stone-800' 
                            : 'bg-red-50 border-red-700 text-red-900'
                    }`}>
                        <div className="flex items-center">
                            {authMessage.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                            {authMessage.text}
                        </div>
                    </div>
                )}

                <form onSubmit={handleAuthAction} className="space-y-5">
                    {mode === 'register' && (
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Nombre Completo</label>
                            <div className="relative group">
                                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-amber-700 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 focus:border-amber-600 focus:ring-0 transition-all font-serif outline-none"
                                    required={mode === 'register'}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Correo Electrónico</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-amber-700 transition-colors" />
                            <input
                                type="email"
                                placeholder="usuario@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 focus:border-amber-600 focus:ring-0 transition-all font-serif outline-none"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-amber-700 transition-colors" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 focus:border-amber-600 focus:ring-0 transition-all font-serif outline-none"
                                required
                                minLength={6}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-stone-900 hover:bg-amber-800 text-white font-serif italic text-lg py-4 shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center group"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                {isLogin ? <LogIn className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" /> : <UserPlus className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />}
                                {isLogin ? 'Entrar a la Biblioteca' : 'Unirse a la Comunidad'}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                    <p className="text-stone-500 font-serif">
                        {isLogin ? '¿Aún no eres miembro?' : '¿Ya tienes una cuenta?'}
                        <button
                            onClick={() => setMode(isLogin ? 'register' : 'login')}
                            className="text-amber-800 hover:text-stone-900 font-bold ml-2 underline underline-offset-4 decoration-amber-800/30 hover:decoration-amber-800 transition-all"
                            disabled={isLoading}
                        >
                            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;