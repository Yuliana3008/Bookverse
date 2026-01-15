import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { User, Mail, Save, ArrowLeft } from 'lucide-react';
import API_URL from '../config';

const EditProfilePage = () => {
  const { authUser, setAuthUser, setAuthMessage, handleLogout } = useOutletContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: authUser?.name || '',
    email: authUser?.email || ''
  });

  // ✅ Si authUser cambia (por /me), sincroniza el formulario
  useEffect(() => {
    setFormData({
      name: authUser?.name || '',
      email: authUser?.email || ''
    });
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthMessage(null);

    // ✅ Si no hay usuario autenticado, manda a login
    if (!authUser) {
      setAuthMessage({ type: 'error', text: 'Debes iniciar sesión para editar tu perfil.' });
      return navigate('/');
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // 🔑 IMPORTANTE para mandar la cookie
        body: JSON.stringify(formData),
      });

      // ✅ Si la sesión expiró o no hay cookie
      if (response.status === 401) {
        setAuthMessage({ type: 'error', text: 'Tu sesión expiró. Inicia sesión de nuevo.' });
        if (handleLogout) handleLogout();
        return;
      }

      const data = await response.json();

      if (response.ok) {
        // ✅ Actualiza el usuario en el estado global
        const updatedUser = { ...authUser, ...data.user };
        setAuthUser(updatedUser);

        // ✅ Ya no guardamos sesión en localStorage
        setAuthMessage({ type: 'success', text: '¡Perfil actualizado con éxito!' });
        setTimeout(() => navigate('/'), 1200);
      } else {
        setAuthMessage({ type: 'error', text: data.error || 'No se pudo actualizar' });
      }

    } catch (error) {
      // ✅ Aquí ahora sí: error real (network/cors)
      setAuthMessage({
        type: 'error',
        text: 'No se pudo conectar con el servidor. Intenta de nuevo.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] py-12 px-4">
      <div className="max-w-md mx-auto bg-white p-8 border border-stone-300 shadow-xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-stone-500 hover:text-amber-800 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver
        </button>

        <h2 className="text-3xl font-serif font-black text-stone-900 mb-8 border-b-2 border-amber-800 pb-2">
          Editar Perfil
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-serif font-bold text-stone-700 mb-2">
              Nombre de Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-stone-300 focus:border-amber-800 outline-none font-sans transition-colors"
                placeholder="Tu nombre"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-serif font-bold text-stone-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-stone-300 focus:border-amber-800 outline-none font-sans transition-colors"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-stone-900 text-white py-3 px-6 font-black uppercase tracking-widest hover:bg-amber-900 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md hover:shadow-lg"
          >
            <Save className="w-5 h-5" /> Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
