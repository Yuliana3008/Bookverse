import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import {
  Star,
  ArrowLeft,
  User,
  Calendar,
  Sparkles,
  Ghost,
  Heart,
  Search,
  Sword,
  Rocket,
  Eye,
  MessageSquare,
  Send,
  Edit2,
  Trash2,
} from "lucide-react";
import API_URL from "../config";

/* =========================================================
    ✅ Helper: Auth headers (cookie + Bearer fallback)
    - En mobile/tablet a veces NO se guarda cookie -> Bearer salva
========================================================= */
const getAuthHeaders = () => {
  try {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

/* =========================================================
    ✅ COMPONENTE: COMENTARIOS
    - GET comentarios: público
    - POST/DELETE: privado (cookie) + fallback Bearer
========================================================= */
const CommentsSection = ({ reviewId, authUser, openModal }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/reviews/${reviewId}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (error) {
        console.error("❌ Error cargando comentarios:", error);
      }
    };
    if (reviewId) fetchComments();
  }, [reviewId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!authUser) {
      if (typeof openModal === "function") openModal("login");
      else alert("Debes iniciar sesión para comentar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ text: newComment }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Error al publicar comentario");

      setComments([result, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("❌ Error al publicar comentario:", error);
      alert(error.message || "Error al comentar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("¿Deseas borrar este comentario?")) return;

    try {
      const response = await fetch(`${API_URL}/api/reviews/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
        },
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "No se pudo eliminar");

      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("❌ Error al eliminar:", error);
      alert(error.message || "Error eliminando comentario");
    }
  };

  return (
    <section className="mt-8 md:mt-12 bg-[#f4f1ea] border border-stone-400 p-5 md:p-8 shadow-inner mb-10 md:mb-20">
      <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-stone-300 pb-4">
        <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-amber-900" />
        <h3 className="font-serif text-xl md:text-2xl font-black text-stone-900 italic">
          Conversaciones del Archivo
        </h3>
      </div>

      {authUser ? (
        <form onSubmit={handleSubmit} className="mb-8 md:mb-12">
          <div className="relative group">
            <textarea
              className="w-full bg-[#fdfcf8] border border-stone-300 p-4 pr-14 md:pr-16 font-serif text-stone-800 focus:border-amber-800 outline-none transition-all placeholder:italic resize-none overflow-hidden text-sm md:text-base"
              placeholder="Añade un comentario a la crónica..."
              rows="2"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="absolute right-3 bottom-3 p-2 bg-stone-900 text-amber-50 hover:bg-amber-900 shadow-md transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-12 p-6 border-2 border-dashed border-stone-300 text-center font-serif italic text-stone-500 text-sm md:text-base">
          Inicia sesión para participar en el Archivo.
        </div>
      )}

      <div className="space-y-6 md:space-y-8">
        {comments.map((c) => (
          <div key={c.id} className="relative pl-4 md:pl-6 border-l-2 border-amber-800/30 group">
            <div className="flex justify-between items-start mb-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-serif font-bold text-stone-900 text-xs md:text-sm">{c.user_name}</span>
                <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-stone-400 italic">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Reciente"}
                </span>
              </div>

              {authUser?.id === c.usuarios_id && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1 text-stone-400 hover:text-red-900"
                    title="Eliminar"
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-stone-700 font-serif italic whitespace-pre-wrap text-sm md:text-base">"{c.text}"</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* =========================================================
    ✅ PÁGINA DETALLE RESEÑA
========================================================= */
const ReviewDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { authUser, openModal } = useOutletContext();

  const [review, setReview] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editReviewFields, setEditReviewFields] = useState({
    book_title: "",
    author: "",
    review_text: "",
    rating: 5,
  });

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await fetch(`${API_URL}/api/reviews/${id}`);
        if (!response.ok) throw new Error("Error al obtener la reseña");
        const data = await response.json();

        setReview(data);
        setEditReviewFields({
          book_title: data.book_title || "",
          author: data.author || "",
          review_text: data.review_text || "",
          rating: data.rating ?? 5,
        });
      } catch (error) {
        console.error("❌ Error:", error);
      }
    };

    const checkFavoriteStatus = async () => {
      if (!authUser || !id) {
        setIsFavorite(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/reviews/favorites/check/${id}`, {
          credentials: "include",
          headers: {
            ...getAuthHeaders(),
          },
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) setIsFavorite(!!data.isFavorite);
        else setIsFavorite(false);
      } catch (error) {
        console.error("❌ Error verificando favorito:", error);
      }
    };

    if (id) {
      fetchReview();
      checkFavoriteStatus();
    }
  }, [id, authUser?.id]);

  const toggleFavorite = async () => {
    if (!authUser) {
      if (typeof openModal === "function") openModal("login");
      else alert("Debes iniciar sesión para guardar favoritos.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reviews/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          review_id: Number(id),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "No se pudo actualizar favorito");

      setIsFavorite(!!data.isFavorite);
    } catch (error) {
      console.error("❌ Error al actualizar favorito:", error);
      alert(error.message || "Error al actualizar favorito");
    }
  };

  const handleDeleteFullReview = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de eliminar esta crónica? Se perderán todos los comentarios."
      )
    )
      return;

    try {
      const response = await fetch(`${API_URL}/api/reviews/full/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "No se pudo eliminar");

      alert("Crónica eliminada.");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(error.message || "Error eliminando reseña");
    }
  };

  const handleUpdateReview = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(editReviewFields),
      });

      const updated = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(updated.error || "No se pudo actualizar");

      setReview({ ...review, ...updated });
      setIsEditingReview(false);
    } catch (error) {
      console.error(error);
      alert(error.message || "Error al actualizar reseña");
    }
  };

  const getGenreDetails = (categoria) => {
    if (!categoria || categoria === "Analizando") {
      return {
        style: "bg-stone-100 text-stone-500 border-stone-200",
        icon: <Sparkles className="w-4 h-4" />,
      };
    }
    const cat = categoria.toLowerCase().trim();
    if (cat.includes("terror"))
      return {
        style: "bg-red-100 text-red-800 border-red-200 shadow-sm",
        icon: <Ghost className="w-4 h-4" />,
      };
    if (cat.includes("romance"))
      return {
        style: "bg-rose-100 text-rose-800 border-rose-200 shadow-sm",
        icon: <Heart className="w-4 h-4" />,
      };
    if (cat.includes("suspenso"))
      return {
        style: "bg-slate-200 text-slate-800 border-slate-300 shadow-sm",
        icon: <Search className="w-4 h-4" />,
      };
    if (cat.includes("fantasía") || cat.includes("fantasia"))
      return {
        style: "bg-purple-100 text-purple-800 border-purple-200 shadow-sm",
        icon: <Sword className="w-4 h-4" />,
      };
    if (cat.includes("ciencia ficción"))
      return {
        style: "bg-cyan-100 text-cyan-800 border-cyan-200 shadow-sm",
        icon: <Rocket className="w-4 h-4" />,
      };
    return {
      style: "bg-stone-200 text-stone-700 border-stone-300",
      icon: <Sparkles className="w-4 h-4" />,
    };
  };

  if (!review) {
    return (
      <div className="p-20 text-center font-serif text-amber-900 animate-pulse">
        Desenrollando el pergamino...
      </div>
    );
  }

  const imageUrl = review.image_url?.startsWith("http")
    ? review.image_url
    : review.image_url
    ? `${API_URL}${review.image_url}`
    : "";

  const { style, icon } = getGenreDetails(review.categoria_ia);

  return (
    <div className="min-h-screen bg-[#e9e4d5] py-10 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-amber-900 mb-6 md:mb-8 font-serif italic hover:underline group text-sm md:text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />{" "}
          Volver al catálogo
        </button>

        <article className="bg-[#f4f1ea] border border-stone-400 shadow-2xl overflow-hidden relative">
          <div className="w-full h-64 md:h-96 overflow-hidden border-b border-stone-400 bg-stone-200">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={review.book_title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-500 font-serif italic">
                Sin imagen
              </div>
            )}
          </div>

          <div className="p-6 md:p-12">
            {!isEditingReview ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                  <div className="flex flex-col gap-3 md:gap-4 w-full">
                    <h1 className="text-3xl md:text-5xl font-serif font-black text-stone-900 leading-tight break-words">
                      {review.book_title}
                    </h1>

                    <button
                      onClick={toggleFavorite}
                      className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full border border-stone-300 bg-white/50 hover:bg-white transition-all group"
                      type="button"
                    >
                      <Star
                        className={`w-4 h-4 transition-all ${
                          isFavorite
                            ? "text-amber-500 fill-amber-500 scale-110"
                            : "text-stone-400 group-hover:text-amber-600"
                        }`}
                      />
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-600">
                        {isFavorite ? "En tu archivo favorito" : "Añadir a favoritos"}
                      </span>
                    </button>
                  </div>

                  <div className="bg-amber-900 text-white px-4 py-2 flex items-center shadow-lg self-start md:self-auto shrink-0">
                    <Star className="w-5 h-5 mr-2 text-amber-400 fill-amber-400" />
                    <span className="text-xl font-bold">{review.rating}</span>
                  </div>
                </div>

                <div className="mb-6 flex">
                  <span
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] md:text-xs font-black uppercase tracking-widest ${style}`}
                  >
                    {icon} Clasificación IA: {review.categoria_ia || "Analizando"}
                  </span>
                </div>

                <p className="text-amber-900 font-sans font-bold uppercase tracking-[0.2em] text-xs md:text-sm mb-8">
                  De {review.author || "Obra Anónima"}
                </p>

                <div className="prose prose-stone max-w-none mb-10 md:mb-12 relative">
                  {review.is_spoiler && !revealed ? (
                    <div className="relative">
                      <p className="text-stone-800 text-lg md:text-xl leading-relaxed font-serif italic blur-md opacity-40 select-none">
                        {review.review_text}
                      </p>
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-200/30 p-6 text-center border-2 border-dashed border-amber-800/20">
                        <p className="text-amber-900 font-serif font-bold text-base md:text-lg mb-4 text-center">
                          ⚠️ Advertencia: Spoiler.
                        </p>
                        <button
                          onClick={() => setRevealed(true)}
                          className="bg-amber-900 text-amber-50 px-6 py-3 font-sans font-bold uppercase tracking-widest text-xs md:text-sm"
                          type="button"
                        >
                          <Eye className="w-4 h-4 inline mr-2" /> Revelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-stone-800 text-lg md:text-xl leading-relaxed font-serif italic first-letter:text-4xl md:first-letter:text-5xl first-letter:text-amber-900">
                      {review.review_text}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <input
                  className="text-xl md:text-3xl font-serif w-full p-3 border border-stone-300"
                  value={editReviewFields.book_title}
                  onChange={(e) =>
                    setEditReviewFields({ ...editReviewFields, book_title: e.target.value })
                  }
                />
                <input
                  className="w-full p-3 border border-stone-300"
                  value={editReviewFields.author}
                  onChange={(e) =>
                    setEditReviewFields({ ...editReviewFields, author: e.target.value })
                  }
                />
                <textarea
                  className="w-full p-4 border border-stone-300 font-serif"
                  rows="8"
                  value={editReviewFields.review_text}
                  onChange={(e) =>
                    setEditReviewFields({ ...editReviewFields, review_text: e.target.value })
                  }
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleUpdateReview}
                    className="bg-amber-900 text-white px-6 py-2 text-xs font-bold uppercase"
                    type="button"
                  >
                    GUARDAR CAMBIOS
                  </button>
                  <button
                    onClick={() => setIsEditingReview(false)}
                    className="text-stone-500 text-xs font-bold uppercase"
                    type="button"
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 md:mt-12 pt-8 border-t border-stone-300 flex flex-wrap gap-y-4 gap-x-6 justify-between items-center text-stone-500 text-[9px] md:text-[10px] uppercase tracking-[0.2em]">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-amber-900" />
                Escrito por{" "}
                <span className="text-stone-800 font-bold ml-1">{review.user_name}</span>
              </div>

              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-amber-900" />{" "}
                {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}
              </div>

              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2 text-amber-900" />
                {(review.views_count ?? 0).toLocaleString("es-MX")} vistas
              </div>

              {authUser?.id === review.usuarios_id && !isEditingReview && (
                <div className="flex gap-4 w-full md:w-auto md:ml-auto pt-4 md:pt-0">
                  <button
                    onClick={() => setIsEditingReview(true)}
                    className="flex items-center gap-1 text-amber-900 hover:underline font-bold"
                    type="button"
                  >
                    <Edit2 className="w-3 h-3" /> Editar Crónica
                  </button>
                  <button
                    onClick={handleDeleteFullReview}
                    className="flex items-center gap-1 text-red-800 hover:underline font-bold"
                    type="button"
                  >
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </article>

        <CommentsSection reviewId={id} authUser={authUser} openModal={openModal} />
      </div>
    </div>
  );
};

export default ReviewDetailPage;