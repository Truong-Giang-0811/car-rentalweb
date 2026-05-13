import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCar, getMyCars } from "../../services/carsService";
import { carBrands } from "../../constants/mockdata";

function CarsManager() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await getMyCars();
        setCars(data);
      } catch (fetchError) {
        setError(fetchError.message || "Không thể tải dữ liệu xe.");
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Sẵn sàng":
        return "status-ready";
      case "Đang thuê":
        return "status-rented";
      case "Đang dừng":
        return "status-stopped";
      case "Bảo trì":
        return "status-repair";
      default:
        return "";
    }
  };

  const filteredCars = cars.filter((car) => {
    const matchesBrand =
      selectedBrand === "" ||
      car.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (car.licensePlate || car.plate)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const handleDelete = async (carId) => {
    if (window.confirm("Bạn có chắc muốn xóa xe này?")) {
      try {
        await deleteCar(carId);
        setCars(cars.filter((car) => car.id !== carId));
      } catch (error) {
        setError("Không thể xóa xe.");
      }
    }
  };

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

        .btn-add {
          background: #16a34a;
          color: #fff;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          font-size: 0.92rem;
          transition: background 0.2s;
        }

        .btn-add:hover { background: #15803d; }

        /* ── Action bar ── */
        .action-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
          background: #fff;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 140px;
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          outline: none;
          font-size: 0.92rem;
        }

        .search-input:focus { border-color: #16a34a; }

        .brand-select {
          flex: 0 0 auto;
          width: 160px;
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          outline: none;
          font-size: 0.92rem;
          background: white;
        }

        /* ── Table (desktop) ── */
        .table-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        .cars-table { width: 100%; border-collapse: collapse; min-width: 540px; }

        .cars-table th {
          background: #f8fafc;
          padding: 14px 16px;
          text-align: left;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .cars-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          font-weight: 600;
          color: #1e293b;
          vertical-align: middle;
        }

        .cars-table tr:last-child td { border-bottom: none; }
        .cars-table tr:hover td { background: #fafafa; }

        .status-badge {
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          white-space: nowrap;
          display: inline-block;
        }

        .status-ready   { background: #dcfce7; color: #166534; }
        .status-rented  { background: #dbeafe; color: #1d4ed8; }
        .status-stopped { background: #fee2e2; color: #991b1b; }
        .status-repair  { background: #fef3c7; color: #92400e; }

        .btn-edit   { color: #2563eb; margin-right: 12px; cursor: pointer; border: none; background: none; font-weight: 700; }
        .btn-delete { color: #dc2626; cursor: pointer; border: none; background: none; font-weight: 700; }

        /* ── Mobile card list ── */
        .car-card-list { display: none; }

        .car-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 10px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        .cc-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
          gap: 8px;
        }

        .cc-car-name {
          font-weight: 800;
          font-size: 0.97rem;
          color: #0f172a;
          line-height: 1.3;
        }

        .cc-year {
          font-size: 0.78rem;
          color: #64748b;
          margin-top: 2px;
        }

        .cc-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.84rem;
          padding: 5px 0;
          border-bottom: 1px solid #f1f5f9;
          gap: 8px;
        }

        .cc-row:last-of-type { border-bottom: none; }

        .cc-label {
          color: #94a3b8;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .cc-val {
          font-weight: 700;
          color: #1e293b;
          text-align: right;
        }

        .cc-actions {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          justify-content: flex-end;
        }

        .cc-btn {
          border: none;
          border-radius: 8px;
          padding: 7px 16px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .cc-btn-edit   { background: #eff6ff; color: #2563eb; }
        .cc-btn-delete { background: #fef2f2; color: #dc2626; }

        /* ── Mobile: ≤ 768px ── */
        @media (max-width: 768px) {
          .manager-title { font-size: 1.25rem; }
          .table-card { display: none; }
          .car-card-list { display: block; }

          .action-bar { padding: 10px; gap: 8px; }
          .search-input { min-width: 0; }
          .brand-select { width: 100%; }
        }

        @media (max-width: 480px) {
          .manager-title { font-size: 1.1rem; }
          .btn-add { padding: 8px 14px; font-size: 0.85rem; }
        }
      `}</style>

      <div className="manager-header">
        <h1 className="manager-title">Quản lý danh sách xe</h1>
        <button className="btn-add" onClick={() => navigate("/admin/add-car")}>
          + Thêm xe mới
        </button>
      </div>

      <div className="action-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm theo tên xe, biển số..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="brand-select"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="">Tất cả hãng</option>
          {carBrands.map((brandData) => (
            <option key={brandData.brand} value={brandData.brand}>
              {brandData.brand}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{ padding: "12px 0", color: "#64748b" }}>
          Đang tải danh sách xe...
        </div>
      )}
      {error && (
        <div
          style={{ color: "#dc2626", marginBottom: "16px", fontWeight: 600 }}
        >
          {error}
        </div>
      )}

      {/* ── Desktop: Table ── */}
      <div className="table-card">
        <div className="table-scroll">
          <table className="cars-table">
            <thead>
              <tr>
                <th>Thông tin xe</th>
                <th>Biển số</th>
                <th>Giá thuê/Ngày</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                      padding: "32px",
                    }}
                  >
                    Không có xe nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCars.map((car) => {
                  const statusLabel = car.isAvailable
                    ? "Sẵn sàng"
                    : "Đang dừng";
                  return (
                    <tr key={car.id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>
                          {car.brand} {car.model}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          Đời {car.year}
                        </div>
                      </td>
                      <td>{car.licensePlate || car.plate}</td>
                      <td>
                        {(car.pricePerDay || car.price).toLocaleString("vi-VN")}{" "}
                        đ
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusStyle(statusLabel)}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-edit"
                          onClick={() => navigate(`/admin/edit-car/${car.id}`)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(car.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile: Card list ── */}
      <div className="car-card-list">
        {filteredCars.length === 0 && !loading ? (
          <div
            style={{ textAlign: "center", color: "#64748b", padding: "24px 0" }}
          >
            Không có xe nào phù hợp.
          </div>
        ) : (
          filteredCars.map((car) => {
            const statusLabel = car.isAvailable ? "Sẵn sàng" : "Đang dừng";
            return (
              <div className="car-card" key={car.id}>
                <div className="cc-top">
                  <div>
                    <div className="cc-car-name">
                      {car.brand} {car.model}
                    </div>
                    <div className="cc-year">Đời {car.year}</div>
                  </div>
                  <span
                    className={`status-badge ${getStatusStyle(statusLabel)}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="cc-row">
                  <span className="cc-label">Biển số</span>
                  <span className="cc-val">
                    {car.licensePlate || car.plate}
                  </span>
                </div>
                <div className="cc-row">
                  <span className="cc-label">Giá/Ngày</span>
                  <span className="cc-val" style={{ color: "#16a34a" }}>
                    {(car.pricePerDay || car.price).toLocaleString("vi-VN")} đ
                  </span>
                </div>

                <div className="cc-actions">
                  <button
                    className="cc-btn cc-btn-edit"
                    onClick={() => navigate(`/admin/edit-car/${car.id}`)}
                  >
                    Sửa
                  </button>
                  <button
                    className="cc-btn cc-btn-delete"
                    onClick={() => handleDelete(car.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CarsManager;
