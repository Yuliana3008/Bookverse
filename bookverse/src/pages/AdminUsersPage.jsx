import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  ArrowLeft,
  Search,
  Ban,
  Unlock,
} from "lucide-react";
import Swal from "sweetalert2";
import API_URL from "../config";

/* =========================================================
   🛡️ ADMIN – GESTIÓN DE USUARIOS
========================================================= */
const AdminUsersPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

    const result = await Swal.fire({
      title: "¿Cambiar rol?",
      text: `El usuario pasará a ser ${newRole.toUpperCase()}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `${API_URL}/api/admin/users/${userId}/role`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, rol: newRole } : u
        )
      );

      Swal.fire({
        icon: "success",
        title: "Rol actualizado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error cambiando rol",
      });
    }
  };

  /* =========================================================
     🚫 Bloquear / Desbloquear usuario (BONITO ✨)
  ========================================================= */
  const toggleStatus = async (userId, activo, name) => {
    const result = await Swal.fire({
      title: activo ? "¿Bloquear usuario?" : "¿Desbloquear usuario?",
      text: activo
        ? `El usuario "${name}" no podrá iniciar sesión.`
        : `El usuario "${name}" podrá volver a iniciar sesión.`,
      icon: activo ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: activo ? "#b91c1c" : "#15803d",
      cancelButtonColor: "#6b7280",
      confirmButtonText: activo ? "Sí, bloquear" : "Sí, desbloquear",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `${API_URL}/api/admin/users/${userId}/status`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ activo: !activo }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, activo: !activo } : u
        )
      );

      Swal.fire({
        icon: "success",
        title: activo
          ? "Usuario bloqueado"
          : "Usuario desbloqueado",
        text: `"${name}" fue actualizado correctamente.`,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error cambiando estado del usuario",
      });
    }
  };

  /* =========================================================
     🔍 Filtro de búsqueda
  ========================================================= */
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  /* =========================================================
     📊 Resumen rápido
  ========================================================= */
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.rol === "admin").length;
  const totalLectores = users.filter((u) => u.rol === "lector").length;
  const totalBloqueados = users.filter((u) => !u.activo).length;

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

      {/* 📊 Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Stat label="Usuarios" value={totalUsers} />
        <Stat label="Admins" value={totalAdmins} />
        <Stat label="Lectores" value={totalLectores} />
        <Stat label="Bloqueados" value={totalBloqueados} color="text-red-700" />
      </div>

      {/* 🔍 Buscador */}
      <div className="mb-4 flex items-center gap-2 bg-white border px-3 py-2 shadow w-full sm:w-1/2">
        <Search className="w-4 h-4 text-stone-500" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-sm"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white border border-stone-200 shadow-lg">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-stone-700 uppercase tracking-wider">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Rol</th>
              <th className="p-3 text-center">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u.id}
                className={`border-t border-stone-200 hover:bg-stone-50 ${
                  !u.activo && "opacity-50"
                }`}
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
                  <span
                    className={`text-xs font-bold ${
                      u.activo ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {u.activo ? "ACTIVO" : "BLOQUEADO"}
                  </span>
                </td>

                <td className="p-3 flex justify-center gap-3">
                  <button
                    onClick={() => toggleRole(u.id, u.rol)}
                    disabled={!u.activo}
                    className="text-amber-700 hover:text-amber-900 disabled:opacity-30"
                    title="Cambiar rol"
                  >
                    <Shield className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      toggleStatus(u.id, u.activo, u.name)
                    }
                    className={
                      u.activo ? "text-red-600" : "text-green-700"
                    }
                    title={
                      u.activo
                        ? "Bloquear usuario"
                        : "Desbloquear usuario"
                    }
                  >
                    {u.activo ? (
                      <Ban className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-stone-500 italic">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================
   📦 Componente Stat
========================================================= */
const Stat = ({ label, value, color = "text-stone-800" }) => (
  <div className="bg-white border shadow p-4 text-center">
    <p className="text-sm text-stone-500">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default AdminUsersPage;
