import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Bạn cần đăng nhập để truy cập trang này.");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;