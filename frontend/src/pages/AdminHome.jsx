import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminTopbar from "../components/AdminTopbar.jsx";

function AdminHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    // Đóng sidebar sau khi chọn menu trên mobile
    setSidebarOpen(false);
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        body { margin: 0; font-family: Inter, sans-serif; background: #f5f7fb; }

        /* ── Layout ── */
        .admin-layout {
          display: flex;
          min-height: 100vh;
          position: relative;
        }

        /* ── Sidebar ── */
        .admin-sidebar-wrapper {
          width: 290px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 100;
        }

        /* ── Main content ── */
        .admin-content {
          flex: 1;
          min-width: 0;
          padding: 24px 28px 40px;
        }

        /* ── Hamburger button (ẩn trên desktop) ── */
        .sidebar-toggle-btn {
          display: none;
          position: fixed;
          top: 14px;
          left: 14px;
          z-index: 300;
          background: #1a2035;
          border: none;
          border-radius: 10px;
          width: 42px;
          height: 42px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          padding: 0;
          box-shadow: 0 2px 12px rgba(0,0,0,0.25);
        }

        .sidebar-toggle-btn span {
          display: block;
          width: 22px;
          height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: transform 0.25s, opacity 0.25s;
        }

        .sidebar-toggle-btn.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .sidebar-toggle-btn.open span:nth-child(2) {
          opacity: 0;
        }
        .sidebar-toggle-btn.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* ── Overlay (mobile) ── */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 199;
          backdrop-filter: blur(2px);
        }

        /* ── Tablet: ≤ 1024px ── */
        @media (max-width: 1024px) {
          .admin-sidebar-wrapper {
            width: 260px;
          }
        }

        /* ── Mobile: ≤ 768px ── */
        @media (max-width: 768px) {
          .sidebar-toggle-btn {
            display: flex;
          }

          .sidebar-overlay {
            display: block;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s;
          }

          .sidebar-overlay.visible {
            opacity: 1;
            pointer-events: auto;
          }

          .admin-sidebar-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 270px;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 200;
          }

          .admin-sidebar-wrapper.open {
            transform: translateX(0);
          }

          .admin-content {
            padding: 72px 16px 32px;
          }
        }

        /* ── Small mobile: ≤ 480px ── */
        @media (max-width: 480px) {
          .admin-content {
            padding: 68px 12px 28px;
          }
        }
      `}</style>

      {/* Hamburger button */}
      <button
        className={`sidebar-toggle-btn ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="admin-layout">
        <div className={`admin-sidebar-wrapper ${sidebarOpen ? "open" : ""}`}>
          <AdminSidebar
            menus={menus}
            currentPath={location.pathname}
            onMenuClick={handleMenuClick}
          />
        </div>

        <main className="admin-content">
          <AdminTopbar />
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default AdminHome;
