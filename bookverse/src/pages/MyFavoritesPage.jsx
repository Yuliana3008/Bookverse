import React, { useEffect, useState } from "react";
import { Heart, BookOpen, Sparkles, ArrowRight, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

const getAuthHeaders = () => {
    try {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
        return {};
    }
};

const MyFavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const meRes = await fetch(`${API_URL}/api/auth/me`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        ...getAuthHeaders(),
                    },
                });

                if (!meRes.ok) {
                    navigate("/");
                    return;
                }

                const favRes = await fetch(`${API_URL}/api/reviews/favorites/me`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        ...getAuthHeaders(),
                    },
                });

                if (!favRes.ok) {
                    console.error("No se pudieron cargar favoritos:", favRes.status);
                    setFavorites([]);
                    return;
                }

                const data = await favRes.json().catch(() => []);
                setFavorites(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error cargando favoritos:", error);
                setFavorites([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fdfcf8] flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin"></div>
                    <Bookmark className="absolute inset-0 m-auto w-6 h-6 text-amber-600 animate-pulse" />
                </div>
                <p className="mt-6 font-serif italic text-stone-500 text-lg">
                    Consultando tu archivo personal...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfcf8] py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Cabecera Estilo Editorial */}
                <header className="relative mb-16 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-amber-600 mb-4 bg-amber-50 w-fit px-4 py-1 rounded-full border border-amber-100 mx-auto md:mx-0">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Tu Colección Privada</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-stone-900 leading-tight">
                        Mis Reseñas <span className="italic text-amber-700">Favoritas</span>
                    </h1>
                    <div className="h-1 w-24 bg-amber-700 mt-6 rounded-full mx-auto md:mx-0"></div>
                </header>

                {favorites.length === 0 ? (
                    <div className="max-w-2xl mx-auto bg-[#f4f1ea] border border-stone-200 rounded-[3rem] p-16 text-center shadow-inner">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                            <BookOpen className="w-10 h-10 text-stone-300" />
                        </div>
                        <p className="font-serif italic text-stone-600 text-2xl leading-relaxed">
                            Aún no has guardado ninguna crónica en tu archivo secreto.
                        </p>
                        <button 
                            onClick={() => navigate('/buscar')}
                            className="mt-8 bg-stone-900 text-white px-8 py-3 rounded-full font-serif italic hover:bg-stone-800 transition-all"
                        >
                            Explorar la biblioteca
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {favorites.map((review) => (
                            <article
                                key={review.id}
                                onClick={() => navigate(`/review/${review.id}`)}
                                className="group bg-white border border-stone-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col"
                            >
                                {/* Contenedor de Imagen con Overlay */}
                                <div className="relative h-72 overflow-hidden">
                                    <img
                                        src={
                                            review.image_url?.startsWith("http")
                                                ? review.image_url
                                                : review.image_url
                                                ? `${API_URL}${review.image_url}`
                                                : "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000"
                                        }
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={review.book_title}
                                        onError={(e) => {
                                            e.currentTarget.src = "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                    <div className="absolute top-6 right-6">
                                        <div className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg">
                                            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido Editorial */}
                                <div className="p-8 flex flex-col flex-grow">
                                    <p className="text-amber-800 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                                        {review.categoria_ia || "Literatura"}
                                    </p>
                                    <h3 className="font-serif font-bold text-2xl text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
                                        {review.book_title}
                                    </h3>
                                    <p className="text-stone-500 text-sm font-serif italic mb-6">
                                        por {review.author}
                                    </p>
                                    
                                    <div className="mt-auto pt-6 border-t border-stone-100 flex justify-between items-center">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-stone-900 flex items-center gap-2">
                                            Leer Reseña <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyFavoritesPage;