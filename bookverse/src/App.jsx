/*import { Routes, Route } from "react-router-dom"; 
import BookVerseLayout from "./pages/login.jsx"; 
import HomePage from "./pages/HomePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ReviewsPage from "./pages/ReviewsPage.jsx";
import AddReviewPage from "./pages/AddReviewPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ReviewDetailPage from "./pages/ReviewDetailPage.jsx"; 
import MyReviewsPage from "./pages/MyReviewsPage.jsx";
import EditProfilePage from "./pages/EditProfilePage.jsx";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <Routes>
      <Route path="/" element={<BookVerseLayout />}>
          <Route index element={<HomePage />} /> 
          <Route path="dashboard" element={<DashboardPage />} />  
          <Route path="add-review" element={<AddReviewPage />} />  
          <Route path="buscar" element={<SearchPage />} />
          <Route path="reseñas-recientes" element={<ReviewsPage />} />
          <Route path="review/:id" element={<ReviewDetailPage />} />
          <Route path="mis-resenas/:userId" element={<MyReviewsPage />} />
          <Route path="editar-perfil" element={<EditProfilePage />} />
      
      </Route>
    </Routes>
  );
}

export default App;*/

import { Routes, Route } from "react-router-dom"; 

import BookVerseLayout from "./pages/login.jsx"; 
import HomePage from "./pages/HomePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ReviewsPage from "./pages/ReviewsPage.jsx";
import AddReviewPage from "./pages/AddReviewPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ReviewDetailPage from "./pages/ReviewDetailPage.jsx"; 
import MyReviewsPage from "./pages/MyReviewsPage.jsx";
import EditProfilePage from "./pages/EditProfilePage.jsx";
// Importamos el componente que maneja el scroll
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <>
      {/* 1. Insertamos ScrollToTop aquí para que actúe en cada cambio de ruta */}
      <ScrollToTop />
      
      <Routes>
        <Route path="/" element={<BookVerseLayout />}>
            <Route index element={<HomePage />} /> 
            <Route path="dashboard" element={<DashboardPage />} />  
            <Route path="add-review" element={<AddReviewPage />} />  
            <Route path="buscar" element={<SearchPage />} />
            <Route path="reseñas-recientes" element={<ReviewsPage />} />

            {/* 2. RUTA CLAVE PARA EL DETALLE */}
            <Route path="review/:id" element={<ReviewDetailPage />} />
            <Route path="mis-resenas/:userId" element={<MyReviewsPage />} />
            <Route path="editar-perfil" element={<EditProfilePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;