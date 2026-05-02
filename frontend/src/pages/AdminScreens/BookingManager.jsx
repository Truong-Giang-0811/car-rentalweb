import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getOwnerBookings,
  approveBooking,
  rejectBooking,
  confirmPickUp,
  completeBooking,
  getBookingDetail,
} from "../../services/bookingsService";

function BookingManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("WaitingForDeposit");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Danh sách các trạng thái
  const tabs = [
    { id: "WaitingForDeposit", label: "Chờ thanh toán", icon: "💰" },
    { id: "Confirmed", label: "Đã xác nhận", icon: "✅" },
    { id: "PickedUp", label: "Đang thuê", icon: "🚗" },
    { id: "Completed", label: "Hoàn thành", icon: "🏁" },
    { id: "Expired", label: "Đã hết hạn", icon: "⏰" },
    { id: "Cancelled", label: "Đã hủy", icon: "🚫" },
  ];

  // Logic lấy dữ liệu (Giả lập)
  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getOwnerBookings();
      // Lọc dữ liệu theo tab hiện tại (activeTab)
      const filtered = data.filter((b) => b.status === activeTab);
      setBookings(filtered);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, action) => {
    try {
      if (action === "approve") await approveBooking(id);
      if (action === "reject") await rejectBooking(id);
      if (action === "pickup") await confirmPickUp(id);
      if (action === "complete") await completeBooking(id);

      alert("Cập nhật trạng thái thành công");
      fetchBookings(); // Load lại danh sách
    } catch (error) {
      alert(error.message);
    }
  };
  const handleViewContract = async (bookingId) => {
    try {
      // 1. Lấy dữ liệu chi tiết của đơn hàng (bao gồm snapshot hợp đồng)
      const fullBooking = await getBookingDetail(bookingId);

      if (!fullBooking.contractSnapshot) {
        alert("Hợp đồng chưa được tạo cho đơn hàng này.");
        return;
      }

      // 2. Logic mở cửa sổ in giống hệt bên BookingDetail
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Hợp đồng thuê xe - ${fullBooking.id}</title>
            <style>
              body { font-family: 'Be Vietnam Pro', sans-serif; padding: 40px; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 30px; }
              .content { white-space: pre-wrap; font-size: 14px; }
              .footer { margin-top: 50px; display: flex; justify-content: space-between; }
              .signature { text-align: center; width: 200px; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h1>
              <p>Độc lập - Tự do - Hạnh phúc</p>
              <hr/>
              <h2>HỢP ĐỒNG THUÊ XE TỰ LÁI</h2>
            </div>
            <div class="content">${fullBooking.contractSnapshot}</div>
            <div class="footer">
              <div class="signature">
                <p><strong>BÊN CHO THUÊ</strong></p>
                <p>(Ký và ghi rõ họ tên)</p>
                <br/><br/>
                <p>${fullBooking.ownerNameSnapshot}</p>
              </div>
              <div class="signature">
                <p><strong>BÊN THUÊ</strong></p>
                <p>(Ký và ghi rõ họ tên)</p>
                <br/><br/>
                <p>${fullBooking.customerNameSnapshot}</p>
              </div>
            </div>
            <script>
              // Đợi nội dung load xong rồi hiện hộp thoại in
              window.onload = () => {
                window.print();
                // window.close(); // Có thể đóng tab sau khi in xong nếu muốn
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      alert("Lỗi khi tải hợp đồng: " + error.message);
    }
  };

  return (
    <div className="booking-manage-container">
      <style>{`
        .booking-manage-container { font-family: 'Inter', sans-serif; padding: 20px; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 1.8rem; font-weight: 900; color: #0f172a; }

        /* Tabs Styling */
        .tabs-wrapper { 
          display: flex; 
          gap: 12px; 
          background: #f1f5f9; 
          padding: 6px; 
          border-radius: 16px; 
          margin-bottom: 24px;
          overflow-x: auto;
        }
        .tab-item {
          padding: 12px 20px;
          border-radius: 12px;
          cursor: pointer;
          border: none;
          background: transparent;
          font-weight: 700;
          color: #64748b;
          white-space: nowrap;
          transition: 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tab-item.active {
          background: white;
          color: #0f172a;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        /* Booking Card/Table */
        .booking-list { display: flex; flex-direction: column; gap: 16px; }
        .booking-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          padding: 20px;
          display: grid;
          grid-template-columns: 120px 1fr auto;
          gap: 20px;
          align-items: center;
          transition: 0.3s;
        }
        .booking-card:hover { border-color: #16a34a; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }

        .car-thumb {
          width: 120px;
          height: 80px;
          border-radius: 12px;
          object-fit: cover;
          background: #f8fafc;
        }

        .booking-info h3 { margin: 0 0 4px 0; font-size: 1.1rem; color: #1e293b; }
        .booking-meta { display: flex; gap: 16px; font-size: 0.85rem; color: #64748b; }
        .user-info { margin-top: 8px; font-size: 0.9rem; font-weight: 600; color: #334155; }

        .price-tag { text-align: right; }
        .total-amount { display: block; font-size: 1.2rem; font-weight: 800; color: #16a34a; }
        .payment-status { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }

        /* Actions */
        .actions-group { display: flex; gap: 8px; margin-top: 10px; }
        .btn-action {
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          border: none;
          transition: 0.2s;
        }
        .btn-approve { background: #dcfce7; color: #15803d; }
        .btn-reject { background: #fee2e2; color: #b91c1c; }
        .btn-detail { background: #f1f5f9; color: #475569; }
        .btn-action:hover { transform: translateY(-2px); filter: brightness(0.95); }

        .empty-state { text-align: center; padding: 60px; color: #94a3b8; }
      `}</style>

      <div className="page-header">
        <h1>Quản lý đơn thuê</h1>
      </div>

      {/* Bộ chọn trạng thái */}
      <div className="tabs-wrapper">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách đơn hàng */}
      <div className="booking-list">
        {loading ? (
          <div className="empty-state">Đang tải dữ liệu...</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📑</div>
            <p>Không có đơn thuê nào trong mục này</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              {/* 1. Hình ảnh xe */}
              <img
                src={booking.thumbnail || "https://via.placeholder.com/120x80"}
                alt="car"
                className="car-thumb"
              />

              {/* 2. Thông tin chi tiết đơn hàng */}
              <div className="booking-info">
                <h3>{booking.carNameSnapshot}</h3>
                <div className="booking-meta">
                  <span>
                    📅 {new Date(booking.startAt).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(booking.endAt).toLocaleDateString("vi-VN")}
                  </span>
                  {/* Nếu có địa chỉ trong snapshot xe hoặc thông tin khác có thể bổ sung ở đây */}
                </div>
                <div className="user-info">
                  Khách hàng: {booking.customerNameSnapshot}
                </div>

                {/* Nhóm nút bấm điều khiển */}
                <div className="actions-group">
                  {activeTab === "Confirmed" && (
                    <button
                      className="btn-action btn-approve"
                      onClick={() => handleStatusChange(booking.id, "pickup")}
                    >
                      Bàn giao xe
                    </button>
                  )}

                  {activeTab === "PickedUp" && (
                    <button
                      className="btn-action btn-approve"
                      onClick={() => handleStatusChange(booking.id, "complete")}
                    >
                      Xác nhận trả xe
                    </button>
                  )}

                  <button
                    className="btn-action btn-detail"
                    onClick={() => handleViewContract(booking.id)}
                  >
                    Hồ sơ & Hợp đồng
                  </button>
                </div>
              </div>

              {/* 3. Giá tiền và trạng thái thanh toán */}
              <div className="price-tag">
                <span className="total-amount">
                  {booking.totalAmount?.toLocaleString()}đ
                </span>
                <span className="payment-status">
                  {/* Logic hiển thị trạng thái thanh toán từ Enum hoặc status */}
                  {booking.status === "WaitingForDeposit"
                    ? "⏳ Chờ đặt cọc"
                    : booking.status === "Confirmed" ||
                        booking.status === "PickedUp" ||
                        booking.status === "Completed"
                      ? "✅ Đã thanh toán"
                      : "📄 Đơn mới"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BookingManagement;
