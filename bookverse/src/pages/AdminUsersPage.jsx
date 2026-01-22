import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  ArrowLeft,
} from "lucide-react";
import API_URL from "../config";

/* =========================================================
   🛡️ ADMIN – GESTIÓN DE USUARIOS
========================================================= */
const AdminUsersPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     📥 Cargar usuarios (ADMIN)
  ========================================================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/users`, {
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cargar usuarios");

        setUsers(data);
      } catch (err) {
        console.error(err);
        alert("No se pudieron cargar los usuarios");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /* =========================================================
     🔄 Cambiar rol
  ========================================================= */
  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "lector" : "admin";

    if (!window.confirm(`¿Cambiar rol a ${newRole.toUpperCase()}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, rol: newRole } : u
        )
      );
    } catch (err) {
      alert(err.message || "Error cambiando rol");
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center font-serif italic">
        Cargando usuarios…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] p-6 sm:p-10 font-serif">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center text-amber-800 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </button>
      </div>

      <h1 className="text-3xl font-extrabold text-stone-800 flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-blue-700" />
        Gestión de Usuarios
      </h1>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white border border-stone-200 shadow-lg">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-stone-700 uppercase tracking-wider">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Rol</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-stone-200 hover:bg-stone-50"
              >
                <td className="p-3 font-bold">{u.name}</td>
                <td className="p-3">{u.email}</td>

                <td className="p-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      u.rol === "admin"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {u.rol.toUpperCase()}
                  </span>
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleRole(u.id, u.rol)}
                    className="text-amber-700 hover:text-amber-900"
                    title="Cambiar rol"
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
