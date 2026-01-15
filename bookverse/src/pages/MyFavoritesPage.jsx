import React, { useEffect, useState } from "react";
import { Heart, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

const MyFavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        // 1) Validar sesión real (cookie)
        const meRes = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!meRes.ok) {
          // No hay sesión
          navigate("/");
          return;
        }

        // 2) Pedir favoritos del usuario logueado
        const favRes = await fetch(`${API_URL}/api/reviews/favorites/me`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!favRes.ok) {
          console.error("No se pudieron cargar favoritos:", favRes.status);
          setFavorites([]);
          return;
        }

        const data = await favRes.json();
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
      <div className="p-20 text-center font-serif text-amber-900">
        Consultando tu archivo personal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e9e4d5] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10 border-b border-stone-400 pb-4">
          <Heart className="w-8 h-8 text-rose-600 fill-rose-600" />
          <h1 className="text-4xl font-serif font-black text-stone-900">
            Mis reseñas favoritas
          </h1>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-[#f4f1ea] border-2 border-dashed border-stone-400 p-20 text-center">
            <BookOpen className="w-12 h-12 text-stone-400 mx-auto mb-4" />
            <p className="font-serif italic text-stone-600 text-xl">
              Aún no has guardado ninguna crónica en tu archivo secreto.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((review) => (
              <div
                key={review.id}
                onClick={() => navigate(`/review/${review.id}`)}
                className="bg-[#f4f1ea] border border-stone-400 shadow-md hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={
                      review.image_url?.startsWith("http")
                        ? review.image_url
                        : review.image_url
                        ? `${API_URL}${review.image_url}`
                        : "https://via.placeholder.com/600x800?text=Sin+Portada"
                    }
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={review.book_title}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/600x800?text=Sin+Portada";
                    }}
                  />
                </div>

                <div className="p-6">
                  <h3 className="font-serif font-bold text-xl text-stone-900 mb-2">
                    {review.book_title}
                  </h3>
                  <p className="text-stone-600 text-sm italic mb-4">
                    de {review.author}
                  </p>
                  <div className="flex justify-between items-center border-t border-stone-200 pt-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-900">
                      Ver Crónica
                    </span>
                    <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFavoritesPage;
