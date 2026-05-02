import React, { useState, useEffect } from "react";
// Import các service cần thiết
import {
  getOwnerContracts,
  getBookingDetail,
} from "../../services/bookingsService";

function ContractManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await getOwnerContracts();
      setContracts(data);
    } catch (err) {
      console.error("Lỗi khi tải hợp đồng:", err);
      setError("Không thể tải danh sách hợp đồng.");
    } finally {
      setLoading(false);
    }
  };

  // Logic hiển thị/in hợp đồng giống hệt BookingManager
  const handlePrintContract = async (bookingId) => {
    try {
      // 1. Lấy dữ liệu chi tiết của đơn hàng (bao gồm snapshot hợp đồng)
      const fullBooking = await getBookingDetail(bookingId);

      if (!fullBooking.contractSnapshot) {
        alert("Hợp đồng chưa được tạo cho đơn hàng này.");
        return;
      }

      // 2. Mở cửa sổ in
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Hợp đồng thuê xe - ${fullBooking.contractNumber || fullBooking.id}</title>
            <style>
              body { font-family: 'Be Vietnam Pro', sans-serif; padding: 40px; line-height: 1.6; color: #333; }
              .header { text-align: center; margin-bottom: 30px; }
              .content { white-space: pre-wrap; font-size: 14px; text-align: justify; }
              .footer { margin-top: 50px; display: flex; justify-content: space-between; }
              .signature { text-align: center; width: 250px; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h1>
              <p>Độc lập - Tự do - Hạnh phúc</p>
              <hr/>
              <h2>HỢP ĐỒNG THUÊ XE TỰ LÁI</h2>
              <p>Số: ${fullBooking.contractNumber || "........."}</p>
            </div>
            <div class="content">${fullBooking.contractSnapshot}</div>
            <div class="footer">
              <div class="signature">
                <p><strong>BÊN CHO THUÊ (BÊN A)</strong></p>
                <p>(Ký và ghi rõ họ tên)</p>
                <br/><br/><br/>
                <p><strong>${fullBooking.ownerNameSnapshot || ""}</strong></p>
              </div>
              <div class="signature">
                <p><strong>BÊN THUÊ (BÊN B)</strong></p>
                <p>(Ký và ghi rõ họ tên)</p>
                <br/><br/><br/>
                <p><strong>${fullBooking.customerNameSnapshot || ""}</strong></p>
              </div>
            </div>
            <script>
              window.onload = () => {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      alert("Lỗi khi tải nội dung hợp đồng: " + error.message);
    }
  };

  const filteredContracts = contracts.filter((item) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      item.contractNumber?.toLowerCase().includes(searchStr) ||
      item.customerName?.toLowerCase().includes(searchStr) ||
      item.carName?.toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="contract-container">
      <style>{`
        .contract-container { font-family: 'Inter', sans-serif; padding: 20px; }
        .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .header-flex h1 { font-size: 1.8rem; font-weight: 900; color: #0f172a; margin: 0; }

        .search-box {
          background: white; border: 1px solid #e2e8f0; padding: 10px 18px;
          border-radius: 12px; display: flex; align-items: center; width: 350px;
        }
        .search-box input { border: none; outline: none; width: 100%; font-weight: 500; }

        .contract-table-wrapper {
          background: white; border-radius: 20px; border: 1px solid #e2e8f0;
          overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { background: #f8fafc; padding: 16px 20px; font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
        td { padding: 18px 20px; border-top: 1px solid #f1f5f9; font-size: 0.95rem; color: #1e293b; }
        
        .id-badge { font-family: 'Mono', monospace; font-weight: 700; color: #2563eb; }
        .car-info { font-weight: 700; display: block; }
        .date-info { font-size: 0.85rem; color: #64748b; }

        .action-btns { display: flex; gap: 10px; }
        .btn-icon {
          width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e2e8f0;
          background: white; cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: 0.2s; font-size: 1.1rem;
        }
        .btn-icon:hover { background: #f1f5f9; transform: translateY(-2px); }
        .btn-print { color: #16a34a; }

        .status-message { padding: 40px; text-align: center; color: #64748b; font-weight: 600; }
      `}</style>

      <div className="header-flex">
        <h1>Quản lý hợp đồng</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm số hợp đồng, khách hàng, xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="contract-table-wrapper">
        {loading ? (
          <div className="status-message">
            ⏳ Đang tải danh sách hợp đồng...
          </div>
        ) : error ? (
          <div className="status-message" style={{ color: "#dc2626" }}>
            ❌ {error}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Số hợp đồng</th>
                <th>Khách hàng</th>
                <th>Thông tin xe</th>
                <th>Thời gian thuê</th>
                <th>Tổng tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.length > 0 ? (
                filteredContracts.map((item) => (
                  <tr key={item.bookingId}>
                    <td>
                      <span className="id-badge">{item.contractNumber}</span>
                    </td>
                    <td>{item.customerName}</td>
                    <td>
                      <span className="car-info">{item.carName}</span>
                    </td>
                    <td>
                      <div className="date-info">
                        Từ: {new Date(item.startAt).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="date-info">
                        Đến: {new Date(item.endAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {item.totalAmount?.toLocaleString()}đ
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn-icon btn-print"
                          title="Xem và In hợp đồng"
                          onClick={() => handlePrintContract(item.bookingId)}
                        >
                          🖨️
                        </button>
                        <button
                          className="btn-icon"
                          title="Xem chi tiết đơn"
                          style={{ color: "#64748b" }}
                        >
                          👁️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="status-message">
                    Không tìm thấy dữ liệu phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ContractManagement;
