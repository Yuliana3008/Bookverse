// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, BookOpen, Star, Grid } from 'lucide-react';
// Asumimos que ReviewsPage.jsx exporta el componente ReviewCard (que creamos antes)
// Si no lo exporta, copia el ReviewCard en este archivo.
import { ReviewCard } from './ReviewsPage'; 

// Datos de ejemplo para el perfil
const userProfileData = {
    bio: "Apasionado por la fantasía épica y los clásicos de la ciencia ficción.",
    joinedDate: "Enero 2024",
};

// Datos de reseñas (Simulamos filtrar las reseñas por el userId)
const sampleUserReviews = [
    { id: 101, user: "yo", bookTitle: "El Misterio del Libro Olvidado", rating: 5, text: "La mejor novela de thriller que he leído en años. Totalmente atrapante.", date: "15 de Octubre, 2025", comments: 12 },
    { id: 102, user: "yo", bookTitle: "El Jardín del Silencio", rating: 4, text: "Una lectura conmovedora, aunque el final fue un poco abrupto.", date: "2 de Noviembre, 2025", comments: 5 },
];


// --- Componente Mis Reseñas (Sección Específica) ---
const MyReviewsSection = ({ userId, userName }) => {
    // En una aplicación real, aquí harías fetch(`/api/user/${userId}/reviews`)
    
    return (
        <section id="mis-reseñas" className="mt-10 pt-10 border-t border-gray-200">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Grid className="w-6 h-6 mr-3 text-indigo-600" /> Mis Reseñas Publicadas
            </h3>
            
            {sampleUserReviews.length > 0 ? (
                <div className="space-y-6">
                    {sampleUserReviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            ) : (
                <div className="p-6 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
                    Aún no has publicado ninguna reseña. ¡Empieza a compartir tu opinión!
                </div>
            )}
        </section>
    );
};


// --- Componente Principal de la Página de Perfil ---
const ProfilePage = () => {
    const { isAuthenticated, userName, userId, handleLogout } = useOutletContext();

    if (!isAuthenticated) {
        // Redirección o mensaje de acceso denegado (similar a AddReviewPage)
        return <div className="p-20 text-center">Debes iniciar sesión para ver tu perfil.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Cabecera del Perfil */}
                <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600 mb-10">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center">
                        <User className="w-8 h-8 mr-3 text-indigo-600" /> Perfil de {userName}
                    </h2>
                    <p className="text-gray-600 text-lg mb-4">{userProfileData.bio}</p>
                    <p className="text-sm text-gray-500">Miembro desde: {userProfileData.joinedDate}</p>
                    
                    <button 
                        onClick={handleLogout}
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
                    >
                        Cerrar Sesión
                    </button>
                </div>

                {/* Sección de Reseñas del Usuario */}
                <MyReviewsSection userId={userId} userName={userName} />

            </div>
        </div>
    );
};

export default ProfilePage;