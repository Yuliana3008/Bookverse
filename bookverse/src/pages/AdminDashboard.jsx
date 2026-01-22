import { Link } from "react-router-dom";
import { Shield, Users, BookOpen } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-[#f4f1ea] p-6 sm:p-10 font-serif">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-800 flex items-center gap-3">
          <Shield className="w-8 h-8 text-amber-700" />
          Panel de Administración
        </h1>
        <p className="mt-2 text-stone-600 italic">
          Bienvenido al panel de administración de BookVerse.
        </p>
      </div>

      {/* Grid de acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Moderar reseñas */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-stone-200 hover:shadow-lg transition">
          <BookOpen className="w-8 h-8 text-amber-700 mb-4" />
          <h2 className="text-xl font-bold text-stone-800 mb-2">
            Moderar Reseñas
          </h2>
          <p className="text-stone-600 mb-4">
            Ver, editar o eliminar cualquier reseña publicada.
          </p>
          <Link
            to="/reseñas-recientes"
            className="inline-flex items-center gap-2 text-amber-700 font-semibold hover:text-amber-800"
          >
            Ir a reseñas →
          </Link>
        </div>

        {/* Gestionar usuarios */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-stone-200 hover:shadow-lg transition">
          <Users className="w-8 h-8 text-blue-600 mb-4" />
          <h2 className="text-xl font-bold text-stone-800 mb-2">
            Gestionar Usuarios
          </h2>
          <p className="text-stone-600 mb-4">
            Ver usuarios registrados y administrar sus permisos.
          </p>
          <Link
            to="/admin/usuarios"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800"
          >
            Administrar usuarios →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
