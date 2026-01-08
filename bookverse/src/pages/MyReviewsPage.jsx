import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, User, BookOpen, Sparkles, Ghost, Heart, Search, Sword, Rocket, EyeOff, Calendar } from "lucide-react";
import API_URL from '../config';

const MyReviewCard = ({ review }) => {
  const [revealed, setRevealed] = useState(false);

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? "text-amber-800 fill-amber-800" : "text-stone-300"}`}
      />
    ));
  };

  const getGenreDetails = (categoria) => {
    if (!categoria || categoria === "Analizando") {
      return { style: 'bg-stone-100 text-stone-500 border-stone-200 animate-pulse', icon: <Sparkles className="w-3 h-3" /> };
    }
    const cat = categoria.toLowerCase().trim();
    const config = {
      'terror': { style: 'bg-red-100 text-red-800 border-red-200 shadow-[0_0_8px_rgba(153,27,27,0.2)]', icon: <Ghost className="w-3 h-3" /> },
      'romance': { style: 'bg-rose-100 text-rose-800 border-rose-200 shadow-[0_0_8px_rgba(157,23,77,0.2)]', icon: <Heart className="w-3 h-3" /> },
      'suspenso': { style: 'bg-slate-200 text-slate-800 border-slate-300 shadow-[0_0_8px_rgba(30,41,59,0.2)]', icon: <Search className="w-3 h-3" /> },
      'fantasía': { style: 'bg-purple-100 text-purple-800 border-purple-200 shadow-[0_0_8px_rgba(107,33,168,0.2)]', icon: <Sword className="w-3 h-3" /> },
      'fantasia': { style: 'bg-purple-100 text-purple-800 border-purple-200 shadow-[0_0_8px_rgba(107,33,168,0.2)]', icon: <Sword className="w-3 h-3" /> },
      'ciencia ficción': { style: 'bg-cyan-100 text-cyan-800 border-cyan-200 shadow-[0_0_8px_rgba(21,94,117,0.2)]', icon: <Rocket className="w-3 h-3" /> }
    };
    return config[cat] || { style: 'bg-stone-200 text-stone-700 border-stone-300', icon: <Sparkles className="w-3 h-3" /> };
  };

  const { style, icon } = getGenreDetails(review.categoriaIA);

  return (
    <div className="block group transition-all duration-300 hover:-translate-y-2 h-full">
      <div className="bg-[#fdfcf8] p-7 border border-stone-300 shadow-md group-hover:shadow-2xl transition-all group-hover:border-amber-700 relative h-full flex flex-col">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-stone-200 group-hover:bg-amber-800 transition-colors"></div>
        <div className="absolute -top-3 right-4 z-20">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-500 ${style}`}>
            {icon} IA: {review.categoriaIA || 'Analizando'}
          </span>
        </div>

        {/* --- CORRECCIÓN DE IMAGEN --- */}
        <div className="mb-6 overflow-hidden border border-stone-200 shadow-inner bg-stone-100 aspect-[3/4] flex items-center justify-center">
          {review.imageUrl ? (
            <img 
              src={review.imageUrl} 
              alt={review.bookTitle} 
              className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://via.placeholder.com/300x400?text=Sin+Portada';
              }}
            />
          ) : (
            <BookOpen className="w-12 h-12 text-stone-300" />
          )}
        </div>

        <div className="flex justify-between items-center mb-4 pl-2">
          <div className="flex items-center space-x-2">
            <div className="bg-stone-100 p-1 rounded border border-stone-200">
              <User className="w-4 h-4 text-stone-600" />
            </div>
            {/* --- CORRECCIÓN DE NOMBRE DE USUARIO --- */}
            <p className="font-serif text-xs font-bold text-stone-600 truncate max-w-[120px]">{review.user}</p>
          </div>
          <div className="flex bg-amber-50/50 p-1 border border-amber-100/50 rounded shadow-sm">{renderStars(review.rating)}</div>
        </div>

        <h3 className="text-xl font-serif font-black text-stone-900 mb-1 pl-2 leading-tight group-hover:text-amber-900 transition-colors">{review.bookTitle}</h3>
        <h3 className="text-xl font-serif font-black text-stone-900 mb-1 pl-2 leading-tight group-hover:text-amber-900 transition-colors">{review.bookTitle}</h3>
        <p className="text-amber-900 font-sans font-bold italic text-[10px] mb-4 pl-2 uppercase tracking-widest opacity-80">de {review.author}</p>

        <div className="relative mb-6 flex-grow">
          {review.isSpoiler && !revealed ? (
            <div className="relative overflow-hidden cursor-default">
              <p className="text-stone-400 italic font-serif text-sm pl-6 border-l-2 border-stone-200 line-clamp-3 leading-relaxed blur-md select-none pointer-events-none grayscale opacity-30">"{review.text}"</p>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-stone-100/10">
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRevealed(true); }}
                  className="flex items-center gap-2 bg-stone-800 text-[9px] text-white px-3 py-1.5 uppercase font-black tracking-widest hover:bg-amber-900 transition-colors shadow-lg z-30"
                >
                  <EyeOff className="w-3 h-3" /> Revelar Spoiler
                </button>
              </div>
            </div>
          ) : (
            <p className="text-stone-700 italic font-serif text-sm pl-6 border-l-2 border-stone-200 line-clamp-3 leading-relaxed flex-grow">"{review.text}"</p>
          )}
        </div>

        <Link to={`/review/${review.id}`} className="flex justify-between items-center text-[9px] text-stone-400 font-sans tracking-widest uppercase border-t border-stone-100 pt-4 mt-auto pl-2 group/link">
          <p>{review.date}</p>
          <div className="flex items-center gap-1 text-amber-900 font-bold group-hover/link:translate-x-1 transition-transform">
            <span>Explorar</span>
            <BookOpen className="w-3 h-3" />
          </div>
        </Link>
      </div>
    </div>
  );
};

