import { useState, useEffect } from "react";
import { getAllUsersApi } from "../../services/authService";

function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsersApi();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getStatusStyle = (isActive) => {
    return isActive ? "status-active" : "status-locked";
  };

  if (loading)
    return <div style={{ padding: "20px" }}>Đang tải dữ liệu...</div>;
  if (error)
    return <div style={{ color: "red", padding: "20px" }}>Lỗi: {error}</div>;

  return (
    <div className="manager-container">
      <style>{`
        .manager-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .manager-title { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
        .table-card { background: #fff; border-radius: 20px; border: 1px solid #e5e7eb; overflow: hidden; }
        .users-table { width: 100%; border-collapse: collapse; }
        .users-table th { background: #f8fafc; padding: 16px; text-align: left; color: #64748b; font-size: 0.9rem; }
        .users-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-weight: 600; }
        .status-badge { padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; }
        .status-active { background: #dcfce7; color: #166534; }
        .status-locked { background: #fee2e2; color: #991b1b; }
        .role-badge { padding: 4px 8px; background: #f1f5f9; border-radius: 6px; font-size: 0.85rem; color: #475569; }
        .btn-edit { color: #2563eb; margin-right: 12px; cursor: pointer; border: none; background: none; font-weight: 700; }
      `}</style>

      <div className="manager-header">
        <h1 className="manager-title">Quản lý người dùng</h1>
        <button className="btn-edit" onClick={fetchUsers}>
          Làm mới
        </button>
      </div>

      <div className="table-card">
        <table className="users-table">
          <thead>
            <tr>
              {/* Đã xóa th ID */}
              <th>Người dùng</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="5" // Giảm colSpan từ 6 xuống 5 vì đã bớt 1 cột
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Không có người dùng nào.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  {/* Đã xóa td hiển thị user.id */}
                  <td>
                    <div style={{ fontWeight: 800 }}>{user.fullName}</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      {user.email}
                    </div>
                  </td>
                  <td>{user.phoneNumber || "N/A"}</td>
                  <td>
                    <span className="role-badge">{user.role}</span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusStyle(user.isActive)}`}
                    >
                      {user.isActive ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit">Sửa</button>
                    <button
                      style={{
                        color: user.isActive ? "#dc2626" : "#059669",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {user.isActive ? "Khóa" : "Mở khóa"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersManager;
