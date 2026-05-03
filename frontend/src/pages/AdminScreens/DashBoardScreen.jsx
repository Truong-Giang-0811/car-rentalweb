import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCars } from "../../services/carsService";
import { getRecentOwnerBookings } from "../../services/bookingsService"; // Import service lấy đơn hàng
import { BASE_URL } from "../../constants/config";

function Dashboard() {
  const navigate = useNavigate();
  const brands = [
    { id: "all", name: "Tất cả", icon: "▦" },
    { id: "toyota", name: "Toyota", icon: "🚗" },
    { id: "kia", name: "KIA", icon: "🚙" },
    { id: "hyundai", name: "Hyundai", icon: "🚘" },
    { id: "ford", name: "Ford", icon: "🚐" },
  ];

  const [cars, setCars] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("all");

  // Thay thế dữ liệu mẫu bằng State
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách xe
        const carsData = await getMyCars();
        setCars(carsData);

        // Lấy 3 đơn hàng gần đây
        const ordersData = await getRecentOwnerBookings(3);
        setRecentOrders(ordersData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu Dashboard:", error);
      }
    };
    fetchData();
  }, []);

  const filteredCars = cars;

  // Hàm chuyển đổi trạng thái từ Backend sang Tiếng Việt và CSS Class
  const getStatusInfo = (status) => {
    // ép kiểu về string nếu backend trả về số hoặc chuỗi
    const statusKey = String(status);

    switch (statusKey) {
      case "0":
      case "Pending":
        return { label: "Chờ duyệt", className: "status-pending" };
      case "1":
      case "Rejected":
        return { label: "Đã từ chối", className: "status-rejected" };
      case "2":
      case "WaitingForDeposit":
        return { label: "Chờ đặt cọc", className: "status-waiting" };
      case "3":
      case "Confirmed":
        return { label: "Đã xác nhận", className: "status-confirmed" };
      case "4":
      case "PickedUp":
        return { label: "Đang thuê", className: "status-pickedup" };
      case "5":
      case "Completed":
        return { label: "Hoàn thành", className: "status-completed" };
      case "6":
      case "Cancelled":
        return { label: "Đã hủy", className: "status-cancelled" };
      case "7":
      case "Expired":
        return { label: "Quá hạn", className: "status-expired" };
      case "8":
      case "PendingSettlement":
        return { label: "Chờ quyết toán", className: "status-settlement" };
      default:
        return { label: "Không xác định", className: "" };
    }
  };

  // Hàm format ngày tháng từ chuỗi ISO
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <style>{`

        .welcome-card {
          background: linear-gradient(135deg, #0f172a, #1d4ed8);
          border-radius: 28px;
          padding: 32px;
          color: #fff;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }

        .welcome-card::after {
          content: "";
          position: absolute;
          right: -60px;
          top: -60px;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
        }

        .status-pill { padding: 6px 14px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; display: inline-block; }
        .status-pending { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
        .status-waiting { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
        .status-confirmed { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
        .status-pickedup { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; }
        .status-completed { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
        .status-rejected { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
        .status-cancelled { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
        .status-expired { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }
        .status-settlement { background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; }
        .welcome-title {
          font-size: 2rem;
          font-weight: 900;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }

        .welcome-text {
          max-width: 720px;
          color: rgba(255,255,255,0.88);
          line-height: 1.7;
          position: relative;
          z-index: 1;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 22px;
        }

        .stat-label { color: #6b7280; font-size: 0.95rem; margin-bottom: 10px; }
        .stat-value { font-size: 2rem; font-weight: 900; color: #0f172a; }
        .stat-change { margin-top: 10px; font-size: 0.92rem; font-weight: 700; color: #16a34a; }

        .section-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 22px;
          margin-bottom: 24px;
        }

        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .section-title { font-size: 1.3rem; font-weight: 800; margin: 0; }
        .section-link { color: #16a34a; font-weight: 700; cursor: pointer; }

        .brand-list { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 10px; }
        .brand-card {
          min-width: 120px;
          background: #f8fafc;
          border: 2px solid #eef2f7;
          border-radius: 18px;
          padding: 18px 14px;
          text-align: center;
          cursor: pointer;
          transition: 0.2s;
        }

        .brand-card.active { border-color: #22c55e; background: #ecfdf5; }
        .brand-icon { font-size: 1.5rem; margin-bottom: 8px; }
        .brand-name { font-weight: 800; color: #111827; }

        .car-list { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 10px; }
        .car-card {
          min-width: 270px;
          border-radius: 20px;
          background: #fff;
          border: 2px solid #eef2f7;
          overflow: hidden;
        }

        .car-image { height: 150px; width: 100%; object-fit: cover; }
        .car-body { padding: 16px; }
        .car-title { font-weight: 800; margin-bottom: 8px; }
        .car-price { color: #16a34a; font-weight: 900; margin-top: 10px; }
        .car-meta { display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 0.9rem; }
        .status-indicator { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; }
        .status-active { background: #dcfce7; color: #166534; }
        .status-active::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #16a34a; }
        .status-inactive { background: #fee2e2; color: #991b1b; }
        .status-inactive::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #dc2626; }

        .orders-table { width: 100%; border-collapse: collapse; }
        .orders-table th { text-align: left; color: #6b7280; padding: 12px; border-bottom: 1px solid #eef2f7; }
        .orders-table td { padding: 12px; border-bottom: 1px solid #eef2f7; font-weight: 600; }

        .status-pill {
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 800;
        }
        .status-pending { background: #fef3c7; color: #b45309; }
        .status-approved { background: #dcfce7; color: #166534; }
        .status-completed { background: #dbeafe; color: #1d4ed8; }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="welcome-card">
        <div className="welcome-title">Xin chào, Quản trị viên</div>
        <div className="welcome-text">
          Chào mừng bạn quay trở lại hệ thống quản trị Kongcars. Tại đây bạn có
          thể quản lý các nội dung của nền tảng.
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Tổng số xe</div>
          <div className="stat-value">128</div>
          <div className="stat-change">+12 xe tháng này</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Đơn thuê mới</div>
          <div className="stat-value">24</div>
          <div className="stat-change">+8% so với hôm qua</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Người dùng</div>
          <div className="stat-value">560</div>
          <div className="stat-change">+32 tài khoản mới</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Doanh thu tạm tính</div>
          <div className="stat-value">85M</div>
          <div className="stat-change">+15% tuần này</div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-head">
          <h2 className="section-title">Hãng xe nổi bật</h2>
          <div className="section-link">Xem thêm</div>
        </div>
        <div className="brand-list">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className={`brand-card ${selectedBrand === brand.id ? "active" : ""}`}
              onClick={() => setSelectedBrand(brand.id)}
            >
              <div className="brand-icon">{brand.icon}</div>
              <div className="brand-name">{brand.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div className="section-head">
          <h2 className="section-title">Xe của tôi</h2>
          <div
            className="section-link"
            onClick={() => navigate("/admin/add-car")}
          >
            + Thêm xe
          </div>
        </div>
        <div className="car-list">
          {filteredCars.map((car) => (
            <div className="car-card" key={car.id}>
              <img
                src={car.thumbnail ? car.thumbnail : "/images/default-car.jpg"}
                alt={car.model}
                className="car-image"
              />
              <div className="car-body">
                <div className="car-title">
                  {car.brand} {car.model} • {car.year}
                </div>
                <div className="car-meta">
                  <span>{car.seats} chỗ</span> •{" "}
                  <span
                    className={`status-indicator ${car.isAvailable ? "status-active" : "status-inactive"}`}
                  >
                    {car.isAvailable ? "Đang hoạt động" : "Đang dừng"}
                  </span>
                </div>
                <div className="car-price">
                  {car.pricePerDay.toLocaleString("vi-VN")} / ngày
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div className="section-head">
          <h2 className="section-title">Đơn hàng gần đây</h2>
          <div
            className="section-link"
            onClick={() => navigate("/admin/orders")}
            style={{ cursor: "pointer" }}
          >
            Xem tất cả
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Xe</th>
                <th>Khách hàng</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", color: "#6b7280" }}
                  >
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <tr key={order.id}>
                      {/* Cắt ngắn GUID lấy 8 ký tự đầu cho gọn */}
                      <td>#{order.id.substring(0, 8).toUpperCase()}</td>
                      <td>{order.carNameSnapshot}</td>
                      <td>{order.customerNameSnapshot}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <span className={`status-pill ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
