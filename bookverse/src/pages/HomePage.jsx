import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
    BookOpen, Edit3, Search, 
    TrendingUp, Sparkles, RefreshCw, LayoutDashboard, 
    ArrowRight, Star, MessageSquare, Heart, Quote
} from 'lucide-react'; 
import ReviewsPage from './ReviewsPage.jsx'; 

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- COMPONENTE DE FRASES LITERARIAS ---
const BookQuote = () => {
    const quotes = useMemo(() => [
        { text: "Un libro debe ser el piolet que rompa el mar helado dentro de nosotros.", author: "Franz Kafka" },
        { text: "No hay barrera, cerradura, ni cerrojo que puedas imbuir a la libertad de mi mente.", author: "Virginia Woolf" },
        { text: "Leemos para saber que no estamos solos.", author: "C.S. Lewis" },
        { text: "La lectura de todos los buenos libros es como una conversación con las mejores mentes de los siglos pasados.", author: "René Descartes" },
        { text: "Los libros son una única y portátil magia.", author: "Stephen King" },
        { text: "Vivir sin leer es peligroso, obliga a conformarse con la vida.", author: "Michel Houellebecq" },
        { text: "La literatura es la forma más agradable de ignorar la vida.", author: "Fernando Pessoa" }
    ], []);

    const [quote, setQuote] = useState({ text: "", author: "" });

    useEffect(() => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);
    }, [quotes]);

    return (
        <div className="mt-6 flex flex-col gap-2 max-w-2xl animate-in fade-in slide-in-from-left-4 duration-1000">
            <Quote className="w-6 h-6 text-amber-400/50" />
            <p className="text-stone-200 font-serif italic text-lg md:text-2xl leading-relaxed">
                "{quote.text}"
            </p>
            <span className="text-amber-500 font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold">
                — {quote.author}
            </span>
        </div>
    );
};

// --- COMPONENTE DE RECOMENDACIÓN ESTILO "DESCUBRIMIENTO" ---
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
                let nuevoIndice = Math.floor(Math.random() * data.length);
                setLibro(data[nuevoIndice]);
            }
        } catch (err) {
            console.error("❌ Error en DailyRecommendation:", err);
            setError(true);
        } finally {
            setTimeout(() => setLoading(false), 400);
        }
    }, []);

    useEffect(() => {
        obtenerLibroAleatorio();
    }, [obtenerLibroAleatorio]);

    if (loading && !libro) return (
        <div className="py-20 text-center text-stone-400 font-serif italic">Cargando descubrimiento...</div>
    );

    if (error || !libro) return null;

    return (
        <section className="py-12 px-4">
            <div className="flex justify-center items-center gap-2 mb-8">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 tracking-widest uppercase text-center">
                    Descubrimiento del momento
                </h2>
            </div>

            <div className="max-w-5xl mx-auto">
                <div className={`relative bg-[#fdfaf3] border border-amber-100 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row items-stretch transition-all duration-500 ${loading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                    <div className="md:w-[45%] relative min-h-[350px]">
                        <img 
                            src={libro.image_url || "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000"} 
                            alt={libro.book_title} 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute top-6 left-6 bg-orange-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                            Recomendación
                        </div>
                    </div>

                    <div className="md:w-[55%] p-10 md:p-14 flex flex-col justify-center bg-[#fdfaf3]">
                        <div className="flex gap-1 mb-4">
                            {[1, 2, 3].map((i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                            {[1, 2].map((i) => <Star key={i} className="w-4 h-4 text-stone-300" />)}
                        </div>

                        <h3 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-2 leading-tight">
                            {libro.book_title}
                        </h3>
                        
                        <p className="text-stone-500 text-[11px] uppercase tracking-[0.2em] font-bold mb-6">
                            POR {libro.author || 'DESCONOCIDO'} • {libro.categoria_ia || 'LITERATURA'}
                        </p>

                        <p className="text-stone-600 text-lg font-serif italic leading-relaxed mb-10 line-clamp-4">
                            "{libro.review_text}"
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <Link 
                                to={`/review/${libro.id}`} 
                                className="bg-[#1a1a1a] text-white px-8 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-stone-800 transition-all"
                            >
                                <BookOpen className="w-4 h-4" /> Ver Reseña
                            </Link>
                            
                            <button 
                                onClick={obtenerLibroAleatorio} 
                                className="bg-white border border-stone-200 text-stone-600 px-8 py-3.5 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-stone-50 transition-all"
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

// --- SECCIÓN DE ACCIONES RÁPIDAS ---
const UserActionSection = () => {
    const actions = [
        { to: "/add-review", icon: Edit3, title: "Escribir Reseña", desc: "Publica tu opinión", bg: "bg-amber-600", hover: "hover:bg-amber-700", iconBg: "bg-amber-500" },
        { to: "/buscar", icon: Search, title: "Explorar Libros", desc: "Encuentra tu género", bg: "bg-stone-800", hover: "hover:bg-stone-900", iconBg: "bg-stone-700" },
        { to: "/reseñas-recientes", icon: TrendingUp, title: "Tendencias", desc: "Lo más popular", bg: "bg-orange-700", hover: "hover:bg-orange-800", iconBg: "bg-orange-600" }
    ];

    return (
        <section className="py-12 px-4 -mt-10 relative z-20">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {actions.map((item, idx) => (
                        <Link key={idx} to={item.to} className={`${item.bg} ${item.hover} p-8 rounded-[2rem] shadow-2xl transform transition-all hover:-translate-y-2 flex flex-col gap-4 text-white group`}>
                            <div className={`${item.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                                <item.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-serif">{item.title}</h3>
                                <p className="text-white/80 text-sm mt-1">{item.desc}</p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Entrar <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- COMPONENTES PARA LANDING PAGE ---
const ValueCard = ({ icon: Icon, title, description }) => (
    <div className="bg-[#fdfcf8] p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200 hover:border-amber-500 transition-all duration-500 group">
        <div className="text-amber-700 mb-4 flex items-center justify-center bg-amber-50 w-14 h-14 md:w-16 md:h-16 rounded-2xl group-hover:bg-amber-100 transition-colors mx-auto md:mx-0">
            <Icon className="w-7 h-7 md:w-8 md:h-8" />
        </div>
        <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900 mb-3">{title}</h3>
        <p className="text-stone-600 leading-relaxed font-sans text-sm">{description}</p>
    </div>
);

const AboutSection = () => (
    <section id="quienes-somos" className="py-16 md:py-24 bg-[#f4f1ea] px-4">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 mb-16 md:mb-20">
                <div className="w-full md:w-1/2">
                    <img 
                        src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1000" 
                        alt="Biblioteca" 
                        className="rounded-[2rem] md:rounded-[3rem] shadow-2xl border-4 border-white transform md:-rotate-2 hover:rotate-0 transition-all duration-500 w-full object-cover h-64 md:h-auto"
                    />
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-[0.3em] mb-4">Nuestra Misión</p>
                    <h2 className="text-3xl md:text-5xl font-serif font-black text-stone-900 leading-tight mb-6">
                        La <span className="italic text-amber-700">Comunidad Literaria</span> más Vibrante
                    </h2>
                    <p className="text-base md:text-lg text-stone-700 leading-relaxed">
                        Un espacio acogedor donde tus reseñas se convierten en la brújula de otros lectores.
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                <ValueCard icon={BookOpen} title="Exploración" description="Encuentra joyas ocultas recomendadas por personas reales." />
                <ValueCard icon={MessageSquare} title="Conversación" description="Debate con pasión en un ambiente libre y respetuoso." />
                <ValueCard icon={Heart} title="Conexión" description="Añade a favoritos tus reseñas preferidas" />
            </div>
        </div>
    </section>
);

const HeroSection = ({ openModal }) => (
    <section id="inicio" className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-900/70 to-stone-900/90 backdrop-blur-[2px]"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-6 md:mb-8">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-amber-400" />
                <span className="text-amber-400 font-bold tracking-[0.3em] md:tracking-[0.5em] uppercase text-[9px] md:text-[10px]">MyBookCompass</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-9xl font-serif font-black text-white mb-8 leading-[1.1] md:leading-[0.9] tracking-tighter break-words">
                Descubre tu <br/><span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent italic font-serif">Próxima Historia</span>
            </h1>
            <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-5">
                <button onClick={() => openModal('register')} className="bg-amber-600 text-white font-serif italic text-lg md:text-xl px-10 md:px-14 py-4 md:py-5 rounded-full shadow-2xl hover:bg-amber-700 transition-all active:scale-95">¡Comienza Gratis!</button>
                <button onClick={() => openModal('login')} className="bg-transparent hover:bg-white hover:text-stone-900 text-white font-serif border border-white/30 px-10 md:px-12 py-4 md:py-5 rounded-full transition-all backdrop-blur-sm">Ya Soy Miembro</button>
            </div>
        </div>
    </section>
);

// --- COMPONENTE PRINCIPAL ---
const HomePage = () => {
    const { openModal, isAuthenticated, user } = useOutletContext() || {}; 
    
    if (isAuthenticated) {
        return (
            <div className="flex flex-col min-h-screen bg-[#fdfcf8]">
                <main className="flex-grow">
                    <header className="relative min-h-[550px] flex items-center px-6 overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000" className="w-full h-full object-cover" alt="Biblioteca" />
                            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/95 via-stone-900/50 to-transparent"></div>
                        </div>
                        <div className="max-w-7xl mx-auto relative z-10 w-full">
                            <div className="flex items-center gap-2 text-amber-400 mb-4 bg-amber-400/10 w-fit px-4 py-1 rounded-full backdrop-blur-sm border border-amber-400/20">
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Panel de Control</span>
                            </div>
                            <h1 className="text-5xl md:text-8xl font-serif font-black text-white leading-tight">
                                Hola, <span className="italic text-amber-400">{user?.name || 'Lector'}</span>
                            </h1>
                            
                            {/* NUEVA SECCIÓN DE FRASES AGREGADA AQUÍ */}
                            <BookQuote />

                            <p className="text-stone-400 mt-8 font-serif italic text-xl md:text-2xl max-w-2xl border-t border-white/10 pt-6">
                                ¿Qué historia vamos a descubrir hoy?
                            </p>
                        </div>
                    </header>

                    <UserActionSection />

                    <div className="bg-[#f4f1ea] py-16 border-y border-stone-200">
                        <DailyRecommendation />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#fdfcf8]">
            <main className="flex-grow">
                <HeroSection openModal={openModal} />
                
                <div className="bg-[#f4f1ea] py-16 border-b border-stone-200">
                    <DailyRecommendation />
                </div>

                <AboutSection />

                <section id="reseñas" className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-10 md:mb-16">
                        <p className="text-amber-800 font-bold tracking-[0.3em] text-[9px] md:text-[10px] mb-4 uppercase">Reseñas Recientes</p>
                        <h2 className="text-3xl md:text-5xl font-serif font-black text-stone-900 tracking-tight">Voces de la Comunidad</h2>
                        <div className="h-1.5 w-20 md:w-24 bg-amber-700 mx-auto mt-6 rounded-full"></div>
                    </div>
                    <div className="bg-[#f4f1ea] p-4 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-stone-200 shadow-inner overflow-hidden">
                        <ReviewsPage /> 
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HomePage;