import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { UserPlus, LogIn, BookOpen, MessageSquare, Heart, Edit3, Search, TrendingUp } from 'lucide-react'; 
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

// --- 1. Componente Quiénes Somos (AboutSection) ---
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

// --- 2. User Action Section (Textos exactos de tu imagen) ---
const UserActionSection = () => (
    <section id="acciones-usuario" className="py-24 bg-stone-100 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-serif font-bold text-stone-800 mb-12 italic">
                ¡Bienvenido de Nuevo!
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {/* Tarjeta 1: Escribir Reseña */}
                <Link
                    to="/add-review"
                    className="group flex flex-col items-center p-10 bg-[#fdfcf8] rounded-none border-t-4 border-amber-600 border-x border-b border-stone-200 shadow-sm hover:shadow-md transition-all"
                >
                    <Edit3 className="w-12 h-12 text-amber-700 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold font-serif text-stone-900 mb-2">Escribir Reseña</h3>
                    <p className="text-stone-600 text-sm mb-6">Comparte tus últimas impresiones.</p>
                    <span className="text-amber-700 font-medium group-hover:underline">Comenzar &rarr;</span>
                </Link>

                {/* Tarjeta 2: Explorar Catálogo */}
                <Link
                    to="/buscar"
                    className="group flex flex-col items-center p-10 bg-[#fdfcf8] rounded-none border-t-4 border-amber-600 border-x border-b border-stone-200 shadow-sm hover:shadow-md transition-all"
                >
                    <Search className="w-12 h-12 text-amber-700 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold font-serif text-stone-900 mb-2">Explorar Catálogo</h3>
                    <p className="text-stone-600 text-sm mb-6">Encuentra libros y autores al instante.</p>
                    <span className="text-amber-700 font-medium group-hover:underline">Buscar &rarr;</span>
                </Link>
                
                {/* Tarjeta 3: Tendencias */}
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

// --- Componente Hero Section ---
const HeroSection = ({ openModal, isAuthenticated }) => (
    <section id="inicio" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=2000" 
                alt="Books background" 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center text-white">
            <p className="text-amber-400 font-bold tracking-[0.4em] uppercase text-sm mb-6 font-sans">BookVerse</p>
            <h1 className="text-6xl md:text-8xl font-serif font-black mb-8 leading-tight">
                Descubre tu <br/><span className="text-amber-500 italic">Próxima Historia</span>
            </h1>
            <p className="text-xl md:text-2xl font-light text-stone-200 mb-12 max-w-3xl mx-auto leading-relaxed font-serif">
                La plataforma social de reseñas más rápida y honesta. Conéctate con millones de lectores como tú.
            </p>

            {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <button
                        onClick={() => openModal('register')}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-serif italic text-xl px-12 py-4 transition-all shadow-lg"
                    >
                        <UserPlus className="w-5 h-5 inline mr-3" /> ¡Comienza Gratis Ahora!
                    </button>
                    <button
                        onClick={() => openModal('login')}
                        className="bg-transparent hover:bg-white/10 text-white font-serif border border-white/40 px-12 py-4 transition-all"
                    >
                        <LogIn className="w-5 h-5 inline mr-3" /> Ya Soy Miembro
                    </button>
                </div>
            )}
            
            {isAuthenticated && (
                <div className="inline-block px-8 py-4 border border-amber-500/30 bg-amber-900/20 backdrop-blur-md">
                    <p className="text-2xl font-serif italic text-amber-200">¡Sesión Activa! Echa un vistazo a lo nuevo.</p>
                </div>
            )}
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
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-serif font-bold text-stone-900">Reseñas de la Comunidad</h2>
                        <div className="h-1 w-20 bg-amber-600 mx-auto mt-4"></div>
                    </div>
                    <ReviewsPage /> 
                </div>
            </main>
        </div>
    );
};

export default HomePage;