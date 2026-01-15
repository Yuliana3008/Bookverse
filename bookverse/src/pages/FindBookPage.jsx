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

  // MODIFICACIÓN: Ahora recibe el ID/ISBN y redirige a la ruta de detalle
  const handleViewReview = (id) => {
    if (id) {
      navigate(`/review/${id}`);
    }
  };

  return (
    <section className="py-24 bg-[#e9e4d5] min-h-screen font-serif">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-amber-900 font-bold tracking-[0.3em] uppercase text-xs mb-2 font-sans">
            Consulta Personalizada
          </p>
          <h2 className="text-4xl font-black text-stone-900 flex items-center justify-center">
            <Wand2 className="w-8 h-8 mr-4 text-amber-800" />
            Encuentra tu Libro Ideal
          </h2>
          <div className="h-1 w-24 bg-amber-800 mx-auto mt-4"></div>
          <p className="text-stone-700 text-lg mt-6 italic max-w-2xl mx-auto">
            Describe tus preferencias literarias y nuestra inteligencia artificial consultará el archivo para recomendarte obras parecidas
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-16">
          <div className="bg-[#f4f1ea] p-8 border border-stone-400 shadow-xl">
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
              placeholder="Por ejemplo: Busco una novela gótica ambientada en el siglo XIX, con atmósferas sombrías y misterios sin resolver. Me fascinan los autores como Edgar Allan Poe y las historias que exploran la mente humana..."
              rows="8"
              disabled={loading}
              className="w-full p-5 bg-transparent border-2 border-stone-300 focus:border-amber-800 focus:ring-0 text-lg italic text-stone-900 placeholder-stone-500 resize-y transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <p className="mt-3 text-sm text-stone-600 italic flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-900 flex-shrink-0 mt-0.5" />
              <span>
                Sé específico: menciona géneros, épocas, temas, autores admirados, o emociones que deseas experimentar
              </span>
            </p>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border-2 border-red-300 text-red-900 p-5 italic text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-amber-900 text-[#f4f1ea] py-5 px-8 text-lg font-bold tracking-wider uppercase hover:bg-black transition-all duration-300 border-2 border-amber-950 shadow-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-amber-900"
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
          <div className="bg-[#f4f1ea] border border-stone-400 shadow-xl p-16 text-center">
            <div className="mb-8">
              <div className="w-16 h-20 bg-amber-900 border-2 border-amber-950 mx-auto relative animate-pulse">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 space-y-2">
                  <div className="w-10 h-0.5 bg-[#f4f1ea]"></div>
                  <div className="w-10 h-0.5 bg-[#f4f1ea]"></div>
                  <div className="w-10 h-0.5 bg-[#f4f1ea]"></div>
                </div>
              </div>
            </div>
            <p className="text-stone-700 text-xl italic">
              "Revisando los volúmenes del archivo literario..."
            </p>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations && recommendations.length > 0 && (
          <div>
            <div className="text-center mb-10">
              <p className="text-amber-900 font-bold tracking-[0.3em] uppercase text-xs mb-2 font-sans">
                Hallazgos de la búsqueda
              </p>
              <h3 className="text-3xl font-black text-stone-900 flex items-center justify-center">
                <Sparkles className="w-7 h-7 mr-3 text-amber-800" />
                Recomendaciones
              </h3>
              <div className="h-1 w-20 bg-amber-800 mx-auto mt-3"></div>
            </div>

            <div className="space-y-10">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  // MODIFICACIÓN: Toda la tarjeta es clickeable si está en BD
                  onClick={() => rec.enBD && handleViewReview(rec.detalles.isbn || rec.detalles.id)}
                  className={`bg-[#f4f1ea] border border-stone-300 shadow-xl relative group hover:border-amber-800 transition-all duration-300 ${rec.enBD ? 'cursor-pointer' : ''}`}
                >
                  {/* Left accent bar */}
                  <div className="absolute top-0 left-0 w-2 h-full bg-stone-400 group-hover:bg-amber-900 transition-colors"></div>

                  {/* Badge */}
                  <div className="absolute -top-3 right-6 flex items-center gap-1.5 bg-amber-900 text-[#f4f1ea] px-4 py-1.5 border-2 border-amber-950 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold tracking-widest uppercase font-sans">
                      {rec.enBD ? 'Disponible en BookVerse' : 'Recomendación Externa'}
                    </span>
                  </div>

                  <div className="p-8 pt-10">
                    {/* Book Image */}
                    {rec.detalles.imagen && (
                      <div className="w-full h-80 mb-8 border-2 border-stone-300 overflow-hidden bg-stone-200 shadow-inner">
                        <img
                          src={rec.detalles.imagen}
                          alt={rec.detalles.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Book Info */}
                    <div className="mb-6">
                      <h4 className="text-3xl font-bold text-stone-900 leading-tight mb-3 group-hover:text-amber-900 transition-colors">
                        {rec.detalles.titulo}
                      </h4>
                      
                      <div className="flex items-center text-stone-700 mb-3 italic text-lg">
                        <User className="w-5 h-5 mr-2 text-amber-900" />
                        <span>Escrito por <span className="font-bold text-stone-900 uppercase tracking-wider">{rec.detalles.autor}</span></span>
                      </div>

                      <div className="flex flex-wrap gap-3 items-center">
                        {rec.detalles.genero && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 border text-[9px] font-bold uppercase tracking-widest ${getGenreStyle(rec.detalles.genero)}`}>
                            <Sparkles className="w-2.5 h-2.5" />
                            {rec.detalles.genero}
                          </span>
                        )}
                        
                        {rec.detalles.anio && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 border border-stone-300 bg-stone-100 text-stone-700 text-[9px] font-bold uppercase tracking-widest">
                            <Calendar className="w-2.5 h-2.5" />
                            {rec.detalles.anio}
                          </span>
                        )}

                        {rec.enBD && rec.detalles.reviewCount && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 border border-amber-300 bg-amber-50 text-amber-900 text-[9px] font-bold uppercase tracking-widest">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            {rec.detalles.reviewCount} {rec.detalles.reviewCount === 1 ? 'Reseña' : 'Reseñas'}
                          </span>
                        )}
                      </div>

                      {rec.detalles.isbn && (
                        <p className="text-xs text-stone-500 mt-3 font-sans tracking-wider">
                          ISBN: {rec.detalles.isbn}
                        </p>
                      )}
                    </div>

                    {/* Book Description */}
                    <div className="bg-stone-100/50 border-l-4 border-amber-800 p-6 mb-6">
                      <h5 className="text-amber-900 font-bold text-sm uppercase tracking-widest mb-3 font-sans">
                        ¿Por qué este libro?
                      </h5>
                      <p className="text-stone-800 leading-relaxed text-lg italic">
                        "{rec.razon}"
                      </p>
                    </div>

                    {/* Reviews Preview */}
                    {rec.enBD && rec.reviews && rec.reviews.length > 0 && (
                      <div className="border-t-2 border-stone-200 pt-6 mb-6">
                        <h5 className="text-amber-900 font-bold text-sm uppercase tracking-widest mb-4 font-sans flex items-center gap-2">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          Fragmento de Crítica
                        </h5>
                        <div className="bg-white border-l-4 border-stone-300 p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-amber-900 border border-amber-950 flex items-center justify-center">
                              <User className="w-4 h-4 text-[#f4f1ea]" />
                            </div>
                            <span className="font-bold text-stone-900 uppercase tracking-wider text-sm font-sans">
                              {rec.reviews[0].user_name}
                            </span>
                          </div>
                          <div className="flex items-center mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rec.reviews[0].rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-stone-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-stone-700 leading-relaxed italic border-l-2 border-stone-200 pl-4">
                            "{rec.reviews[0].review_text.length > 180
                              ? rec.reviews[0].review_text.substring(0, 180) + '..."'
                              : rec.reviews[0].review_text + '"'
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 border-t-2 border-stone-200 pt-6">
                      {rec.enBD ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewReview(rec.detalles.isbn || rec.detalles.id);
                          }}
                          className="flex-1 bg-amber-900 text-[#f4f1ea] py-4 px-6 font-bold tracking-wider uppercase hover:bg-black transition-all duration-300 border-2 border-amber-950 flex items-center justify-center gap-2"
                        >
                          <BookOpen className="w-5 h-5" />
                          Ver Detalles Completos
                        </button>
                      ) : (
                        <div className="flex-1 bg-stone-300 text-stone-500 py-4 px-6 font-bold tracking-wider uppercase border-2 border-stone-400 cursor-not-allowed text-center">
                          No Disponible en el Archivo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ NUEVO: Mensaje debajo de las recomendaciones */}
            <div className="mt-14 bg-[#f4f1ea] border-l-4 border-amber-900 p-6 shadow-md">
              <p className="text-stone-800 text-lg italic leading-relaxed text-center">
                 Si te gustó el libro recomendado, cuando lo termines de leer no olvides dejar tu reseña.
              </p>
              <p className="text-stone-600 text-sm italic mt-3 text-center">
                Tu experiencia ayuda a otros lectores a descubrir nuevas historias 
              </p>
            </div>

            {/* Search Again Button */}
            <button
              onClick={() => {
                setRecommendations(null);
                setDescription('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full mt-10 bg-transparent border-2 border-amber-900 text-amber-900 py-4 px-6 font-bold tracking-wider uppercase hover:bg-amber-900 hover:text-[#f4f1ea] transition-all duration-300 flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-5 h-5" />
              Nueva Consulta al Archivo
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FindBookPage;
