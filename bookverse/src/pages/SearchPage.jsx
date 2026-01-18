import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Star, User, BookOpen, Filter, Calendar, Sparkles } from "lucide-react";
import API_URL from '../config';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
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

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
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

      const response = await fetch(`${API_URL}/api/reviews/search?${queryParams}`);
      if (!response.ok) throw new Error("Error al consultar el catálogo");

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError("No se pudieron cargar las crónicas del archivo");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam) {
      setSearchTerm(qParam);
      setTimeout(() => {
        handleSearch();
      }, 100);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchTerm.trim() || filters.genre || filters.rating) {
      handleSearch();
    }
  }, [filters]);

  return (
    <section className="py-12 md:py-24 bg-[#e9e4d5] min-h-screen font-serif">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="text-center mb-8 md:mb-12">
            <p className="text-amber-900 font-bold tracking-[0.3em] uppercase text-[10px] mb-2 font-sans">Archivo Literario</p>
            <h2 className="text-2xl md:text-4xl font-black text-stone-900 flex items-center justify-center">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 mr-3 md:mr-4 text-amber-800 shrink-0" />
              Explorar Catálogo
            </h2>
            <div className="h-1 w-20 bg-amber-800 mx-auto mt-4"></div>
        </div>

        <div className="mb-10 md:mb-16 shadow-xl border border-stone-400 overflow-hidden">
          <form onSubmit={handleSearch} className="flex bg-[#f4f1ea]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Busca libro o autor..."
              className="w-full p-4 md:p-5 bg-transparent border-none focus:ring-0 text-base md:text-lg italic text-stone-900 placeholder-stone-500"
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-amber-900 text-[#f4f1ea] px-6 md:px-10 hover:bg-black transition duration-300 border-l border-stone-400 shrink-0"
            >
              {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#f4f1ea] border-t-transparent"></div> : <Search className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
          </form>

          {/* BARRA DE FILTROS RESPONSIVA: Cambia a columna en móvil */}
          <div className="bg-stone-200/50 p-4 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center px-5 border-t border-stone-300">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-amber-900 shrink-0" />
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-600">Género:</span>
              <select 
                name="genre"
                value={filters.genre}
                onChange={handleFilterChange}
                className="bg-transparent text-sm focus:outline-none cursor-pointer border-b border-stone-400 italic flex-grow sm:flex-grow-0"
              >
                <option value="">Cualquiera</option>
                <option value="Terror">Terror</option>
                <option value="Romance">Romance</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Fantasía">Fantasía</option>
                <option value="Ciencia Ficción">Ciencia Ficción</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-600">Nota:</span>
              <select 
                name="rating"
                value={filters.rating}
                onChange={handleFilterChange}
                className="bg-transparent text-sm focus:outline-none cursor-pointer border-b border-stone-400 italic flex-grow sm:flex-grow-0"
              >
                <option value="">Todas</option>
                <option value="5">5 Estrellas</option>
                <option value="4">4 Estrellas</option>
                <option value="3">3 Estrellas</option>
                <option value="2">2 Estrellas</option>
                <option value="1">1 Estrella</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <Calendar className="w-4 h-4 text-amber-900 shrink-0" />
              <select 
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="bg-transparent text-sm focus:outline-none cursor-pointer border-b border-stone-400 italic flex-grow sm:flex-grow-0"
              >
                <option value="desc">Recientes</option>
                <option value="asc">Antiguos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {!isSearching && searchResults.length > 0 && (
          <div className="space-y-6 md:space-y-10">
            {searchResults.map((review) => (
              <Link to={`/review/${review.id}`} key={review.id} className="block group">
                <div className="bg-[#f4f1ea] p-5 md:p-8 border border-stone-300 shadow-lg group-hover:border-amber-800 transition-all duration-300 relative">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-stone-400 group-hover:bg-amber-900 transition-colors"></div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div className="min-w-0 w-full">
                        <h3 className="text-xl md:text-2xl font-bold text-stone-900 leading-tight group-hover:text-amber-900 transition-colors break-words">
                          {review.book_title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest mt-2 ${getGenreStyle(review.categoria_ia)}`}>
                            <Sparkles className="w-2.5 h-2.5" />
                            {review.categoria_ia || "General"}
                        </span>
                      </div>
                      <div className="flex items-center bg-amber-900 text-[#f4f1ea] px-3 py-1 border border-amber-950 shrink-0 self-start sm:self-auto">
                          <Star className="w-3.5 h-3.5 mr-1 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-sm">{review.rating}</span>
                      </div>
                  </div>

                  <div className="flex items-center text-xs md:text-sm text-stone-600 mb-6 italic">
                    <User className="w-4 h-4 mr-2 text-amber-900 shrink-0" />
                    <span className="truncate">Crítica por <span className="text-stone-900 font-bold uppercase tracking-wider">{review.name}</span></span>
                  </div>

                  <p className="text-stone-800 mb-6 md:mb-8 leading-relaxed text-base md:text-lg border-l-4 border-stone-200 pl-4 md:pl-6 italic line-clamp-3">
                    "{review.review_text}"
                  </p>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] text-stone-500 font-sans tracking-widest uppercase border-t border-stone-200 pt-4 gap-2">
                    <span>Publicado el {new Date(review.created_at).toLocaleDateString("es-MX", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="font-bold text-amber-900 sm:opacity-0 group-hover:opacity-100 transition-opacity">Leer crónica completa →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Mensaje si no hay resultados */}
        {!isSearching && (searchTerm || filters.genre || filters.rating) && searchResults.length === 0 && (
          <div className="text-center py-12 md:py-20 border-2 border-dashed border-stone-300 px-4">
              <p className="text-stone-500 italic text-lg md:text-xl">"No se han hallado crónicas con esos criterios en el archivo..."</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchPage;