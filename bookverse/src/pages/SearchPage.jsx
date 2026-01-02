import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Star, User, BookOpen, Filter, Calendar, Sparkles } from "lucide-react";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    rating: "",
    genre: "", 
    sort: "desc",
  });

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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // --- FUNCIÓN DE BÚSQUEDA MODIFICADA ---
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    // CAMBIO: Ahora permite buscar si hay texto O género O calificación
    if (!searchTerm.trim() && !filters.genre && !filters.rating) return;

    setIsSearching(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        q: searchTerm,
        rating: filters.rating,
        genre: filters.genre, 
        sort: filters.sort
      }).toString();

      const response = await fetch(`http://localhost:4000/reviews/search?${queryParams}`);
  
      if (!response.ok) throw new Error("Error al consultar el catálogo");

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError("No se pudieron cargar las crónicas del archivo");
    } finally {
      setIsSearching(false);
    }
  };

  // --- EFECTO MODIFICADO ---
  useEffect(() => {
    // Se dispara la búsqueda automática si hay CUALQUIER criterio activo
    if (searchTerm.trim() || filters.genre || filters.rating) {
      handleSearch();
    }
  }, [filters]); // Reacciona a cualquier cambio en el objeto de filtros

  return (
    <section className="py-24 bg-[#e9e4d5] min-h-screen font-serif">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
            <p className="text-amber-900 font-bold tracking-[0.3em] uppercase text-xs mb-2 font-sans">Archivo Literario</p>
            <h2 className="text-4xl font-black text-stone-900 flex items-center justify-center">
              <BookOpen className="w-8 h-8 mr-4 text-amber-800" />
              Explorar el Catálogo
            </h2>
            <div className="h-1 w-24 bg-amber-800 mx-auto mt-4"></div>
        </div>

        <div className="mb-16 shadow-xl border border-stone-400 overflow-hidden">
          <form onSubmit={handleSearch} className="flex bg-[#f4f1ea]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Busca por libro, reseña o autor..."
              className="w-full p-5 bg-transparent border-none focus:ring-0 text-lg italic text-stone-900 placeholder-stone-500"
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-amber-900 text-[#f4f1ea] px-10 hover:bg-black transition duration-300 border-l border-stone-400"
            >
              {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#f4f1ea] border-t-transparent"></div> : <Search className="w-6 h-6" />}
            </button>
          </form>

          <div className="bg-stone-200/50 p-3 flex flex-wrap gap-6 items-center px-5 border-t border-stone-300">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-900" />
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-600">Género IA:</span>
              <select 
                name="genre"
                value={filters.genre}
                onChange={handleFilterChange}
                className="bg-transparent text-sm focus:outline-none cursor-pointer border-b border-stone-400 italic"
              >
                <option value="">Cualquiera</option>
                <option value="Terror">Terror</option>
                <option value="Romance">Romance</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Fantasía">Fantasía</option>
                <option value="Ciencia Ficción">Ciencia Ficción</option>
                <option value="Híbrido">Híbrido (Mezclas)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-600">Calificación:</span>
              <select 
                name="rating"
                value={filters.rating}
                onChange={handleFilterChange}
                className="bg-transparent text-sm focus:outline-none cursor-pointer border-b border-stone-400 italic"
              >
                <option value="">Todas</option>
                <option value="5">5 Estrellas</option>
                <option value="4">4 Estrellas</option>
                <option value="3">3 Estrellas</option>
                <option value="2">2 Estrellas</option>
                <option value="1">1 Estrella</option>
              </select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Calendar className="w-4 h-4 text-amber-900" />
              <select 
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="bg-transparent text-sm focus:outline-none cursor-pointer border-b border-stone-400 italic"
              >
                <option value="desc">Recientes</option>
                <option value="asc">Antiguos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {!isSearching && searchResults.length > 0 && (
          <div className="space-y-10">
            {searchResults.map((review) => (
              <Link to={`/review/${review.id}`} key={review.id} className="block group">
                <div className="bg-[#f4f1ea] p-8 border border-stone-300 shadow-lg group-hover:border-amber-800 transition-all duration-300 relative">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-stone-400 group-hover:bg-amber-900 transition-colors"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-stone-900 leading-tight group-hover:text-amber-900 transition-colors">
                          {review.book_title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest mt-2 ${getGenreStyle(review.categoria_ia)}`}>
                           <Sparkles className="w-2.5 h-2.5" />
                           {review.categoria_ia || "General"}
                        </span>
                      </div>
                      <div className="flex items-center bg-amber-900 text-[#f4f1ea] px-3 py-1 border border-amber-950">
                          <Star className="w-4 h-4 mr-1 text-amber-400 fill-amber-400" />
                          <span className="font-bold">{review.rating}</span>
                      </div>
                  </div>

                  <div className="flex items-center text-sm text-stone-600 mb-6 italic">
                    <User className="w-4 h-4 mr-2 text-amber-900" />
                    <span>Crítica por <span className="text-stone-900 font-bold uppercase tracking-wider">{review.name}</span></span>
                  </div>

                  <p className="text-stone-800 mb-8 leading-relaxed text-lg border-l-4 border-stone-200 pl-6 italic line-clamp-3">
                    "{review.review_text}"
                  </p>

                  <div className="flex justify-between items-center text-[10px] text-stone-500 font-sans tracking-widest uppercase border-t border-stone-200 pt-4">
                    <span>Publicado el {new Date(review.created_at).toLocaleDateString("es-MX", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="font-bold text-amber-900 opacity-0 group-hover:opacity-100 transition-opacity">Leer crónica completa →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Mensaje si no hay resultados corregido */}
        {!isSearching && (searchTerm || filters.genre || filters.rating) && searchResults.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-stone-300">
             <p className="text-stone-500 italic text-xl">"No se han hallado crónicas con esos criterios en el archivo..."</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchPage;