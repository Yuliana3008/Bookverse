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
import FindBookPage from "./pages/FindBookPage.jsx";
import MyFavoritesPage from "./pages/MyFavoritesPage.jsx";

// 🔐 ADMIN
import AdminRoute from "./components/AdminRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Forbidden from "./pages/Forbidden.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
// Utilidades
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* 🌍 Layout principal */}
        <Route path="/" element={<BookVerseLayout />}>
          {/* Públicas */}
          <Route index element={<HomePage />} />

          {/* Autenticadas */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="add-review" element={<AddReviewPage />} />
          <Route path="buscar" element={<SearchPage />} />
          <Route path="reseñas-recientes" element={<ReviewsPage />} />
          <Route path="review/:id" element={<ReviewDetailPage />} />
          <Route path="mis-resenas/:userId" element={<MyReviewsPage />} />
          <Route path="editar-perfil" element={<EditProfilePage />} />
          <Route path="encuentra-tu-libro" element={<FindBookPage />} />
          <Route path="mis-favoritos" element={<MyFavoritesPage />} />

          {/* 🔐 SOLO ADMIN */}
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminDashboard />} />
  <Route path="admin/usuarios" element={<AdminUsersPage />} />
          </Route>

          {/* 🚫 ACCESO DENEGADO */}
          <Route path="403" element={<Forbidden />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
