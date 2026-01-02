/*import { Routes, Route } from "react-router-dom"; // Quitar BrowserRouter de aquí

import BookVerseLayout from "./pages/login.jsx"; 
import DashboardPage from "@pages/DashboardPage.jsx";
import AddReviewPage from "@pages/AddReviewPage.jsx";
import ReviewsPage from "@pages/ReviewsPage.jsx";


function App() {
  return (
    <Routes>
     
      <Route path="/" element={<BookVerseLayout />} />
      <Route path="/BookVerseLayout" element={<BookVerseLayout />} />
      <Route path="/DashboardPage" element={<DashboardPage />} />
      <Route path="/ReviewsPage" element={<ReviewsPage />} />
      <Route 
                path="add-review" 
                element={<AddReviewPage />} 
            />
    </Routes>
  );
}

export default App;

// <Route path="*" element={<BookVerseLayout />} />*/

// src/App.jsx

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

function App() {
  return (
    <Routes>
      <Route path="/" element={<BookVerseLayout />}>
          <Route index element={<HomePage />} /> 
          <Route path="dashboard" element={<DashboardPage />} />  
          <Route path="add-review" element={<AddReviewPage />} />  
          <Route path="buscar" element={<SearchPage />} />
          <Route path="reseñas-recientes" element={<ReviewsPage />} />

          {/* 2. AGREGA ESTA RUTA CLAVE PARA EL DETALLE */}
          {/* El :id es un parámetro dinámico que recibirá el número de la reseña */}
          <Route path="review/:id" element={<ReviewDetailPage />} />
          <Route path="mis-resenas/:userId" element={<MyReviewsPage />} />
          <Route path="editar-perfil" element={<EditProfilePage />} />
      
      </Route>
    </Routes>
  );
}

export default App;