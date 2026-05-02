import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminSettings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("general");

  return (
    <div className="settings-container">
      <style>{`
        .settings-container { 
          font-family: 'Inter', sans-serif; 
          padding: 20px; 
          display: flex; 
          gap: 30px; 
          background-color: #f8fafc;
          min-height: 100vh;
        }
        
        /* Sidebar bên trái */
        .settings-sidebar { 
          width: 280px; 
          flex-shrink: 0; 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between;
        }
        .settings-sidebar h1 { 
          font-size: 1.5rem; 
          font-weight: 900; 
          margin-bottom: 24px; 
          color: #0f172a; 
          padding-left: 10px;
        }
        
        .nav-list { display: flex; flex-direction: column; gap: 8px; }
        
        /* Style chung cho Item và Button Logout */
        .nav-item { 
          padding: 14px 18px; 
          border-radius: 12px; 
          cursor: pointer; 
          font-weight: 700; 
          color: #64748b; 
          transition: all 0.2s ease;
          display: flex; 
          align-items: center; 
          gap: 12px;
          border: none;
          background: transparent;
          width: 100%;
          font-size: 0.95rem;
          text-align: left;
        }

        .nav-item:hover { 
          background: #e2e8f0; 
          color: #0f172a; 
        }

        .nav-item.active { 
          background: #2563eb; 
          color: white; 
        }

        /* Phần Đăng xuất */
        .logout-section {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .nav-item.btn-logout {
          color: #dc2626; /* Màu đỏ đặc trưng cho đăng xuất */
        }

        .nav-item.btn-logout:hover {
          background: #fee2e2;
          color: #b91c1c;
        }

        /* Vùng nội dung bên phải */
        .settings-content { 
          flex: 1; 
          background: white; 
          border-radius: 24px; 
          border: 1px solid #e2e8f0; 
          padding: 32px; 
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .content-header { margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; }
        .content-header h2 { margin: 0; font-size: 1.3rem; font-weight: 800; color: #1e293b; }
        .content-header p { margin: 8px 0 0 0; color: #64748b; font-size: 0.9rem; }

        /* Form elements */
        .setting-group { margin-bottom: 24px; }
        .setting-label { display: block; font-weight: 700; color: #334155; margin-bottom: 8px; font-size: 0.95rem; }
        .setting-input { 
          width: 100%; 
          padding: 12px 16px; 
          border-radius: 10px; 
          border: 1px solid #e2e8f0; 
          font-size: 0.95rem; 
          outline: none; 
          transition: 0.2s;
          box-sizing: border-box;
        }
        .setting-input:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
        
        .flex-row { display: flex; gap: 20px; }
        .flex-row > div { flex: 1; }

        .toggle-switch {
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          padding: 16px; 
          background: #f8fafc; 
          border-radius: 12px; 
          margin-bottom: 12px;
          border: 1px solid #f1f5f9;
        }
        .switch {
          position: relative; display: inline-block; width: 44px; height: 24px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
          background-color: #cbd5e1; transition: .4s; border-radius: 24px;
        }
        .slider:before {
          position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
          background-color: white; transition: .4s; border-radius: 50%;
        }
        input:checked + .slider { background-color: #16a34a; }
        input:checked + .slider:before { transform: translateX(20px); }

        .btn-save {
          background: #0f172a; 
          color: white; 
          border: none; 
          padding: 14px 28px;
          border-radius: 12px; 
          font-weight: 700; 
          cursor: pointer; 
          margin-top: 20px;
          transition: 0.2s;
          width: fit-content;
        }
        .btn-save:hover { background: #1e293b; transform: translateY(-2px); }
      `}</style>

      {/* Sidebar Điều hướng */}
      <div className="settings-sidebar">
        <div>
          <h1>Cài đặt</h1>
          <div className="nav-list">
            <button
              className={`nav-item ${activeSection === "general" ? "active" : ""}`}
              onClick={() => setActiveSection("general")}
            >
              <span>⚙️</span> Cấu hình chung
            </button>
            <button
              className={`nav-item ${activeSection === "rental" ? "active" : ""}`}
              onClick={() => setActiveSection("rental")}
            >
              <span>🚗</span> Quy định thuê xe
            </button>
            <button
              className={`nav-item ${activeSection === "payment" ? "active" : ""}`}
              onClick={() => setActiveSection("payment")}
            >
              <span>💳</span> Thanh toán & Thuế
            </button>
            <button
              className={`nav-item ${activeSection === "security" ? "active" : ""}`}
              onClick={() => setActiveSection("security")}
            >
              <span>🛡️</span> Bảo mật & Tài khoản
            </button>
          </div>
        </div>
      </div>

      {/* Nội dung cấu hình */}
      <div className="settings-content">
        {activeSection === "general" && (
          <>
            <div className="content-header">
              <h2>Cấu hình chung</h2>
              <p>Quản lý thông tin cơ bản của website và hệ thống.</p>
            </div>
            <div className="setting-group">
              <label className="setting-label">Tên hệ thống</label>
              <input
                type="text"
                className="setting-input"
                defaultValue="EPU Car Rental"
              />
            </div>
            <div className="flex-row">
              <div className="setting-group">
                <label className="setting-label">Email hỗ trợ</label>
                <input
                  type="email"
                  className="setting-input"
                  defaultValue="support@epucar.vn"
                />
              </div>
              <div className="setting-group">
                <label className="setting-label">Số điện thoại Hotline</label>
                <input
                  type="text"
                  className="setting-input"
                  defaultValue="1900 1234"
                />
              </div>
            </div>
            <div className="setting-group">
              <label className="setting-label">Địa chỉ trụ sở</label>
              <input
                type="text"
                className="setting-input"
                defaultValue="235 Hoàng Quốc Việt, Hà Nội"
              />
            </div>
          </>
        )}

        {activeSection === "rental" && (
          <>
            <div className="content-header">
              <h2>Quy định thuê xe</h2>
              <p>Thiết lập các ràng buộc và phí phát sinh.</p>
            </div>
            <div className="toggle-switch">
              <div>
                <div style={{ fontWeight: 700 }}>Yêu cầu bằng lái xe</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Khách phải upload bằng lái trước khi đặt
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="flex-row">
              <div className="setting-group">
                <label className="setting-label">Tiền cọc mặc định (VNĐ)</label>
                <input
                  type="number"
                  className="setting-input"
                  defaultValue="5000000"
                />
              </div>
              <div className="setting-group">
                <label className="setting-label">
                  Giới hạn km/ngày (0 là không giới hạn)
                </label>
                <input
                  type="number"
                  className="setting-input"
                  defaultValue="300"
                />
              </div>
            </div>
          </>
        )}

        {activeSection === "payment" && (
          <>
            <div className="content-header">
              <h2>Thanh toán & Thuế</h2>
              <p>Cấu hình các cổng thanh toán và VAT.</p>
            </div>
            <div className="setting-group">
              <label className="setting-label">Thuế VAT (%)</label>
              <input
                type="number"
                className="setting-input"
                defaultValue="10"
              />
            </div>
            <div className="toggle-switch">
              <div>
                <div style={{ fontWeight: 700 }}>Thanh toán qua VNPay</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Hoạt động
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-switch">
              <div>
                <div style={{ fontWeight: 700 }}>Thanh toán qua MoMo</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Đang bảo trì
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
          </>
        )}

        {activeSection === "security" && (
          <>
            <div className="content-header">
              <h2>Bảo mật & Tài khoản</h2>
              <p>Cấu hình mật khẩu và quyền quản trị.</p>
            </div>
            <div className="setting-group">
              <label className="setting-label">Mật khẩu hiện tại</label>
              <input
                type="password"
                className="setting-input"
                placeholder="********"
              />
            </div>
            <div className="setting-group">
              <label className="setting-label">Mật khẩu mới</label>
              <input type="password" className="setting-input" />
            </div>
          </>
        )}

        <button className="btn-save">Lưu cấu hình</button>
      </div>
    </div>
  );
}

export default AdminSettings;
