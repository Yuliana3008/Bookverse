import { Link } from "react-router-dom";
import { Shield, Users, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import API_URL from "../config";

const COLORS = ["#15803d", "#b91c1c"]; 

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/users`, {
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setUsers(data);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const activos = users.filter((u) => u.activo).length;
  const bloqueados = totalUsers - activos;

  const porcentajeActivos =
    totalUsers > 0 ? Math.round((activos / totalUsers) * 100) : 0;

  const pieData = [
    { name: "Activos", value: activos },
    { name: "Bloqueados", value: bloqueados },
  ];

  return (
    <div className="min-h-screen bg-[#f4f1ea] p-6 sm:p-10 font-serif">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-800 flex items-center gap-3">
          <Shield className="w-8 h-8 text-amber-700" />
          Panel de Administración
        </h1>
        <p className="mt-2 text-stone-600 italic">
          Bienvenido al panel de administración de MyBookCompass.
        </p>
      </div>

      {/* 🧭 Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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

      {/*  ESTADO GENERAL */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-stone-800 mb-2">
          Estado general de la comunidad
        </h3>
        <p className="text-stone-600 italic">
          Visión rápida del estado actual de los usuarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/*  Gráfica usuarios */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-stone-200">
          <h4 className="text-lg font-bold text-stone-800 mb-4">
            Usuarios activos vs bloqueados
          </h4>

          {loadingStats ? (
            <p className="italic text-stone-500">
              Cargando estadísticas…
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {!loadingStats && (
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-700 rounded-full"></span>
                Activos ({activos})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-700 rounded-full"></span>
                Bloqueados ({bloqueados})
              </div>
            </div>
          )}
        </div>

        {/* Indicador de usuarios activos */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-stone-200 flex flex-col justify-center">
          <h4 className="text-lg font-bold text-stone-800 mb-2">
            Usuarios activos
          </h4>

          <p className="text-stone-600 mb-4">
            Porcentaje de usuarios habilitados actualmente
          </p>

          {loadingStats ? (
            <p className="italic text-stone-500">
              Calculando indicador…
            </p>
          ) : (
            <>
              <div className="text-4xl font-extrabold text-green-700 mb-4">
                {porcentajeActivos}%
              </div>

              <div className="w-full bg-stone-200 rounded-full h-3">
                <div
                  className="bg-green-700 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${porcentajeActivos}%` }}
                ></div>
              </div>

              <p className="text-xs text-stone-500 mt-3 italic">
                {activos} de {totalUsers} usuarios activos
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
