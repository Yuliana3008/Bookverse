// src/pages/DashboardPage.jsx
import React from 'react';
import { Search, Edit3 } from 'lucide-react';

// --- Componente Mis Reseñas (Mover aquí) ---
const MyReviewsSection = ({ userId }) => (
    <section id="mis-reseñas" className="py-20 bg-gray-100 min-h-[50vh]">
        {/* ... JSX de Mis Reseñas ... */}
    </section>
);

// --- Componente Buscar Libros (Mover aquí) ---
const SearchSection = () => (
    <section id="buscar" className="py-20 bg-white min-h-[50vh]">
        {/* ... JSX de Buscar Libros ... */}
    </section>
);

// 🛑 Componente de Página Dashboard 🛑
const DashboardPage = ({ userId }) => {
    return (
        <>
            <MyReviewsSection userId={userId} />
            <SearchSection />
        </>
    );
};

export default DashboardPage;