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
        console.log("CarsManager: dữ liệu trả về từ API /cars/my:", data);
        setCars(data);
      } catch (fetchError) {
        console.error("Lỗi khi lấy danh sách xe:", fetchError);
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
        // Cập nhật lại danh sách xe sau khi xóa
        setCars(cars.filter((car) => car.id !== carId));
      } catch (error) {
        console.error("Lỗi khi xóa xe:", error);
        setError("Không thể xóa xe.");
      }
    }
  };

  return (
    <div className="manager-container">
      <style>{`
        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .manager-title { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
        
        .action-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          background: #fff;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
        }

        .search-input {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          outline: none;
        }

        .btn-add {
          background: #16a34a;
          color: #fff;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        .table-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .cars-table { width: 100%; border-collapse: collapse; }
        .cars-table th { background: #f8fafc; padding: 16px; text-align: left; color: #64748b; font-size: 0.9rem; }
        .cars-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b; }

        .status-badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .status-ready { background: #dcfce7; color: #166534; }
        .status-rented { background: #dbeafe; color: #1d4ed8; }
        .status-stopped { background: #fee2e2; color: #991b1b; }
        .status-repair { background: #fee2e2; color: #991b1b; }

        .btn-edit { color: #2563eb; margin-right: 12px; cursor: pointer; border: none; background: none; font-weight: 700; }
        .btn-delete { color: #dc2626; cursor: pointer; border: none; background: none; font-weight: 700; }
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
          className="search-input"
          style={{ flex: "0 0 200px" }}
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

      {loading && <div>Đang tải danh sách xe...</div>}
      {error && (
        <div style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</div>
      )}

      <div className="table-card">
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
            {filteredCars.map((car) => (
              <tr key={car.id}>
                <td>
                  <div style={{ fontWeight: 800 }}>
                    {car.brand} {car.model}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Đời {car.year}
                  </div>
                </td>
                <td>{car.licensePlate || car.plate}</td>
                <td>
                  {(car.pricePerDay || car.price).toLocaleString("vi-VN")} đ
                </td>
                <td>
                  <span
                    className={`status-badge ${getStatusStyle(
                      car.isAvailable ? "Sẵn sàng" : "Đang dừng",
                    )}`}
                  >
                    {car.isAvailable ? "Sẵn sàng" : "Đang dừng"}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CarsManager;
