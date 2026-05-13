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

  const getStatusStyle = (isActive) =>
    isActive ? "status-active" : "status-locked";

  if (loading)
    return (
      <div style={{ padding: "20px", color: "#64748b" }}>
        Đang tải dữ liệu...
      </div>
    );
  if (error)
    return <div style={{ color: "red", padding: "20px" }}>Lỗi: {error}</div>;

  return (
    <div className="manager-container">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .manager-container { padding: 4px 0; }

        /* ── Header ── */
        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .manager-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        /* ── Table card (desktop) ── */
        .table-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        .users-table { width: 100%; border-collapse: collapse; min-width: 520px; }

        .users-table th {
          background: #f8fafc;
          padding: 14px 16px;
          text-align: left;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .users-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          font-weight: 600;
          color: #1e293b;
          vertical-align: middle;
        }

        .users-table tr:last-child td { border-bottom: none; }
        .users-table tr:hover td { background: #fafafa; }

        /* ── Badges ── */
        .status-badge {
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          white-space: nowrap;
          display: inline-block;
        }

        .status-active { background: #dcfce7; color: #166534; }
        .status-locked { background: #fee2e2; color: #991b1b; }

        .role-badge {
          padding: 4px 10px;
          background: #f1f5f9;
          border-radius: 6px;
          font-size: 0.82rem;
          color: #475569;
          font-weight: 600;
          white-space: nowrap;
          display: inline-block;
        }

        /* ── Action buttons ── */
        .btn-action {
          border: none;
          background: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.88rem;
          padding: 0;
          margin-right: 12px;
        }

        .btn-action:last-child { margin-right: 0; }

        /* ── Mobile refresh button ── */
        .btn-refresh {
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 10px;
          padding: 8px 16px;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.88rem;
          color: #2563eb;
          transition: background 0.2s;
        }

        .btn-refresh:hover { background: #eff6ff; }

        /* ── Mobile card list ── */
        .user-card-list { display: none; }

        .user-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 10px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        .uc-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
          gap: 8px;
        }

        .uc-name {
          font-weight: 800;
          font-size: 0.97rem;
          color: #0f172a;
          line-height: 1.3;
        }

        .uc-email {
          font-size: 0.78rem;
          color: #64748b;
          margin-top: 2px;
          word-break: break-all;
        }

        .uc-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.84rem;
          padding: 5px 0;
          border-bottom: 1px solid #f1f5f9;
          gap: 8px;
        }

        .uc-row:last-of-type { border-bottom: none; }

        .uc-label {
          color: #94a3b8;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .uc-val { font-weight: 700; color: #1e293b; text-align: right; }

        .uc-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          justify-content: flex-end;
        }

        .uc-btn {
          border: none;
          border-radius: 8px;
          padding: 7px 16px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .uc-btn-edit   { background: #eff6ff; color: #2563eb; }
        .uc-btn-lock   { background: #fef2f2; color: #dc2626; }
        .uc-btn-unlock { background: #f0fdf4; color: #059669; }

        /* ── Mobile: ≤ 768px ── */
        @media (max-width: 768px) {
          .manager-title { font-size: 1.25rem; }
          .table-card { display: none; }
          .user-card-list { display: block; }
        }

        @media (max-width: 480px) {
          .manager-title { font-size: 1.1rem; }
        }
      `}</style>

      <div className="manager-header">
        <h1 className="manager-title">Quản lý người dùng</h1>
        <button className="btn-refresh" onClick={fetchUsers}>
          Làm mới
        </button>
      </div>

      {/* ── Desktop: Table ── */}
      <div className="table-card">
        <div className="table-scroll">
          <table className="users-table">
            <thead>
              <tr>
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
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "28px",
                      color: "#64748b",
                    }}
                  >
                    Không có người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{user.fullName}</div>
                      <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
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
                      <button
                        className="btn-action"
                        style={{ color: "#2563eb" }}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn-action"
                        style={{ color: user.isActive ? "#dc2626" : "#059669" }}
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

      {/* ── Mobile: Card list ── */}
      <div className="user-card-list">
        {users.length === 0 ? (
          <div
            style={{ textAlign: "center", color: "#64748b", padding: "24px 0" }}
          >
            Không có người dùng nào.
          </div>
        ) : (
          users.map((user) => (
            <div className="user-card" key={user.id}>
              <div className="uc-top">
                <div>
                  <div className="uc-name">{user.fullName}</div>
                  <div className="uc-email">{user.email}</div>
                </div>
                <span
                  className={`status-badge ${getStatusStyle(user.isActive)}`}
                >
                  {user.isActive ? "Hoạt động" : "Bị khóa"}
                </span>
              </div>

              <div className="uc-row">
                <span className="uc-label">SĐT</span>
                <span className="uc-val">{user.phoneNumber || "N/A"}</span>
              </div>
              <div className="uc-row">
                <span className="uc-label">Vai trò</span>
                <span className="uc-val">
                  <span className="role-badge">{user.role}</span>
                </span>
              </div>

              <div className="uc-actions">
                <button className="uc-btn uc-btn-edit">Sửa</button>
                <button
                  className={`uc-btn ${user.isActive ? "uc-btn-lock" : "uc-btn-unlock"}`}
                >
                  {user.isActive ? "Khóa" : "Mở khóa"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UsersManager;
