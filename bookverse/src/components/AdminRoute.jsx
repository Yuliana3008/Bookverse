import { Navigate, Outlet, useOutletContext } from "react-router-dom";

const AdminRoute = () => {
  const { authUser, isAdmin } = useOutletContext();

  
  if (!authUser) {
    return <Navigate to="/" replace />;
  }

  
  if (!isAdmin) {
    return <Navigate to="/403" replace />;
  }

  
  return <Outlet />;
};

export default AdminRoute;
