import NotificationBell from "./NotificationBell";
function AdminTopbar() {
  return (
    <>
      <style>{`
        .topbar {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }

        .topbar-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          color: #0f172a;
        }

        .topbar-subtitle {
          margin: 4px 0 0;
          color: #6b7280;
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .circle-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
      `}</style>

      <div className="topbar">
        <div>
          <h1 className="topbar-title">Dashboard quản trị</h1>
          <p className="topbar-subtitle">
            Theo dõi hoạt động hệ thống thuê xe và quản lý dữ liệu nhanh chóng.
          </p>
        </div>

        <div className="topbar-actions">
          <NotificationBell />
          <button className="circle-btn">💬</button>
          <button className="circle-btn">⚙️</button>
        </div>
      </div>
    </>
  );
}

export default AdminTopbar;