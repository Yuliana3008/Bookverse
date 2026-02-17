import React, { useState } from "react";
import { Edit3, Star, BookOpen, User, ImageIcon, AlertCircle } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import API_URL from "../config";

const AddReviewPage = () => {
  const { isAuthenticated, setAuthMessage, openModal, checkSession } =
    useOutletContext();

  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(0); // 0 = sin selección, -1 = No me gustó, 1-5 = estrellas
  const [reviewText, setReviewText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (checkSession) await checkSession();

    if (!isAuthenticated) {
      setAuthMessage({
        type: "error",
        text: "Debes iniciar sesión para publicar una reseña.",
      });
      openModal("login");
      return;
    }

    // Validación: Ahora permitimos rating -1
    if (
      rating === 0 || 
      reviewText.length < 10 ||
      bookTitle.length < 3 ||
      author.length < 2
    ) {
      setAuthMessage({
        type: "error",
        text: "Por favor, completa todos los campos (incluyendo la puntuación).",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("book_title", bookTitle);
    formData.append("book_id", bookTitle.toLowerCase().replace(/\s/g, "_"));
    formData.append("author", author);
    formData.append("rating", String(rating));
    formData.append("review_text", reviewText);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthMessage({
            type: "error",
            text: "Tu sesión expiró. Vuelve a iniciar sesión.",
          });
          openModal("login");
          return;
        }
        throw new Error(result.error || "Falló la publicación de la reseña");
      }

      setAuthMessage({
        type: "success",
        text: `¡Reseña de "${bookTitle}" publicada con éxito!`,
      });

      // Resetear formulario
      setBookTitle("");
      setAuthor("");
      setRating(0);
      setReviewText("");
      setImageFile(null);
      setPreviewUrl(null);
    } catch (error) {
      setAuthMessage({
        type: "error",
        text: error?.message || "Error al conectar con el servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-24 min-h-screen text-center bg-[#e9e4d5] px-4">
        <div className="bg-[#f4f1ea] p-6 md:p-10 shadow-2xl border border-stone-300 max-w-md w-full">
          <Edit3 className="w-12 h-12 md:w-16 md:h-16 text-amber-900 mb-6 mx-auto opacity-50" />
          <h2 className="text-2xl md:text-3xl font-serif font-black text-stone-900 mb-4 italic">
            Acceso Restringido
          </h2>
          <p className="text-stone-700 font-serif mb-8 text-base md:text-lg italic">
            Necesitas iniciar sesión para poder escribir una reseña.
          </p>
          <button
            onClick={() => openModal("login")}
            className="w-full bg-amber-900 text-[#f4f1ea] px-6 py-4 font-serif italic text-lg md:text-xl shadow-lg hover:bg-black transition-all"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const renderStars = () => {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Opción de Pésimo / Odio */}
        <div className="flex flex-col items-center group">
          <button
            type="button"
            onClick={() => setRating(rating === -1 ? 0 : -1)}
            className="focus:outline-none transition-transform active:scale-90"
          >
            <Star
              fill={rating === -1 ? "#b91c1c" : "none"}
              stroke={rating === -1 ? "#b91c1c" : "#78716c"}
              className={`w-10 h-10 md:w-12 md:h-12 transition-colors ${
                rating === -1 ? "drop-shadow-[0_0_8px_rgba(185,28,28,0.4)]" : "group-hover:stroke-red-400"
              }`}
            />
          </button>
          <span className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${rating === -1 ? "text-red-700" : "text-stone-400"}`}>
            Pésimo
          </span>
        </div>

        {/* Separador */}
        <div className="hidden sm:block h-10 w-[2px] bg-stone-300"></div>

        {/* Estrellas 1-5 */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <Star
                key={starValue}
                fill={rating >= starValue ? "#78350f" : "none"}
                stroke={rating >= starValue ? "#78350f" : "#78716c"}
                className={`w-8 h-8 md:w-10 md:h-10 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 ${
                  rating === -1 ? "opacity-20 grayscale" : "opacity-100"
                }`}
                onClick={() => setRating(starValue)}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold mt-1 uppercase text-stone-400 tracking-tighter">
            Calificación Estándar
          </span>
        </div>
      </div>
    );
  };

  return (
    <section id="nueva-reseña" className="py-12 md:py-24 bg-[#e9e4d5] min-h-screen px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-serif font-black text-stone-900 flex flex-col md:flex-row items-center justify-center italic gap-2 md:gap-4">
            <Edit3 className="w-7 h-7 md:w-9 md:h-9 text-amber-800 opacity-80" />
            Escribe una Nueva Reseña
          </h2>
          <div className="h-1 w-20 md:w-24 bg-amber-800 mx-auto mt-4 md:mt-6 shadow-sm"></div>
        </div>

        <div className="bg-[#f4f1ea] p-6 md:p-10 shadow-2xl border border-stone-300 relative overflow-hidden">
          <div className="hidden sm:block absolute top-0 left-0 w-2 h-full bg-stone-300 border-r border-stone-400"></div>

          <form onSubmit={handleSubmit} className="sm:pl-4">
            {/* Título */}
            <div className="mb-6 md:mb-8">
              <label htmlFor="bookTitle" className="block text-stone-900 font-serif font-bold text-base md:text-lg mb-2 md:mb-3 flex items-center italic">
                <BookOpen className="w-5 h-5 mr-3 text-amber-900 shrink-0" />
                Título del Libro:
              </label>
              <input
                id="bookTitle"
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                required
                className="w-full p-3 md:p-4 bg-transparent border-b-2 border-stone-300 focus:border-amber-800 outline-none text-lg md:text-xl font-serif italic text-stone-800 placeholder-stone-400"
                placeholder="Ej: Cien años de soledad"
                disabled={isSubmitting}
              />
            </div>

            {/* Autor */}
            <div className="mb-6 md:mb-8">
              <label htmlFor="author" className="block text-stone-900 font-serif font-bold text-base md:text-lg mb-2 md:mb-3 flex items-center italic">
                <User className="w-5 h-5 mr-3 text-amber-900 shrink-0" />
                Autor:
              </label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="w-full p-3 md:p-4 bg-transparent border-b-2 border-stone-300 focus:border-amber-800 outline-none text-lg md:text-xl font-serif italic text-stone-800 placeholder-stone-400"
                placeholder="Ej: Gabriel García Márquez"
                disabled={isSubmitting}
              />
            </div>

            {/* Imagen */}
            <div className="mb-6 md:mb-8">
              <label className="block text-stone-900 font-serif font-bold text-base md:text-lg mb-3 flex items-center italic">
                <ImageIcon className="w-5 h-5 mr-3 text-amber-900 shrink-0" />
                Portada del Libro:
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="w-full sm:w-auto text-center cursor-pointer bg-[#ede9dd] border border-stone-300 px-6 py-3 font-serif italic text-stone-700 hover:bg-stone-200 transition-all shadow-sm text-sm">
                  {imageFile ? "Cambiar Imagen" : "Seleccionar Archivo"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isSubmitting} />
                </label>
                {imageFile && <span className="text-stone-500 italic text-xs truncate max-w-full">{imageFile.name}</span>}
              </div>
              {previewUrl && (
                <div className="mt-6 flex justify-center sm:justify-start">
                  <img src={previewUrl} alt="Vista previa" className="h-36 md:h-44 shadow-lg border-4 border-white p-1 bg-white" />
                </div>
              )}
            </div>

            {/* Puntuación (Nuevo renderStars) */}
            <div className="mb-8 md:mb-10 p-4 bg-[#ede9dd]/30 border border-stone-200 rounded-sm">
              <label className="block text-stone-900 font-serif font-bold text-base md:text-lg mb-4 italic text-center sm:text-left">
                ¿Qué te pareció el libro?
              </label>
              <div className="flex justify-center sm:justify-start">
                {renderStars()}
              </div>
              {rating === -1 && (
                <p className="text-red-700 text-[11px] mt-3 italic font-serif text-center sm:text-left animate-pulse">
                  * Has marcado este libro como una experiencia negativa.
                </p>
              )}
            </div>

            {/* Review */}
            <div className="mb-8 md:mb-10">
              <label htmlFor="reviewText" className="block text-stone-900 font-serif font-bold text-base md:text-lg mb-3 italic">
                Tu Reseña:
              </label>
              <textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="6"
                required
                className="w-full p-4 md:p-6 bg-[#ede9dd]/50 border border-stone-300 focus:border-amber-800 outline-none font-serif text-base md:text-lg italic text-stone-800 leading-relaxed resize-y placeholder-stone-400"
                placeholder="Comparte tu opinión..."
                disabled={isSubmitting}
              ></textarea>
              <p className="text-[10px] text-stone-500 font-sans tracking-widest uppercase mt-3 italic">
                Mínimo 10 caracteres.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 md:py-5 text-lg md:text-xl font-serif italic transition shadow-xl border border-amber-950 ${
                isSubmitting
                  ? "bg-stone-400 cursor-not-allowed text-stone-200"
                  : "bg-amber-900 text-[#f4f1ea] hover:bg-black active:translate-y-1"
              }`}
            >
              {isSubmitting ? "Publicando..." : "Publicar Reseña"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddReviewPage;