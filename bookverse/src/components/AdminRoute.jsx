import { Navigate, Outlet, useOutletContext } from "react-router-dom";

const AdminRoute = () => {
  const { authUser, isAdmin } = useOutletContext();

  // No logueado
  if (!authUser) {
    return <Navigate to="/" replace />;
  }

  // Logueado pero no admin
  if (!isAdmin) {
    return <Navigate to="/403" replace />;
  }

  // Admin ✔️
  return <Outlet />;
};

export default AdminRoute;