const MyReviewsPage = () => {
  const { userId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   fetch(`${API_URL}/api/reviews/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((review) => ({
          id: review.id,
          // --- CORRECCIÓN: Usar 'review.name' que viene del JOIN en tu backend ---
          user: review.name || "Usuario", 
          bookTitle: review.book_title,
          author: review.author,
          // --- CORRECCIÓN: Cloudinary ya entrega URLs completas (http...), no sumamos API_URL ---
          imageUrl: review.image_url || null,
          rating: Number(review.rating) || 0,
          text: review.review_text,
          categoriaIA: review.categoria_ia,
          isSpoiler: review.is_spoiler, 
          date: review.created_at
            ? new Date(review.created_at).toLocaleDateString("es-MX", {
                day: 'numeric', month: 'long', year: 'numeric'
              })
            : "",
        }));
        setReviews(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando mis reseñas:", err);
        setLoading(false);
      });
  }, [userId]);

  return (
    <section className="py-24 bg-[#e9e4d5] min-h-screen border-t border-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-amber-900 font-bold tracking-[0.4em] uppercase text-xs mb-3 font-sans">TU BIBLIOTECA PERSONAL</p>
          <h2 className="text-4xl font-serif font-black text-stone-900 italic flex items-center justify-center">
            <BookOpen className="w-8 h-8 mr-4 text-amber-800 opacity-80" />
            Mis Reseñas
          </h2>
          <div className="h-1 w-24 bg-amber-800 mx-auto mt-6 shadow-sm"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mb-4"></div>
             <p className="text-amber-900 font-serif italic text-xl">Buscando tus crónicas...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {reviews.map((review) => (
              <MyReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#fdfcf8] border border-dashed border-stone-400 rounded-lg">
             <p className="text-stone-500 font-serif italic text-lg mb-6">Aún no has escrito ninguna crónica literaria.</p>
             <Link to="/add-review" className="bg-stone-800 text-white px-6 py-2 uppercase font-black tracking-widest hover:bg-amber-900 transition-colors">
               Escribir mi primera reseña
             </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyReviewsPage;