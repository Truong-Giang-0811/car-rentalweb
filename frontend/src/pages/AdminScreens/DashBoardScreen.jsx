import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCars } from "../../services/carsService";
import { getRecentOwnerBookings } from "../../services/bookingsService";
import { carBrands } from "../../constants/mockdata"; // ← Đường dẫn có thể cần chỉnh sửa

function Dashboard() {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const carsData = await getMyCars();
        setCars(carsData);

        const ordersData = await getRecentOwnerBookings(3);
        setRecentOrders(ordersData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu Dashboard:", error);
      }
    };
    fetchData();
  }, []);

  // Lọc xe theo hãng được chọn
  const filteredCars =
    selectedBrand === "all"
      ? cars
      : cars.filter(
          (car) => car.brand?.toLowerCase() === selectedBrand.toLowerCase(),
        );

  const getStatusInfo = (status) => {
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
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Welcome card ── */
        .welcome-card {
          background: linear-gradient(135deg, #0f172a, #1d4ed8);
          border-radius: 24px;
          padding: 32px 36px;
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
          pointer-events: none;
        }

        .welcome-title {
          font-size: 1.75rem;
          font-weight: 900;
          margin: 0 0 10px;
          position: relative;
          z-index: 1;
        }

        .welcome-text {
          max-width: 720px;
          color: rgba(255,255,255,0.85);
          line-height: 1.7;
          font-size: 0.97rem;
          position: relative;
          z-index: 1;
          margin: 0;
        }

        /* ── Stats grid ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 20px;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.88rem;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.85rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.1;
        }

        .stat-change {
          margin-top: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #16a34a;
        }

        /* ── Section card ── */
        .section-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 12px;
        }

        .section-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          color: #111827;
        }

        .section-link {
          color: #16a34a;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.9rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .section-link:hover { color: #15803d; }

        /* ── Brand list ── */
        .brand-list {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 6px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .brand-list::-webkit-scrollbar { display: none; }

        .brand-card {
          min-width: 100px;
          flex-shrink: 0;
          background: #f8fafc;
          border: 2px solid #eef2f7;
          border-radius: 16px;
          padding: 14px 12px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
        }

        .brand-card.active { border-color: #22c55e; background: #ecfdf5; }
        .brand-card:hover:not(.active) { border-color: #d1fae5; }

        .brand-icon { font-size: 1.4rem; margin-bottom: 6px; }
        .brand-name { font-weight: 800; color: #111827; font-size: 0.9rem; }

        /* ── Car list ── */
        .car-list {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding-bottom: 6px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .car-list::-webkit-scrollbar { display: none; }

        .car-card {
          min-width: 240px;
          flex-shrink: 0;
          border-radius: 16px;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          overflow: hidden;
          transition: border-color 0.18s;
        }

        .car-card:hover { border-color: #86efac; }

        .car-image { height: 140px; width: 100%; object-fit: cover; display: block; }
        .car-body { padding: 14px; }
        .car-title { font-weight: 800; margin-bottom: 8px; font-size: 0.95rem; color: #111827; }
        .car-price { color: #16a34a; font-weight: 900; margin-top: 8px; font-size: 0.97rem; }

        .car-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 0.88rem;
          flex-wrap: wrap;
        }

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .status-active { background: #dcfce7; color: #166534; }
        .status-active::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #16a34a; flex-shrink: 0; }
        .status-inactive { background: #fee2e2; color: #991b1b; }
        .status-inactive::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #dc2626; flex-shrink: 0; }

        /* ── Orders table ── */
        .orders-table { width: 100%; border-collapse: collapse; min-width: 520px; }
        .orders-table th {
          text-align: left;
          color: #6b7280;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 10px 14px;
          border-bottom: 1px solid #f1f5f9;
          background: #f8fafc;
          white-space: nowrap;
        }
        .orders-table th:first-child { border-radius: 10px 0 0 10px; }
        .orders-table th:last-child { border-radius: 0 10px 10px 0; }

        .orders-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #f1f5f9;
          font-weight: 600;
          font-size: 0.92rem;
          color: #111827;
          vertical-align: middle;
        }

        .orders-table tr:last-child td { border-bottom: none; }
        .orders-table tr:hover td { background: #fafafa; }

        /* ── Status pills ── */
        .status-pill {
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-block;
          white-space: nowrap;
        }

        .status-pending   { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
        .status-waiting   { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
        .status-confirmed { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
        .status-pickedup  { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; }
        .status-completed { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
        .status-rejected  { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
        .status-cancelled { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
        .status-expired   { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }
        .status-settlement{ background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; }
        .status-approved  { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }

        /* Responsive */
        @media (max-width: 1199.98px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .welcome-card { padding: 26px 28px; }
          .welcome-title { font-size: 1.5rem; }
        }

        @media (max-width: 768px) {
          .welcome-card { padding: 20px; border-radius: 18px; margin-bottom: 16px; }
          .welcome-title { font-size: 1.2rem; }
          .welcome-text { font-size: 0.88rem; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .brand-card { min-width: 80px; padding: 10px 8px; border-radius: 12px; }
          .car-card { min-width: 190px; }
          .car-image { height: 115px; }
        }

        @media (max-width: 480px) {
          .stat-value { font-size: 1.3rem; }
          .welcome-title { font-size: 1.05rem; }
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

      {/* Hãng xe nổi bật */}
      <div className="section-card">
        <div className="section-head">
          <h2 className="section-title">Hãng xe nổi bật</h2>
          <div className="section-link">Xem thêm</div>
        </div>
        <div className="brand-list">
          {/* Tất cả */}
          <div
            className={`brand-card ${selectedBrand === "all" ? "active" : ""}`}
            onClick={() => setSelectedBrand("all")}
          >
            <div className="brand-icon">▦</div>
            <div className="brand-name">Tất cả</div>
          </div>

          {/* Các hãng từ mockdata */}
          {carBrands.map((brandItem) => {
            const brandId = brandItem.brand.toLowerCase();
            return (
              <div
                key={brandId}
                className={`brand-card ${selectedBrand === brandId ? "active" : ""}`}
                onClick={() => setSelectedBrand(brandId)}
              >
                <div className="brand-icon">
                  <img
                    src={`https://beepaway.com/images/manufacturers/${brandId}.png`}
                    alt={brandItem.brand}
                    style={{
                      width: "45px",
                      height: "45px",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div className="brand-name">{brandItem.brand}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Xe của tôi */}
      <div className="section-card">
        <div className="section-head">
          <h2 className="section-title">
            Xe của tôi
            {selectedBrand !== "all" && ` - ${selectedBrand.toUpperCase()}`}
          </h2>
          <div
            className="section-link"
            onClick={() => navigate("/admin/add-car")}
          >
            + Thêm xe
          </div>
        </div>
        <div className="car-list">
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <div className="car-card" key={car.id || car.licensePlate}>
                <img
                  src={
                    car.thumbnail ? car.thumbnail : "/images/default-car.jpg"
                  }
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
                    {car.pricePerDay?.toLocaleString("vi-VN")} / ngày
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                padding: "40px 20px",
                color: "#6b7280",
                textAlign: "center",
                width: "100%",
              }}
            >
              Không có xe nào thuộc hãng này.
            </p>
          )}
        </div>
      </div>

      {/* Đơn hàng gần đây */}
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
