import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { UserPlus, LogIn, BookOpen, MessageSquare, Heart, Edit3, Search, TrendingUp, Sparkles } from 'lucide-react'; 
import ReviewsPage from './ReviewsPage.jsx'; 

// --- Componente de Tarjeta de Valor (AboutSection) ---
const ValueCard = ({ icon: Icon, title, description }) => (
    <div className="bg-[#fdfcf8] p-8 rounded-lg shadow-sm border border-stone-200 hover:border-amber-500 transition-all duration-500 group">
        <div className="text-amber-700 mb-4 flex items-center justify-center bg-amber-50 w-16 h-16 rounded-full group-hover:bg-amber-100 transition-colors">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-stone-900 mb-3">{title}</h3>
        <p className="text-stone-700 leading-relaxed font-sans">{description}</p>
    </div>
);

// --- Componente Quiénes Somos ---
const AboutSection = () => (
    <section id="quienes-somos" className="py-24 bg-[#f4f1ea] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-16 mb-20">
                <div className="md:w-1/2">
                    <img 
                        src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1000" 
                        alt="Biblioteca Clásica" 
                        className="rounded-lg shadow-2xl border-4 border-white transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                    />
                </div>
                <div className="md:w-1/2">
                    <p className="text-sm font-bold text-amber-800 uppercase tracking-[0.3em] mb-4">NUESTRA MISIÓN</p>
                    <h2 className="text-5xl font-serif font-black text-stone-900 leading-tight mb-6">
                        Únete a la <span className="italic text-amber-700">Comunidad Literaria</span> más Vibrante
                    </h2>
                    <p className="text-lg text-stone-700 leading-relaxed mb-8">
                        Accede a una vasta biblioteca, comparte tus opiniones y construye tu propia historia junto a miles de lectores apasionados.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <ValueCard icon={BookOpen} title="Exploración Ilimitada" description="Accede a una vasta biblioteca, encuentra nuevos géneros y tu próxima gran lectura al instante." />
                <ValueCard icon={MessageSquare} title="Interacción Genuina" description="Comparte tus opiniones y debate con otros lectores apasionados en un espacio libre y respetuoso." />
                <ValueCard icon={Heart} title="Conexión y Apoyo" description="Sigue a tus autores y críticos favoritos, construye tu biblioteca y haz crecer tu pasión." />
            </div>
        </div>
    </section>
);

// --- User Action Section ---
const UserActionSection = () => (
    <section id="acciones-usuario" className="py-24 bg-stone-100 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-serif font-bold text-stone-800 mb-12 italic">
                ¡ Bienvenido de Nuevo !
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <Link
                    to="/add-review"
                    className="group flex flex-col items-center p-10 bg-[#fdfcf8] rounded-none border-t-4 border-amber-600 border-x border-b border-stone-200 shadow-sm hover:shadow-md transition-all"
                >
                    <Edit3 className="w-12 h-12 text-amber-700 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold font-serif text-stone-900 mb-2">Escribir Reseña</h3>
                    <p className="text-stone-600 text-sm mb-6">Comparte tus últimas impresiones.</p>
                    <span className="text-amber-700 font-medium group-hover:underline">Comenzar &rarr;</span>
                </Link>

                <Link
                    to="/buscar"
                    className="group flex flex-col items-center p-10 bg-[#fdfcf8] rounded-none border-t-4 border-amber-600 border-x border-b border-stone-200 shadow-sm hover:shadow-md transition-all"
                >
                    <Search className="w-12 h-12 text-amber-700 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold font-serif text-stone-900 mb-2">Explorar Catálogo</h3>
                    <p className="text-stone-600 text-sm mb-6">Encuentra libros y autores al instante.</p>
                    <span className="text-amber-700 font-medium group-hover:underline">Buscar &rarr;</span>
                </Link>
                
                <Link
                    to="/reseñas-recientes"
                    className="group flex flex-col items-center p-10 bg-[#fdfcf8] rounded-none border-t-4 border-amber-600 border-x border-b border-stone-200 shadow-sm hover:shadow-md transition-all"
                >
                    <TrendingUp className="w-12 h-12 text-amber-700 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold font-serif text-stone-900 mb-2">Tendencias</h3>
                    <p className="text-stone-600 text-sm mb-6">Mira lo que lee y comenta la comunidad.</p>
                    <span className="text-amber-700 font-medium group-hover:underline">Explorar &rarr;</span>
                </Link>
            </div>
        </div>
    </section>
);

