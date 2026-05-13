import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCar,
  updateCar,
  getCarDetail,
  uploadImage,
  addCarImage,
  uploadToCloudinary,
} from "../../services/carsService";
import { carBrands } from "../../constants/mockdata";

function AddCar() {
  const [images, setImages] = useState({
    front: null,
    back: null,
    interior: null,
    others: null,
  });
  const [carDetails, setCarDetails] = useState({
    licensePlate: "",
    brand: "",
    model: "",
    year: 2024,
    seats: 5,
    transmission: "Automatic",
    fuel: "Gasoline",
    consumption: "",
    address: "",
    description: "",
  });
  const [price, setPrice] = useState({ perDay: 0, overtime: 0 });
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [progress, setProgress] = useState(0);
  const [imageFiles, setImageFiles] = useState({
    front: null,
    back: null,
    interior: null,
    others: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [editingCarId, setEditingCarId] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.type !== "success"));
    }, 5000);
    return () => clearTimeout(timer);
  }, [notifications]);

  const addNotification = (type, message, details = null) => {
    const nid = Date.now();
    setNotifications((prev) => [...prev, { id: nid, type, message, details }]);
    setTimeout(
      () => {
        setNotifications((prev) => prev.filter((n) => n.id !== nid));
      },
      type === "success" ? 5000 : 8000,
    );
  };

  const removeNotification = (nid) => {
    setNotifications((prev) => prev.filter((n) => n.id !== nid));
  };

  useEffect(() => {
    if (!id) return;
    const loadCar = async () => {
      try {
        const car = await getCarDetail(id);
        setEditMode(true);
        setEditingCarId(id);
        if (car.brand) {
          const selectedBrand = carBrands.find((b) => b.brand === car.brand);
          setAvailableModels(selectedBrand ? selectedBrand.models : []);
        }
        setCarDetails({
          licensePlate: car.licensePlate || "",
          brand: car.brand || "",
          model: car.model || "",
          year: car.year || 2024,
          seats: car.seats || 5,
          transmission: car.transmission || "Automatic",
          fuel: car.fuel || "Gasoline",
          consumption: car.fuelConsumption || "",
          address: car.address || "",
          description: car.description || "",
        });
        setPrice({
          perDay: car.pricePerDay || 0,
          overtime: car.overtimePrice || 0,
        });

        if (car.images && car.images.length > 0) {
          const serverImages = {
            front: null,
            back: null,
            interior: null,
            others: null,
          };
          car.images.forEach((img) => {
            if (img.type === 0) serverImages.front = img.url;
            if (img.type === 1) serverImages.back = img.url;
            if (img.type === 2) serverImages.interior = img.url;
            if (img.type === 3) serverImages.others = img.url;
          });
          setImages(serverImages);
        }
      } catch (loadError) {
        addNotification(
          "error",
          "Không tải được dữ liệu xe",
          "Vui lòng thử lại.",
        );
      }
    };
    loadCar();
  }, [id]);

  useEffect(() => {
    if (carDetails.brand) {
      const selectedBrand = carBrands.find((b) => b.brand === carDetails.brand);
      setAvailableModels(selectedBrand ? selectedBrand.models : []);
      if (!editMode) setCarDetails((prev) => ({ ...prev, model: "" }));
    } else {
      setAvailableModels([]);
      setCarDetails((prev) => ({ ...prev, model: "" }));
    }
  }, [carDetails.brand]);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setImages((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
      setImageFiles((prev) => ({ ...prev, [type]: file }));
    }
  };

  const validateForm = () => {
    if (!carDetails.licensePlate.trim()) {
      addNotification("error", "Thiếu thông tin", "Vui lòng nhập biển số xe");
      return false;
    }
    if (!carDetails.brand) {
      addNotification("error", "Thiếu thông tin", "Vui lòng chọn hãng xe");
      return false;
    }
    if (!carDetails.model.trim()) {
      addNotification("error", "Thiếu thông tin", "Vui lòng nhập mẫu xe");
      return false;
    }
    if (!carDetails.address.trim()) {
      addNotification("error", "Thiếu thông tin", "Vui lòng nhập địa chỉ xe");
      return false;
    }
    if (!price.perDay || price.perDay <= 0) {
      addNotification(
        "error",
        "Thiếu thông tin",
        "Vui lòng nhập giá thuê hợp lệ",
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setProgress(10);

    try {
      const uploadedImages = [];
      const imageTypes = [
        { key: "front", type: 0 },
        { key: "back", type: 1 },
        { key: "interior", type: 2 },
        { key: "others", type: 3 },
      ];

      for (let i = 0; i < imageTypes.length; i++) {
        const { key, type } = imageTypes[i];
        if (imageFiles[key]) {
          const imageUrl = await uploadToCloudinary(imageFiles[key]);
          uploadedImages.push({ url: imageUrl, type, sortOrder: i });
        }
        setProgress(10 + ((i + 1) / imageTypes.length) * 50);
      }

      const carPayload = {
        ...carDetails,
        fuelConsumption: parseFloat(carDetails.consumption) || 0,
        pricePerDay: parseInt(price.perDay) || 0,
        overtimePrice: parseInt(price.overtime) || 0,
        year: parseInt(carDetails.year),
        seats: parseInt(carDetails.seats),
      };

      let carId = editMode ? editingCarId : null;
      if (editMode) {
        await updateCar(editingCarId, carPayload);
      } else {
        const carResponse = await createCar(carPayload);
        carId = carResponse.id;
      }

      if (uploadedImages.length > 0) {
        await Promise.all(uploadedImages.map((img) => addCarImage(carId, img)));
      }

      setProgress(100);
      addNotification(
        "success",
        editMode ? "Cập nhật thành công!" : "Thêm xe thành công!",
      );
      setTimeout(() => navigate("/admin/cars"), 1500);
    } catch (error) {
      addNotification("error", "Lỗi", error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="add-car-container">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .add-car-container {
          padding-bottom: 50px;
          font-family: 'Inter', sans-serif;
        }

        /* ── Notifications ── */
        .notifications-container {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 1000;
          max-width: 360px;
          width: calc(100% - 32px);
        }

        .notification {
          background: white;
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border-left: 4px solid;
          animation: slideIn 0.3s ease-out;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .notification.success { border-left-color: #16a34a; }
        .notification.error   { border-left-color: #dc2626; }
        .notification.warning { border-left-color: #d97706; }
        .notification.info    { border-left-color: #2563eb; }

        .notification-icon { font-size: 18px; flex-shrink: 0; }
        .notification-content { flex: 1; min-width: 0; }
        .notification-title { font-weight: 700; font-size: 0.88rem; margin-bottom: 3px; }
        .notification-message { font-size: 0.82rem; color: #64748b; line-height: 1.4; }

        .notification-close {
          background: none; border: none; font-size: 17px; cursor: pointer;
          color: #94a3b8; padding: 0; width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; flex-shrink: 0;
        }

        .notification-close:hover { background: #f1f5f9; color: #475569; }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }

        /* ── Progress Bar ── */
        .progress-container { margin-bottom: 20px; }
        .progress-bar { width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
        .progress-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, #16a34a, #22c55e);
          transition: width 0.3s ease;
        }
        .progress-text { font-size: 0.78rem; color: #64748b; margin-top: 4px; text-align: center; }

        /* ── Page title ── */
        .page-title {
          font-size: 1.8rem;
          font-weight: 900;
          margin-bottom: 22px;
          color: #0f172a;
        }

        /* ── Form sections ── */
        .form-section {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 800;
          margin: 0 0 18px;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .required { color: #dc2626; margin-left: 2px; }

        /* ── Grid layouts ── */
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* ── Input group ── */
        .input-group { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
        .input-group:last-child { margin-bottom: 0; }
        .input-group label { font-weight: 700; color: #334155; font-size: 0.88rem; }

        /* ── Form controls ── */
        input, select, textarea {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          background: white;
        }

        input:focus, select:focus, textarea:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
        }

        input:disabled, select:disabled, textarea:disabled {
          background: #f8fafc;
          cursor: not-allowed;
        }

        /* ── Radio group ── */
        .radio-group { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 5px; }
        .radio-option { display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
        .radio-option input { width: 18px; height: 18px; accent-color: #16a34a; }
        .radio-option input:disabled { cursor: not-allowed; }

        /* ── Image upload grid ── */
        .image-upload-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .upload-box {
          aspect-ratio: 4/3;
          border: 2px dashed #cbd5e1;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.2s, background 0.2s;
        }

        .upload-box:hover { border-color: #16a34a; background: #f0fdf4; }
        .upload-box img { width: 100%; height: 100%; object-fit: cover; }
        .upload-box:has(input:disabled) { cursor: not-allowed; opacity: 0.6; }

        /* ── Price input ── */
        .price-wrapper { position: relative; }
        .currency-label {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-weight: 800;
          color: #94a3b8;
          pointer-events: none;
          font-size: 0.88rem;
        }

        /* ── Submit button ── */
        .btn-submit {
          background: #16a34a;
          color: #fff;
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          font-weight: 800;
          font-size: 1.05rem;
          border: none;
          cursor: pointer;
          margin-top: 8px;
          box-shadow: 0 8px 15px -3px rgba(22, 163, 74, 0.2);
          transition: background 0.2s, transform 0.2s;
        }

        .btn-submit:hover { background: #15803d; transform: translateY(-1px); }
        .btn-submit:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }

        /* ── Tablet: ≤ 1024px ── */
        @media (max-width: 1024px) {
          .grid-3 { grid-template-columns: repeat(2, 1fr); }
          .image-upload-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* ── Mobile: ≤ 768px ── */
        @media (max-width: 768px) {
          .page-title { font-size: 1.4rem; margin-bottom: 16px; }

          .form-section { padding: 16px; border-radius: 16px; margin-bottom: 14px; }
          .section-title { font-size: 1rem; margin-bottom: 14px; }

          .grid-3 { grid-template-columns: 1fr; gap: 0; }
          .grid-2 { grid-template-columns: 1fr; gap: 0; }

          .image-upload-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }

          .radio-group { gap: 14px; }
          .input-group { margin-bottom: 12px; }

          .btn-submit { padding: 14px; font-size: 0.97rem; border-radius: 14px; }
        }

        /* ── Small mobile: ≤ 480px ── */
        @media (max-width: 480px) {
          .page-title { font-size: 1.2rem; }
          .form-section { padding: 14px; }
          .section-title { font-size: 0.95rem; }

          input, select, textarea { padding: 10px 12px; font-size: 0.9rem; }
        }
      `}</style>

      <h1 className="page-title">
        {editMode ? "Sửa thông tin xe" : "Thêm xe vào hệ thống"}
      </h1>

      {/* Progress Bar */}
      {loading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{progress}% hoàn thành</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* THÔNG TIN CƠ BẢN */}
        <div className="form-section">
          <h2 className="section-title">📍 Thông tin cơ bản</h2>

          <div className="grid-3">
            <div className="input-group">
              <label>
                Biển số xe <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 30H-123.45"
                disabled={loading}
                value={carDetails.licensePlate}
                onChange={(e) =>
                  setCarDetails({ ...carDetails, licensePlate: e.target.value })
                }
              />
            </div>

            <div className="input-group">
              <label>
                Hãng xe <span className="required">*</span>
              </label>
              <select
                disabled={loading}
                value={carDetails.brand}
                onChange={(e) =>
                  setCarDetails({ ...carDetails, brand: e.target.value })
                }
              >
                <option value="">Chọn hãng</option>
                {carBrands.map((brandData) => (
                  <option key={brandData.brand} value={brandData.brand}>
                    {brandData.brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>
                Mẫu xe <span className="required">*</span>
              </label>
              <select
                disabled={loading}
                value={carDetails.model}
                onChange={(e) =>
                  setCarDetails({ ...carDetails, model: e.target.value })
                }
              >
                <option value="">Chọn mẫu xe</option>
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-3">
            <div className="input-group">
              <label>
                Năm sản xuất <span className="required">*</span>
              </label>
              <input
                type="number"
                value={carDetails.year}
                disabled={loading}
                onChange={(e) =>
                  setCarDetails({ ...carDetails, year: e.target.value })
                }
              />
            </div>

            <div className="input-group">
              <label>
                Số ghế <span className="required">*</span>
              </label>
              <select
                disabled={loading}
                value={carDetails.seats}
                onChange={(e) =>
                  setCarDetails({ ...carDetails, seats: e.target.value })
                }
              >
                <option value="4">4 chỗ</option>
                <option value="5">5 chỗ</option>
                <option value="7">7 chỗ</option>
              </select>
            </div>

            <div className="input-group">
              <label>
                Truyền động <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="transmission"
                    value="Automatic"
                    checked={carDetails.transmission === "Automatic"}
                    disabled={loading}
                    onChange={(e) =>
                      setCarDetails({
                        ...carDetails,
                        transmission: e.target.value,
                      })
                    }
                  />{" "}
                  Số tự động
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="transmission"
                    value="Manual"
                    checked={carDetails.transmission === "Manual"}
                    disabled={loading}
                    onChange={(e) =>
                      setCarDetails({
                        ...carDetails,
                        transmission: e.target.value,
                      })
                    }
                  />{" "}
                  Số sàn
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* THÔNG SỐ KỸ THUẬT */}
        <div className="form-section">
          <h2 className="section-title">⚡ Thông số kỹ thuật & Vị trí</h2>

          <div className="grid-3">
            <div className="input-group">
              <label>
                Loại nhiên liệu <span className="required">*</span>
              </label>
              <select
                disabled={loading}
                value={carDetails.fuel}
                onChange={(e) =>
                  setCarDetails({ ...carDetails, fuel: e.target.value })
                }
              >
                <option value="Gasoline">Xăng</option>
                <option value="Diesel">Dầu Diesel</option>
                <option value="Electric">Điện</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="input-group">
              <label>Tiêu thụ (Lít/100km)</label>
              <input
                type="text"
                placeholder="Ví dụ: 6.5"
                disabled={loading}
                value={carDetails.consumption}
                onChange={(e) =>
                  setCarDetails({ ...carDetails, consumption: e.target.value })
                }
              />
            </div>

            <div className="input-group">
              <label>
                Địa chỉ xe (Quận/Huyện) <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Quận Cầu Giấy, Hà Nội"
                disabled={loading}
                value={carDetails.address}
                onChange={(e) =>
                  setCarDetails({ ...carDetails, address: e.target.value })
                }
              />
            </div>
          </div>

          <div className="input-group">
            <label>Mô tả chi tiết</label>
            <textarea
              rows="4"
              placeholder="Mô tả tình trạng xe, tiện nghi đi kèm..."
              disabled={loading}
              value={carDetails.description}
              onChange={(e) =>
                setCarDetails({ ...carDetails, description: e.target.value })
              }
            />
          </div>
        </div>

        {/* HÌNH ẢNH */}
        <div className="form-section">
          <h2 className="section-title">🖼️ Hình ảnh chi tiết (4 mặt)</h2>
          <div className="image-upload-grid">
            {[
              { key: "front", label: "Ảnh mặt trước" },
              { key: "back", label: "Ảnh mặt sau" },
              { key: "interior", label: "Ảnh nội thất" },
              { key: "others", label: "Ảnh khác/Thêm" },
            ].map((item) => (
              <label key={item.key} className="upload-box">
                <input
                  type="file"
                  style={{ display: "none" }}
                  accept="image/*"
                  disabled={loading}
                  onChange={(e) => handleImageChange(e, item.key)}
                />
                {images[item.key] ? (
                  <img src={images[item.key]} alt={item.label} />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.8rem" }}>📸</div>
                    <div
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        color: "#64748b",
                        marginTop: "5px",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* GIÁ THUÊ */}
        <div className="form-section">
          <h2 className="section-title">💰 Cấu hình giá</h2>
          <div className="grid-2">
            <div className="input-group">
              <label>
                Giá thuê theo ngày (24h) <span className="required">*</span>
              </label>
              <div className="price-wrapper">
                <input
                  type="number"
                  placeholder="800000"
                  disabled={loading}
                  value={price.perDay}
                  onChange={(e) =>
                    setPrice({ ...price, perDay: e.target.value })
                  }
                />
                <span className="currency-label">VNĐ</span>
              </div>
            </div>

            <div className="input-group">
              <label>Phí quá giờ (Mỗi giờ phát sinh)</label>
              <div className="price-wrapper">
                <input
                  type="number"
                  placeholder="100000"
                  disabled={loading}
                  value={price.overtime}
                  onChange={(e) =>
                    setPrice({ ...price, overtime: e.target.value })
                  }
                />
                <span className="currency-label">VNĐ</span>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading
            ? "⏳ Đang xử lý..."
            : editMode
              ? "Hoàn tất & Cập nhật xe"
              : "Hoàn tất & Đăng ký xe"}
        </button>
      </form>

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification ${notification.type}`}
          >
            <div className="notification-icon">
              {notification.type === "success" && "✅"}
              {notification.type === "error" && "❌"}
              {notification.type === "warning" && "⚠️"}
              {notification.type === "info" && "ℹ️"}
            </div>
            <div className="notification-content">
              <div className="notification-title">{notification.message}</div>
              {notification.details && (
                <div className="notification-message">
                  {notification.details}
                </div>
              )}
            </div>
            <button
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AddCar;
