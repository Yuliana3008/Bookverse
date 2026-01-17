import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  User,
  BookOpen,
  Sparkles,
  Ghost,
  Heart,
  Search,
  Sword,
  Rocket,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import API_URL from "../config";

/* ===================== CARD ===================== */
const ReviewCard = ({ review }) => {
  const [revealed, setRevealed] = useState(false);

  const renderStars = (rating) =>
    Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${
            index < rating ? "text-amber-800 fill-amber-800" : "text-stone-300"
          }`}
        />
      ));

  const getGenreDetails = (categoria) => {
    if (!categoria || categoria === "Analizando") {
      return {
        style: "bg-stone-100 text-stone-500 border-stone-200 animate-pulse",
        icon: <Sparkles className="w-3 h-3" />,
      };
    }
    const cat = categoria.toLowerCase().trim();
    if (cat.includes("terror"))
      return {
        style: "bg-red-100 text-red-800 border-red-200 shadow-sm",
        icon: <Ghost className="w-3 h-3" />,
      };
    if (cat.includes("romance"))
      return {
        style: "bg-rose-100 text-rose-800 border-rose-200 shadow-sm",
        icon: <Heart className="w-3 h-3" />,
      };
    if (cat.includes("suspenso"))
      return {
        style: "bg-slate-200 text-slate-800 border-slate-300 shadow-sm",
        icon: <Search className="w-3 h-3" />,
      };
    if (cat.includes("fantasía") || cat.includes("fantasia"))
      return {
        style: "bg-purple-100 text-purple-800 border-purple-200 shadow-sm",
        icon: <Sword className="w-3 h-3" />,
      };
    if (cat.includes("ciencia ficción") || cat.includes("ciencia ficcion"))
      return {
        style: "bg-cyan-100 text-cyan-800 border-cyan-200 shadow-sm",
        icon: <Rocket className="w-3 h-3" />,
      };

    return {
      style: "bg-stone-200 text-stone-700 border-stone-300",
      icon: <Sparkles className="w-3 h-3" />,
    };
  };

  const { style, icon } = getGenreDetails(review.categoriaIA);

  const finalImageUrl = review.imageUrl?.startsWith("http")
    ? review.imageUrl
    : review.imageUrl
      ? `${API_URL}${review.imageUrl}`
      : "https://via.placeholder.com/400x600?text=Sin+Portada";

  return (
    <div className="block group transition-all duration-300 hover:-translate-y-2 h-full">
      <div className="bg-[#fdfcf8] p-7 border border-stone-300 shadow-md group-hover:shadow-2xl transition-all group-hover:border-amber-700 relative h-full flex flex-col">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-stone-200 group-hover:bg-amber-800 transition-colors"></div>

        <div className="absolute -top-3 right-4 z-20">
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-500 ${style}`}
          >
            {icon}
            IA: {review.categoriaIA || "Analizando"}
          </span>
        </div>

        <div className="mb-6 overflow-hidden border border-stone-200 shadow-inner bg-stone-100 aspect-[3/4]">
          <img
            src={finalImageUrl}
            alt={review.bookTitle}
            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://via.placeholder.com/400x600?text=Imagen+No+Disponible";
            }}
          />
        </div>

        <div className="flex justify-between items-center mb-4 pl-2">
          <div className="flex items-center space-x-2">
            <div className="bg-stone-100 p-1 rounded border border-stone-200">
              <User className="w-4 h-4 text-stone-600" />
            </div>
            <p className="font-serif text-xs font-bold text-stone-600 truncate max-w-[120px]">
              {review.user}
            </p>
          </div>

          <div className="flex bg-amber-50/50 p-1 border border-amber-100/50 rounded shadow-sm">
            {renderStars(review.rating)}
          </div>
        </div>

        <h3 className="text-xl font-serif font-black text-stone-900 mb-1 pl-2 leading-tight group-hover:text-amber-900 transition-colors">
          {review.bookTitle}
        </h3>

        <p className="text-amber-900 font-sans font-bold italic text-[10px] mb-4 pl-2 uppercase tracking-widest opacity-80">
          de {review.author}
        </p>

        <div className="relative mb-6 flex-grow">
          {review.isSpoiler && !revealed ? (
            <div className="relative overflow-hidden cursor-default">
              <p className="text-stone-400 italic font-serif text-sm pl-6 border-l-2 border-stone-200 line-clamp-3 leading-relaxed blur-md select-none pointer-events-none grayscale opacity-30">
                "{review.text}"
              </p>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-stone-100/10">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setRevealed(true);
                  }}
                  className="flex items-center gap-2 bg-stone-800 text-[9px] text-white px-3 py-1.5 uppercase font-black tracking-widest hover:bg-amber-900 transition-colors shadow-lg z-30"
                >
                  <EyeOff className="w-3 h-3" /> Revelar Spoiler
                </button>
              </div>
            </div>
          ) : (
            <p className="text-stone-700 italic font-serif text-sm pl-6 border-l-2 border-stone-200 line-clamp-3 leading-relaxed flex-grow">
              "{review.text}"
            </p>
          )}
        </div>

        <Link
          to={`/review/${review.id}`}
          className="flex justify-between items-center text-[9px] text-stone-400 font-sans tracking-widest uppercase border-t border-stone-100 pt-4 mt-auto pl-2 group/link"
        >
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

