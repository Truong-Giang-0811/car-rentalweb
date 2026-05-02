import React, { useState, useEffect } from "react";
import { getMyProfileApi } from "../services/authService";
function AdminSidebar({ menus, currentPath, onMenuClick }) {
  // Tạo state để lưu thông tin admin
  const [adminInfo, setAdminInfo] = useState({
    fullName: "Đang tải...",
    role: "...",
  });

  // Gọi API lấy thông tin profile khi component được mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const data = await getMyProfileApi();
        setAdminInfo({
          fullName: data.fullName,
          // Bạn có thể việt hóa Role từ backend trả về nếu muốn
          role: data.role === "Admin" ? "Quản trị viên hệ thống" : data.role,
        });
      } catch (error) {
        console.error("Lỗi khi lấy thông tin admin:", error.message);
        setAdminInfo({
          fullName: "Lỗi hiển thị",
          role: "Không xác định",
        });
      }
    };

    fetchAdminProfile();
  }, []);

  // Lấy chữ cái đầu tiên của tên để làm Avatar (nếu chưa có tên thì để trống)
  const avatarLetter =
    adminInfo.fullName !== "Đang tải..." &&
    adminInfo.fullName !== "Lỗi hiển thị"
      ? adminInfo.fullName.charAt(0).toUpperCase()
      : "";

  return (
    <>
      <style>{`
        /* Giữ nguyên toàn bộ CSS cũ của bạn */
        .admin-sidebar {
          background: #0f172a;
          color: #fff;
          padding: 24px 18px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          width: 100%;
        }

        .admin-brand {
          font-size: 1.75rem;
          font-weight: 900;
          margin-bottom: 26px;
          padding: 8px 10px;
          white-space: nowrap;
          line-height: 1.2;
        }

        .admin-brand span {
          color: #4ade80;
        }

        .admin-profile {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 16px;
          margin-bottom: 26px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #22c55e);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .admin-info {
          min-width: 0;
        }

        .admin-name {
          font-size: 1rem;
          font-weight: 800;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-role {
          color: rgba(255,255,255,0.72);
          font-size: 0.86rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .menu-title {
          color: rgba(255,255,255,0.55);
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 22px 12px 10px;
        }

        .menu-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .menu-item {
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.86);
          text-align: left;
          padding: 14px 14px;
          border-radius: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
          font-size: 1rem;
        }

        .menu-item:hover {
          background: rgba(255,255,255,0.08);
        }

        .menu-item.active {
          background: linear-gradient(90deg, #22c55e, #16a34a);
          color: #ffffff;
        }
      `}</style>

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>Kong</span>Cars Admin
        </div>

        <div className="admin-profile">
          {/* Cập nhật Avatar linh hoạt theo chữ cái đầu của tên */}
          <div className="admin-avatar">{avatarLetter}</div>

          {/* THAY ĐỔI Ở ĐÂY: Hiển thị dữ liệu thực tế */}
          <div className="admin-info">
            <div className="admin-name">{adminInfo.fullName}</div>
            <div className="admin-role">{adminInfo.role}</div>
          </div>
        </div>

        <div className="menu-title">Main Menu</div>

        <div className="menu-list">
          {menus.map((menu) => (
            <button
              key={menu.path}
              className={`menu-item ${currentPath === menu.path ? "active" : ""}`}
              onClick={() => onMenuClick(menu.path)}
            >
              {menu.name}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
