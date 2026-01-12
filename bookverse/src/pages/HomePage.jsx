import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
    UserPlus, LogIn, BookOpen, MessageSquare, Heart, 
    Edit3, Search, TrendingUp, Sparkles, Star, 
    Bookmark, RefreshCw 
} from 'lucide-react'; 
import ReviewsPage from './ReviewsPage.jsx'; 

// URL de tu API (Ajusta si usas otra variable de entorno)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- Componente: Recomendación Dinámica ---
const DailyRecommendation = () => {
    const [libro, setLibro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const obtenerLibroAleatorio = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await fetch(`${API_URL}/api/reviews`);
            if (!response.ok) throw new Error("Error en servidor");
            
            const data = await response.json();

            if (data && data.length > 0) {
                let nuevoIndice;
                if (data.length > 1 && libro) {
                    do {
                        nuevoIndice = Math.floor(Math.random() * data.length);
                    } while (data[nuevoIndice].id === libro.id);
                } else {
                    nuevoIndice = Math.floor(Math.random() * data.length);
                }
                setLibro(data[nuevoIndice]);
            }
        } catch (err) {
            console.error("❌ Error en DailyRecommendation:", err);
            setError(true);
        } finally {
            setTimeout(() => setLoading(false), 400);
        }
    }, [libro]);

    useEffect(() => {
        obtenerLibroAleatorio();
    }, []);

    if (loading && !libro) return (
        <div className="py-20 bg-[#f4f1ea] text-center">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-4" />
            <p className="font-serif italic text-stone-500 text-lg">Revolviendo los estantes...</p>
        </div>
    );

    if (error || !libro) return null;

    return (
        <section className="py-16 bg-[#f4f1ea] px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif font-bold text-stone-800 flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Descubrimiento del Momento
                    </h2>
                </div>

                <div className={`bg-[#fdfcf8] border border-amber-200 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-stretch ${loading ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'}`}>
                    <div className="md:w-1/3 relative group min-h-[350px] bg-stone-200">
                        <img 
                            // FALLBACK: Si no tiene imagen, usa una elegante de repuesto
                            src={libro.image_url || "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000"} 
                            alt={libro.book_title} 
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1543004471-240ce49a29fb?q=80&w=1000";
                            }}
                        />
                        <div className="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg tracking-widest uppercase">
                            Recomendación
                        </div>
                    </div>
                    
                    <div className="md:w-2/3 p-8 md:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-1 text-amber-500 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < (libro.rating || 5) ? 'fill-current' : 'text-stone-200'}`} />
                            ))}
                        </div>
                        <h3 className="text-4xl font-serif font-bold text-stone-900 mb-2 italic tracking-tight">{libro.book_title}</h3>
                        <p className="text-amber-800 font-medium mb-4 font-sans uppercase tracking-[0.2em] text-[10px]">
                            Por {libro.author || 'Autor desconocido'} • {libro.categoria_ia || 'Literatura'}
                        </p>
                        <p className="text-stone-700 leading-relaxed mb-8 italic text-lg line-clamp-3">
                            "{libro.review_text}"
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {/* CORRECCIÓN DE RUTA: de /reseña/ a /review/ para que coincida con App.jsx */}
                            <Link to={`/review/${libro.id}`} className="bg-stone-900 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-amber-700 transition-all flex items-center gap-2 shadow-lg">
                                <BookOpen className="w-4 h-4" /> Ver Crónica
                            </Link>
                            <button 
                                onClick={(e) => { e.preventDefault(); obtenerLibroAleatorio(); }} 
                                className="border border-stone-300 text-stone-600 px-6 py-3 rounded-full font-bold text-sm hover:bg-white transition-all flex items-center gap-2 active:scale-95"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Probar otro
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Componentes de Apoyo ---
const ValueCard = ({ icon: Icon, title, description }) => (
    <div className="bg-[#fdfcf8] p-8 rounded-3xl shadow-sm border border-stone-200 hover:border-amber-500 transition-all duration-500 group">
        <div className="text-amber-700 mb-4 flex items-center justify-center bg-amber-50 w-16 h-16 rounded-2xl group-hover:bg-amber-100 transition-colors mx-auto md:mx-0">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-stone-900 mb-3">{title}</h3>
        <p className="text-stone-600 leading-relaxed font-sans text-sm">{description}</p>
    </div>
);