/* ===================== SECTION ===================== */
export const RecentReviewsSection = ({ title = "Reseñas", limit = null }) => {
  const [rawReviews, setRawReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // newest | oldest
  const [sortOrder, setSortOrder] = useState("newest");

  // paginación (solo cuando NO hay limit)
  const [page, setPage] = useState(1);
  const pageSize = 10; // ✅ 9 queda perfecto con grid md:grid-cols-3 (3x3)

  useEffect(() => {
    let alive = true;

    setLoading(true);
    fetch(`${API_URL}/api/reviews`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!alive) return;

        const formatted = (Array.isArray(data) ? data : []).map((review) => ({
          id: review.id,
          user: review.name || "Usuario",
          bookTitle: review.book_title,
          author: review.author,
          imageUrl: review.image_url,
          rating: Number(review.rating) || 0,
          text: review.review_text,
          categoriaIA: review.categoria_ia,
          isSpoiler: review.is_spoiler,
          createdAt: review.created_at,
          date: review.created_at
            ? new Date(review.created_at).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "",
        }));

        setRawReviews(formatted);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error cargando reseñas:", error);
        if (!alive) return;
        setRawReviews([]);
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  // si cambias el orden, vuelve a página 1
  useEffect(() => {
    setPage(1);
  }, [sortOrder]);

  // Ordenar (siempre)
  const sortedReviews = useMemo(() => {
    return [...rawReviews].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortOrder === "newest" ? db - da : da - db;
    });
  }, [rawReviews, sortOrder]);

  // Si viene limit (ej. destacadas), se aplica y NO paginamos
  const limitedReviews = useMemo(() => {
    return limit ? sortedReviews.slice(0, limit) : sortedReviews;
  }, [sortedReviews, limit]);

  // Paginación solo cuando NO hay limit
  const totalPages = useMemo(() => {
    if (limit) return 1;
    return Math.max(1, Math.ceil(limitedReviews.length / pageSize));
  }, [limitedReviews.length, limit, pageSize]);

  const paginatedReviews = useMemo(() => {
    if (limit) return limitedReviews;

    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return limitedReviews.slice(start, end);
  }, [limitedReviews, limit, page, pageSize, totalPages]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <section className="py-24 bg-[#e9e4d5] border-t border-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-amber-900 font-bold tracking-[0.4em] uppercase text-xs mb-3 font-sans">
            MyBookCompass 
          </p>
          <h2 className="text-4xl font-serif font-black text-stone-900 italic flex items-center justify-center">
            <BookOpen className="w-8 h-8 mr-4 text-amber-800 opacity-80" />
            {title}
          </h2>
          <div className="h-1 w-24 bg-amber-800 mx-auto mt-6 shadow-sm"></div>
        </div>

        {/* Orden + paginación solo en página completa */}
        {!limit && !loading && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <div className="text-stone-600 text-xs uppercase tracking-widest font-bold">
              Total: {limitedReviews.length} reseñas
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border border-stone-300 bg-[#fdfcf8] px-4 py-2 text-xs uppercase tracking-widest font-bold text-stone-700"
                aria-label="Ordenar reseñas"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguas</option>
              </select>

              {/* Controles paginación (arriba) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={page <= 1}
                  className={`flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-widest font-black border ${
                    page <= 1
                      ? "bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed"
                      : "bg-[#fdfcf8] text-stone-700 border-stone-300 hover:border-amber-800 hover:text-amber-900"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                <div className="text-xs uppercase tracking-widest font-bold text-stone-700">
                  Página {page} de {totalPages}
                </div>

                <button
                  onClick={goNext}
                  disabled={page >= totalPages}
                  className={`flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-widest font-black border ${
                    page >= totalPages
                      ? "bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed"
                      : "bg-[#fdfcf8] text-stone-700 border-stone-300 hover:border-amber-800 hover:text-amber-900"
                  }`}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mb-4"></div>
            <p className="text-amber-900 font-serif italic text-xl">
              Consultando los anaqueles...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {paginatedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {!paginatedReviews.length && (
              <div className="text-center mt-12 text-stone-600 font-serif italic">
                No hay reseñas para mostrar.
              </div>
            )}

            {/* Controles paginación (abajo) */}
            {!limit && totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-14">
                <button
                  onClick={goPrev}
                  disabled={page <= 1}
                  className={`px-4 py-2 text-xs uppercase tracking-widest font-black border ${
                    page <= 1
                      ? "bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed"
                      : "bg-[#fdfcf8] text-stone-700 border-stone-300 hover:border-amber-800 hover:text-amber-900"
                  }`}
                >
                  Anterior
                </button>

                <div className="text-xs uppercase tracking-widest font-bold text-stone-700">
                  Página {page} de {totalPages}
                </div>

                <button
                  onClick={goNext}
                  disabled={page >= totalPages}
                  className={`px-4 py-2 text-xs uppercase tracking-widest font-black border ${
                    page >= totalPages
                      ? "bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed"
                      : "bg-[#fdfcf8] text-stone-700 border-stone-300 hover:border-amber-800 hover:text-amber-900"
                  }`}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

/* ===================== PAGE WRAPPER ===================== */
const ReviewsPage = ({ limit }) => {
  return (
    <RecentReviewsSection
      title={limit ? "Reseñas Destacadas" : "Todas las Reseñas de MyBookCompass"}
      limit={limit}
    />
  );
};

export default ReviewsPage;
