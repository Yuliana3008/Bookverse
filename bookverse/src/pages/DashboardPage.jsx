import React from 'react';
import { Search, Edit3 } from 'lucide-react';


const MyReviewsSection = ({ userId }) => (
    <section id="mis-reseñas" className="py-20 bg-gray-100 min-h-[50vh]">
        {/* ... JSX de Mis Reseñas ... */}
    </section>
);


const SearchSection = () => (
    <section id="buscar" className="py-20 bg-white min-h-[50vh]">
      
    </section>
);


const DashboardPage = ({ userId }) => {
    return (
        <>
            <MyReviewsSection userId={userId} />
            <SearchSection />
        </>
    );
};

export default DashboardPage;