const AboutSection = () => (
    <section id="quienes-somos" className="py-24 bg-[#f4f1ea] px-4">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-16 mb-20">
                <div className="md:w-1/2">
                    <img 
                        src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1000" 
                        alt="Biblioteca" 
                        className="rounded-[3rem] shadow-2xl border-4 border-white transform -rotate-2 hover:rotate-0 transition-all duration-500"
                    />
                </div>
                <div className="md:w-1/2">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-[0.3em] mb-4">Nuestra Misión</p>
                    <h2 className="text-5xl font-serif font-black text-stone-900 leading-tight mb-6">
                        La <span className="italic text-amber-700">Comunidad Literaria</span> más Vibrante
                    </h2>
                    <p className="text-lg text-stone-700 leading-relaxed">
                        Un espacio acogedor donde tus reseñas se convierten en la brújula de otros lectores.
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <ValueCard icon={BookOpen} title="Exploración" description="Encuentra joyas ocultas recomendadas por personas reales." />
                <ValueCard icon={MessageSquare} title="Conversación" description="Debate con pasión en un ambiente libre y respetuoso." />
                <ValueCard icon={Heart} title="Conexión" description="Sigue a tus críticos favoritos y crea tu propio club." />
            </div>
        </div>
    </section>
);

const UserActionSection = () => (
    <section id="acciones-usuario" className="py-24 bg-stone-50 border-y border-stone-100 px-4">
        <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-serif font-bold text-stone-800 mb-12 italic">¡ Bienvenido de Nuevo !</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                    { to: "/add-review", icon: Edit3, title: "Escribir Reseña", desc: "Comparte tu última lectura." },
                    { to: "/buscar", icon: Search, title: "Explorar Catálogo", desc: "Busca por autor o género." },
                    { to: "/reseñas-recientes", icon: TrendingUp, title: "Tendencias", desc: "Lo más comentado hoy." }
                ].map((item, idx) => (
                    <Link key={idx} to={item.to} className="group p-10 bg-[#fdfcf8] rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-xl transition-all hover:border-amber-500">
                        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-amber-100">
                            <item.icon className="w-10 h-10 text-amber-700 group-hover:scale-110 transition-transform" />
                        </div>
                        <h3 className="text-xl font-bold font-serif text-stone-900 mb-2">{item.title}</h3>
                        <p className="text-stone-500 text-sm mb-6">{item.desc}</p>
                        <span className="text-amber-700 font-bold text-[10px] uppercase tracking-widest group-hover:underline flex items-center justify-center gap-2">Comenzar <Sparkles className="w-3 h-3" /></span>
                    </Link>
                ))}
            </div>
        </div>
    </section>
);

const HeroSection = ({ openModal, isAuthenticated }) => (
    <section id="inicio" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-900/70 to-stone-900/90 backdrop-blur-[2px]"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-8">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-bold tracking-[0.5em] uppercase text-[10px]">BookVerse</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-serif font-black text-white mb-8 leading-[0.9] tracking-tighter">
                Descubre tu <br/><span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent italic font-serif">Próxima Historia</span>
            </h1>
            {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                    <button onClick={() => openModal('register')} className="bg-amber-600 text-white font-serif italic text-xl px-14 py-5 rounded-full shadow-2xl hover:bg-amber-700 transition-all active:scale-95">¡Comienza Gratis!</button>
                    <button onClick={() => openModal('login')} className="bg-transparent hover:bg-white hover:text-stone-900 text-white font-serif border border-white/30 px-12 py-5 rounded-full transition-all backdrop-blur-sm">Ya Soy Miembro</button>
                </div>
            ) : (
                <div className="inline-flex items-center gap-3 px-10 py-5 border border-amber-500/20 bg-amber-500/5 backdrop-blur-xl rounded-full">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                    <p className="text-2xl font-serif italic text-amber-100">Sesión Activa. <span className="text-white">Explora lo nuevo hoy.</span></p>
                </div>
            )}
        </div>
    </section>
);

const HomePage = () => {
    const { openModal, isAuthenticated } = useOutletContext() || {}; 
    
    return (
        <div className="flex flex-col min-h-screen bg-[#fdfcf8]">
            <main className="flex-grow">
                <HeroSection openModal={openModal} isAuthenticated={isAuthenticated} />
                <DailyRecommendation />
                {isAuthenticated ? <UserActionSection /> : <AboutSection />}
                <div id="reseñas" className="py-24 max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-amber-800 font-bold tracking-[0.3em] text-[10px] mb-4 uppercase">Crónicas Recientes</p>
                        <h2 className="text-5xl font-serif font-black text-stone-900 tracking-tight">Voces de la Comunidad</h2>
                        <div className="h-1.5 w-24 bg-amber-700 mx-auto mt-6 rounded-full"></div>
                    </div>
                    <div className="bg-[#f4f1ea] p-6 md:p-12 rounded-[3.5rem] border border-stone-200 shadow-inner">
                        <ReviewsPage /> 
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;