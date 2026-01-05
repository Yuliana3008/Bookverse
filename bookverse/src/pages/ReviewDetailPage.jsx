import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, User, Calendar, Sparkles, Ghost, Heart, Search, Sword, Rocket, Eye, MessageSquare, Send } from "lucide-react";
import API_URL from '../config';

// --- COMPONENTE DE SECCIÓN DE COMENTARIOS ---
const CommentsSection = ({ reviewId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar comentarios desde el backend
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (error) {
        console.error("❌ Error cargando comentarios:", error);
      }
    };
    fetchComments();
  }, [reviewId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Si usas JWT, aquí deberías añadir el Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          text: newComment,
          // El 'user' lo obtendrá el backend de la sesión o token
        }),
      });

      if (response.ok) {
        const savedComment = await response.json();
        // Insertamos el nuevo comentario arriba
        setComments([savedComment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("❌ Error al publicar comentario, intentelo de nuevo", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-12 bg-[#f4f1ea] border border-stone-400 p-8 shadow-inner mb-20">
      <div className="flex items-center gap-3 mb-8 border-b border-stone-300 pb-4">
        <MessageSquare className="w-6 h-6 text-amber-900" />
        <h3 className="font-serif text-2xl font-black text-stone-900 italic">
          Conversaciones del Archivo
        </h3>
      </div>

      {/* Formulario simplificado: Solo el texto */}
      <form onSubmit={handleSubmit} className="mb-12">
        <div className="relative group">
          <textarea
            className="w-full bg-[#fdfcf8] border border-stone-300 p-4 pr-16 font-serif text-stone-800 focus:border-amber-800 outline-none transition-all placeholder:italic resize-none overflow-hidden"
            placeholder="Añade un comentario a la crónica..."
            rows="2"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <button 
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="absolute right-3 bottom-3 p-2 bg-stone-900 text-amber-50 hover:bg-amber-900 disabled:opacity-30 transition-all shadow-md group-hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Lista de comentarios de todas las personas */}
      <div className="space-y-8">
        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className="relative pl-6 border-l-2 border-amber-800/30 animate-in fade-in duration-500">
              <div className="flex items-center gap-3 mb-1">
                {/* Aquí 'c.user' vendrá del join que hagas en tu base de datos */}
                <span className="font-serif font-bold text-stone-900 text-sm">
                  {c.user_name || "Lector del Archivo"}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-stone-400 italic">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Reciente"}
                </span>
              </div>
              <p className="text-stone-700 font-serif italic text-md leading-relaxed">
                "{c.text}"
              </p>
            </div>
          ))
        ) : (
          <p className="text-stone-400 font-serif italic text-center py-10">
            Aún no hay ecos en esta sección.
          </p>
        )}
      </div>
    </section>
  );
};

// --- COMPONENTE PRINCIPAL (Sin cambios en la lógica de arriba) ---
const ReviewDetailPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await fetch(`${API_URL}/reviews/${id}`);
        if (!response.ok) throw new Error("Error al obtener la reseña");
        const data = await response.json();
        setReview(data);
      } catch (error) {
        console.error("❌ Error:", error);
      }
    };
    fetchReview();
  }, [id]);

  const getGenreDetails = (categoria) => {
    if (!categoria || categoria === "Analizando") {
      return { style: 'bg-stone-100 text-stone-500 border-stone-200', icon: <Sparkles className="w-4 h-4" /> };
    }
    const cat = categoria.toLowerCase().trim();
    const config = {
      'terror': { style: 'bg-red-100 text-red-800 border-red-200 shadow-sm', icon: <Ghost className="w-4 h-4" /> },
      'romance': { style: 'bg-rose-100 text-rose-800 border-rose-200 shadow-sm', icon: <Heart className="w-4 h-4" /> },
      'suspenso': { style: 'bg-slate-200 text-slate-800 border-slate-300 shadow-sm', icon: <Search className="w-4 h-4" /> },
      'fantasía': { style: 'bg-purple-100 text-purple-800 border-purple-200 shadow-sm', icon: <Sword className="w-4 h-4" /> },
      'fantasia': { style: 'bg-purple-100 text-purple-800 border-purple-200 shadow-sm', icon: <Sword className="w-4 h-4" /> },
      'ciencia ficción': { style: 'bg-cyan-100 text-cyan-800 border-cyan-200 shadow-sm', icon: <Rocket className="w-4 h-4" /> }
    };
    return config[cat] || { style: 'bg-stone-200 text-stone-700 border-stone-300', icon: <Sparkles className="w-4 h-4" /> };
  };

  if (!review) return <div className="p-20 text-center font-serif text-amber-900 animate-pulse">Desenrollando el pergamino...</div>;

  const imageUrl = review.image_url ? `${API_URL}${review.image_url}` : "/placeholder-book.jpg";
  const { style, icon } = getGenreDetails(review.categoria_ia);

  return (
    <div className="min-h-screen bg-[#e9e4d5] py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-amber-900 mb-8 font-serif italic hover:underline group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Volver al catálogo
        </button>

        <article className="bg-[#f4f1ea] border border-stone-400 shadow-2xl overflow-hidden relative">
          <div className="w-full h-96 overflow-hidden border-b border-stone-400 bg-stone-200">
            <img 
              src={imageUrl} 
              alt={review.book_title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "/placeholder-book.jpg"; }}
            />
          </div>

          <div className="p-12">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-5xl font-serif font-black text-stone-900 leading-tight">
                {review.book_title}
              </h1>
              <div className="bg-amber-900 text-white px-4 py-2 flex items-center shadow-lg">
                <Star className="w-5 h-5 mr-2 text-amber-400 fill-amber-400" />
                <span className="text-xl font-bold">{review.rating}</span>
              </div>
            </div>

            <div className="mb-6 flex">
              <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${style}`}>
                {icon}
                Clasificación IA: {review.categoria_ia || 'Analizando'}
              </span>
            </div>

            <p className="text-amber-900 font-sans font-bold uppercase tracking-[0.2em] text-sm mb-8">
              De {review.author || "Obra Anónima"}
            </p>

            <div className="prose prose-stone max-w-none mb-12 relative">
              {review.is_spoiler && !revealed ? (
                <div className="relative">
                  <p className="text-stone-800 text-xl leading-relaxed font-serif italic blur-md select-none pointer-events-none opacity-40">
                    {review.review_text}
                  </p>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-200/30 rounded-lg border-2 border-dashed border-amber-900/30 p-6 text-center">
                    <p className="text-amber-900 font-serif font-bold text-lg mb-4">
                      ⚠️ El Archivero advierte: Esta reseña contiene secretos de la trama.
                    </p>
                    <button 
                      onClick={() => setRevealed(true)}
                      className="flex items-center gap-2 bg-amber-900 text-amber-50 px-6 py-3 rounded-none font-sans font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors shadow-xl"
                    >
                      <Eye className="w-4 h-4" /> Revelar bajo mi responsabilidad
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-stone-800 text-xl leading-relaxed font-serif italic first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-amber-900 animate-in fade-in duration-700">
                  {review.review_text}
                </p>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-stone-300 flex flex-wrap gap-6 justify-between items-center text-stone-500 font-sans text-[10px] uppercase tracking-[0.2em]">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-amber-900" />
                Escrito por <span className="text-stone-800 font-bold ml-1">{review.user_name || "Usuario del Archivo"}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-amber-900" />
                {new Date(review.created_at).toLocaleDateString("es-MX", {
                    day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </article>

        {/* --- SECCIÓN DE COMENTARIOS --- */}
        <CommentsSection reviewId={id} />
        
      </div>
    </div>
  );
};

export default ReviewDetailPage;