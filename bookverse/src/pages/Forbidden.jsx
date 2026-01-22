import { Link } from "react-router-dom";

const Forbidden = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f1ea] text-stone-800">
      <h1 className="text-5xl font-extrabold mb-4">403</h1>
      <p className="text-lg mb-6">No tienes permisos para acceder a esta página.</p>
      <Link
        to="/"
        className="px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
};

export default Forbidden;
