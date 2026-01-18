import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, Star, User, Calendar, Wand2, Search, RotateCcw } from 'lucide-react';
import API_URL from '../config';

const FindBookPage = () => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getGenreStyle = (categoria) => {
    if (!categoria) return "bg-stone-100 text-stone-500 border-stone-200";
    const cat = categoria.toLowerCase();
    if (cat.includes("híbrido")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (cat.includes("terror")) return "bg-red-100 text-red-800 border-red-200";
    if (cat.includes("romance")) return "bg-rose-100 text-rose-800 border-rose-200";
    if (cat.includes("suspenso")) return "bg-slate-200 text-slate-800 border-slate-300";
    if (cat.includes("fantasía")) return "bg-purple-100 text-purple-800 border-purple-200";
    if (cat.includes("ciencia ficción")) return "bg-cyan-100 text-cyan-800 border-cyan-200";
    return "bg-stone-200 text-stone-700 border-stone-300";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setError('Por favor, describe el tipo de libro que buscas');
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const response = await fetch(`${API_URL}/api/reviews/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userDescription: description })
      });

      if (!response.ok) {
        throw new Error('Error al obtener recomendaciones');
      }

      const data = await response.json();
      setRecommendations(data.recomendaciones);
    } catch (err) {
      setError('No se pudieron consultar los archivos literarios. Intenta nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReview = (id) => {
    if (id) {
      navigate(`/review/${id}`);
    }
  };

  return (
    <section className="py-12 md:py-24 bg-[#e9e4d5] min-h-screen font-serif px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Responsivo */}
        <div className="text-center mb-10 md:mb-12">
          <p className="text-amber-900 font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs mb-2 font-sans">
            Consulta Personalizada
          </p>
          <h2 className="text-2xl md:text-4xl font-black text-stone-900 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 leading-tight break-words">
            <Wand2 className="w-7 h-7 md:w-8 md:h-8 text-amber-800" />
            Encuentra tu Libro Ideal
          </h2>
          <div className="h-1 w-20 md:w-24 bg-amber-800 mx-auto mt-4 md:mt-6 shadow-sm"></div>
          <p className="text-stone-700 text-base md:text-lg mt-6 italic max-w-2xl mx-auto leading-relaxed">
            Describe tus preferencias literarias y nuestra inteligencia artificial consultará el archivo para recomendarte obras parecidas
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-12 md:mb-16">
          <div className="bg-[#f4f1ea] p-6 md:p-8 border border-stone-400 shadow-xl relative">
             <div className="hidden sm:block absolute top-0 left-0 w-1.5 h-full bg-stone-300"></div>
            <label 
              htmlFor="description" 
              className="block text-stone-900 font-bold text-lg mb-4 flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5 text-amber-900" />
              Describe tu búsqueda literaria
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Por ejemplo: Busco una novela gótica ambientada en el siglo XIX..."
              rows="8"
              disabled={loading}
              className="w-full p-4 md:p-5 bg-transparent border-2 border-stone-300 focus:border-amber-800 focus:ring-0 text-base md:text-lg italic text-stone-900 placeholder-stone-500 resize-y transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <p className="mt-3 text-xs md:text-sm text-stone-600 italic flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-900 flex-shrink-0 mt-0.5" />
              <span>
                Sé específico: menciona géneros, épocas, temas, autores admirados, o emociones que deseas experimentar
              </span>
            </p>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border-2 border-red-300 text-red-900 p-5 italic text-center text-sm md:text-base">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-amber-900 text-[#f4f1ea] py-4 md:py-5 px-8 text-base md:text-lg font-bold tracking-wider uppercase hover:bg-black transition-all duration-300 border-2 border-amber-950 shadow-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#f4f1ea] border-t-transparent"></div>
                Consultando los archivos...
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                Consultar Archivo Literario
              </>
            )}
          </button>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="bg-[#f4f1ea] border border-stone-400 shadow-xl p-10 md:p-16 text-center">
            <div className="mb-8">
              <div className="w-12 h-16 md:w-16 md:h-20 bg-amber-900 border-2 border-amber-950 mx-auto relative animate-pulse">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 space-y-2">
                  <div className="w-8 md:w-10 h-0.5 bg-[#f4f1ea]"></div>
                  <div className="w-8 md:w-10 h-0.5 bg-[#f4f1ea]"></div>
                  <div className="w-8 md:w-10 h-0.5 bg-[#f4f1ea]"></div>
                </div>
              </div>
            </div>
            <p className="text-stone-700 text-lg md:text-xl italic">
              "Revisando los volúmenes del archivo literario..."
            </p>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations && recommendations.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <p className="text-amber-900 font-bold tracking-[0.3em] uppercase text-[10px] mb-2 font-sans">
                Hallazgos de la búsqueda
              </p>
              <h3 className="text-2xl md:text-3xl font-black text-stone-900 flex items-center justify-center">
                <Sparkles className="w-6 h-6 md:w-7 md:h-7 mr-3 text-amber-800" />
                Recomendaciones
              </h3>
              <div className="h-1 w-16 md:w-20 bg-amber-800 mx-auto mt-3"></div>
            </div>

            <div className="space-y-8 md:space-y-10">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  onClick={() => rec.enBD && handleViewReview(rec.detalles.isbn || rec.detalles.id)}
                  className={`bg-[#f4f1ea] border border-stone-300 shadow-xl relative group hover:border-amber-800 transition-all duration-300 ${rec.enBD ? 'cursor-pointer' : ''}`}
                >
                  {/* Left accent bar */}
                  <div className="absolute top-0 left-0 w-1.5 md:w-2 h-full bg-stone-400 group-hover:bg-amber-900 transition-colors"></div>

                  {/* Badge Responsivo */}
                  <div className="absolute -top-3 right-4 md:right-6 flex items-center gap-1.5 bg-amber-900 text-[#f4f1ea] px-3 md:px-4 py-1 md:py-1.5 border-2 border-amber-950 shadow-lg z-10">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[8px] md:text-xs font-bold tracking-widest uppercase font-sans">
                      {rec.enBD ? 'En BookVerse' : 'Externo'}
                    </span>
                  </div>

                  <div className="p-6 md:p-8 pt-10">
                    {/* Book Image */}
                    {rec.detalles.imagen && (
                      <div className="w-full h-64 md:h-80 mb-6 md:mb-8 border border-stone-300 overflow-hidden bg-stone-200 shadow-inner">
                        <img
                          src={rec.detalles.imagen}
                          alt={rec.detalles.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Book Info */}
                    <div className="mb-6">
                      <h4 className="text-2xl md:text-3xl font-bold text-stone-900 leading-tight mb-3 group-hover:text-amber-900 transition-colors break-words">
                        {rec.detalles.titulo}
                      </h4>
                      
                      <div className="flex items-center text-stone-700 mb-4 italic text-base md:text-lg">
                        <User className="w-4 h-4 md:w-5 md:h-5 mr-2 text-amber-900 shrink-0" />
                        <span className="truncate">Escrito por <span className="font-bold text-stone-900 uppercase tracking-wider">{rec.detalles.autor}</span></span>
                      </div>

                      <div className="flex flex-wrap gap-2 md:gap-3 items-center">
                        {rec.detalles.genero && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 border text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${getGenreStyle(rec.detalles.genero)}`}>
                            <Sparkles className="w-2.5 h-2.5" />
                            {rec.detalles.genero}
                          </span>
                        )}
                        
                        {rec.detalles.anio && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 border border-stone-300 bg-stone-100 text-stone-700 text-[8px] md:text-[9px] font-bold uppercase tracking-widest">
                            <Calendar className="w-2.5 h-2.5" />
                            {rec.detalles.anio}
                          </span>
                        )}

                        {rec.enBD && rec.detalles.reviewCount && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 border border-amber-300 bg-amber-50 text-amber-900 text-[8px] md:text-[9px] font-bold uppercase tracking-widest">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            {rec.detalles.reviewCount} Críticas
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Book Description */}
                    <div className="bg-stone-100/70 border-l-4 border-amber-800 p-4 md:p-6 mb-6">
                      <h5 className="text-amber-900 font-bold text-xs md:text-sm uppercase tracking-widest mb-2 md:mb-3 font-sans">
                        ¿Por qué este libro?
                      </h5>
                      <p className="text-stone-800 leading-relaxed text-base md:text-lg italic">
                        "{rec.razon}"
                      </p>
                    </div>

                    {/* Reviews Preview (Solo si está en BD) */}
                    {rec.enBD && rec.reviews && rec.reviews.length > 0 && (
                      <div className="border-t border-stone-200 pt-6 mb-6">
                        <h5 className="text-amber-900 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4 font-sans flex items-center gap-2">
                          <Star className="w-3 h-3 md:w-4 md:h-4 fill-amber-400 text-amber-400" />
                          Fragmento de Crítica
                        </h5>
                        <div className="bg-white border-l-2 md:border-l-4 border-stone-300 p-4 md:p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 bg-amber-900 flex items-center justify-center">
                              <User className="w-3 h-3 md:w-4 md:h-4 text-[#f4f1ea]" />
                            </div>
                            <span className="font-bold text-stone-900 uppercase tracking-wider text-xs font-sans truncate">
                              {rec.reviews[0].user_name}
                            </span>
                          </div>
                          <p className="text-stone-700 leading-relaxed italic text-sm md:text-base pl-2 border-l border-stone-100">
                            "{rec.reviews[0].review_text.length > 150
                              ? rec.reviews[0].review_text.substring(0, 150) + '..."'
                              : rec.reviews[0].review_text + '"'
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 border-t border-stone-200 pt-6">
                      {rec.enBD ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewReview(rec.detalles.isbn || rec.detalles.id);
                          }}
                          className="flex-1 bg-amber-900 text-[#f4f1ea] py-3 md:py-4 px-4 md:px-6 font-bold tracking-wider uppercase hover:bg-black transition-all duration-300 border-2 border-amber-950 flex items-center justify-center gap-2 text-xs md:text-sm"
                        >
                          <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                          Ver Crónica Completa
                        </button>
                      ) : (
                        <div className="flex-1 bg-stone-200 text-stone-500 py-3 md:py-4 px-4 md:px-6 font-bold tracking-wider uppercase border-2 border-stone-300 cursor-not-allowed text-center text-xs md:text-sm">
                          No Disponible en el Archivo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mensaje de cierre */}
            <div className="mt-12 bg-[#f4f1ea] border-l-4 border-amber-900 p-6 shadow-md text-center">
              <p className="text-stone-800 text-base md:text-lg italic leading-relaxed">
                 Si te gustó la recomendación, no olvides dejar tu propia reseña en el archivo al terminar.
              </p>
            </div>

            {/* Search Again Button */}
            <button
              onClick={() => {
                setRecommendations(null);
                setDescription('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full mt-8 bg-transparent border-2 border-amber-900 text-amber-900 py-4 px-6 font-bold tracking-wider uppercase hover:bg-amber-900 hover:text-[#f4f1ea] transition-all duration-300 flex items-center justify-center gap-3 text-sm md:text-base"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              Nueva Consulta al Archivo
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FindBookPage;