// --- MODIFICACIÓN DEL HERO SECTION (Mejora de Letras) ---
const HeroSection = ({ openModal, isAuthenticated }) => (
    <section id="inicio" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=2000" 
                alt="Books background" 
                className="w-full h-full object-cover scale-105"
            />
            {/* Overlay más rico con un gradiente */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-900/70 to-stone-900/90 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
            {/* Badge Superior Reestilizado */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-8 animate-fade-in">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-bold tracking-[0.5em] uppercase text-[10px] font-sans">
                    Bienvenido a BookVerse
                </span>
            </div>

            {/* Título Principal Reestilizado */}
            <h1 className="text-7xl md:text-9xl font-serif font-black text-white mb-8 leading-[0.9] tracking-tight">
                Descubre tu <br/>
                <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent italic drop-shadow-sm">
                    Próxima Historia
                </span>
            </h1>

            {/* Subtítulo con mejor legibilidad */}
            <p className="text-lg md:text-xl font-light text-stone-300 mb-12 max-w-2xl mx-auto leading-relaxed font-sans opacity-90 tracking-wide">
                La plataforma social de reseñas más <span className="text-white font-medium italic">rápida y honesta</span>. 
                Conéctate con una comunidad de lectores apasionados.
            </p>

            {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row justify-center gap-5 items-center">
                    <button
                        onClick={() => openModal('register')}
                        className="group relative overflow-hidden bg-amber-600 text-white font-serif italic text-xl px-14 py-5 transition-all shadow-2xl hover:bg-amber-700"
                    >
                        <span className="relative z-10 flex items-center">
                            <UserPlus className="w-5 h-5 mr-3" /> ¡Comienza Gratis!
                        </span>
                        <div className="absolute inset-0 bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    </button>

                    <button
                        onClick={() => openModal('login')}
                        className="bg-transparent hover:bg-white hover:text-stone-900 text-white font-serif border border-white/30 px-12 py-5 transition-all backdrop-blur-sm"
                    >
                        <LogIn className="w-5 h-5 inline mr-3" /> Ya Soy Miembro
                    </button>
                </div>
            ) : (
                <div className="inline-flex items-center gap-3 px-10 py-5 border border-amber-500/20 bg-amber-500/5 backdrop-blur-xl rounded-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-2xl font-serif italic text-amber-100">
                        Sesión Activa. <span className="text-white">Explora lo nuevo de hoy.</span>
                    </p>
                </div>
            )}
        </div>

        {/* Decoración Inferior Sutil */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
            <div className="w-[1px] h-16 bg-gradient-to-b from-amber-500 to-transparent"></div>
        </div>
    </section>
);

const HomePage = () => {
    const context = useOutletContext();
    const { openModal, isAuthenticated } = context || {}; 
    
    return (
        <div className="flex flex-col min-h-screen bg-[#fdfcf8]">
            <main className="flex-grow">
                <HeroSection openModal={openModal} isAuthenticated={isAuthenticated} />
                
                {isAuthenticated ? <UserActionSection /> : <AboutSection />}
                
                <div id="reseñas" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-amber-800 font-bold tracking-[0.3em] text-xs mb-4 uppercase">CRÓNICAS RECIENTES</p>
                        <h2 className="text-5xl font-serif font-black text-stone-900">Reseñas de la Comunidad</h2>
                        <div className="h-1.5 w-24 bg-amber-700 mx-auto mt-6"></div>
                    </div>
                    <ReviewsPage /> 
                </div>
            </main>
        </div>
    );
};

export default HomePage;