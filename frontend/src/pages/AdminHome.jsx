import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminTopbar from "../components/AdminTopbar.jsx";

function AdminHome() {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { name: "Dashboard", path: "/admin" },
    { name: "Quản lý xe", path: "/admin/cars" },
    { name: "Quản lý người dùng", path: "/admin/users" },
    { name: "Đơn thuê", path: "/admin/orders" },
    { name: "Hợp đồng", path: "/admin/contracts" },
    { name: "Voucher", path: "/admin/vouchers" },
    { name: "Tin tức", path: "/admin/community" },
    { name: "Cài đặt", path: "/admin/settings" },
    { name: "Đăng xuất", path: "logout" },
  ];

  const handleMenuClick = (path) => {
    if (path === "logout") {
      const confirmLogout = window.confirm(
        "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?",
      );

      if (confirmLogout) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
      }

      return;
    }

    navigate(path);
  };

  return (
    <>
      <style>{`
        body { margin: 0; font-family: Inter, sans-serif; background: #f5f7fb; }

        .admin-layout { display: grid; grid-template-columns: 290px 1fr; min-height: 100vh; }

        .admin-content { padding: 24px 28px 40px; min-width: 0; }
      `}</style>

      <div className="admin-layout">
        <AdminSidebar
          menus={menus}
          currentPath={location.pathname}
          onMenuClick={handleMenuClick}
        />

        <main className="admin-content">
          <AdminTopbar />

          {/* Chỉ thay đổi nội dung ở đây */}
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default AdminHome;
