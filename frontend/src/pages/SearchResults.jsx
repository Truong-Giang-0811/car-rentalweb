import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomerHeader from "../components/CustomerHeader.jsx";
import Footer from "../components/Footer.jsx";
import { searchPublicCars, getFavoriteCars, toggleFavorite, } from "../services/carsService";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);
  const token = localStorage.getItem("token");

  const requireLogin = () => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để dùng tính năng này ❤️");
      return false;
    }
    return true;
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      searchLocation: params.get("location") || "",
      startDate: params.get("startDate") || "",
      endDate: params.get("endDate") || "",
    };
  }, [location.search]);

  const formatDisplayDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") return "Liên hệ";
    return `${Number(value).toLocaleString("vi-VN")}đ/ngày`;
  };

  const getTransmissionLabel = (car) => {
    const value = car.transmissionTypeName || car.transmission || "";
    switch (value.toLowerCase()) {
      case "automatic":
        return "Số tự động";
      case "manual":
        return "Số sàn";
      default:
        return value || "Số tự động";
    }
  };

  const getFuelLabel = (car) => {
    const value = car.fuelTypeName || car.fuel || "";
    switch (value.toLowerCase()) {
      case "gasoline":
      case "petrol":
        return "Xăng";
      case "diesel":
        return "Dầu";
      case "electric":
        return "Điện";
      case "hybrid":
        return "Hybrid";
      default:
        return value || "Xăng";
    }
  };

  const getLocationLabel = (car) => {
    return (
      car.location ||
      car.address ||
      car.city ||
      car.province ||
      "Chưa cập nhật địa chỉ"
    );
  };

  const getCarImage = (car) => {
    const imagePath =
      car.thumbnail ||
      car.image ||
      car.imageUrl ||
      car.images?.[0]?.imageUrl ||
      car.images?.[0]?.url ||
      car.carImages?.[0]?.imageUrl ||
      car.carImages?.[0]?.url ||
      null;

    if (!imagePath) return "/images/car-placeholder.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  const normalizeCar = (car) => {
    const brand = car.brand || car.brandName || "";
    const model = car.model || car.modelName || "";
    const year = car.year || "";

    return {
      id: car.id,
      name: `${brand} ${model} ${year}`.trim() || "Chưa cập nhật tên xe",
      image: getCarImage(car),
      transmission: getTransmissionLabel(car),
      seats: `${car.seats || 4} chỗ`,
      fuel: getFuelLabel(car),
      location: getLocationLabel(car),
      rating: "5.0",
      trips: "0 chuyến",
      price: formatPrice(car.pricePerDay || car.price),
    };
  };

  const handleToggleFavorite = async (e, carId) => {
    e.stopPropagation();

    if (!requireLogin()) return;

    try {
      setFavoriteLoadingId(carId);

      await toggleFavorite(carId);

      setFavoriteIds((prev) =>
        prev.includes(carId)
          ? prev.filter((id) => id !== carId)
          : [...prev, carId]
      );
    } catch (err) {
      console.error("Lỗi toggle favorite:", err);
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await getFavoriteCars();
        console.log("favorite response =", data);
        const rawCars = Array.isArray(data) ? data : data?.items || [];
        setFavoriteIds(rawCars.map((car) => car.id));
      } catch (err) {
        console.error("Lỗi lấy favorite:", err);
        setFavoriteIds([]);
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await searchPublicCars({
          location: queryParams.searchLocation,
          startDate: queryParams.startDate,
          endDate: queryParams.endDate,
        });

        const rawCars = Array.isArray(data) ? data : data?.items || [];
        setCars(rawCars.map(normalizeCar));
      } catch (err) {
        setError(err.message || "Không tìm thấy xe phù hợp.");
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [queryParams]);

  return (
    <>
      <style>{`
        .search-results-page {
          min-height: 100vh;
          background: #fff;
        }

        .page-container {
          width: min(1400px, calc(100% - 120px));
          margin: 0 auto;
        }

        .result-topbar {
          width: 100%;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          padding: 16px 0;
        }

        .result-topbar-content {
          display: flex;
          align-items: center;
          gap: 18px;
          min-height: 48px;
        }

        .result-back-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: #fff;
          font-size: 1.1rem;
          cursor: pointer;
          flex-shrink: 0;
        }

        .result-back-btn:hover {
          background: #f9fafb;
        }

        .result-summary-info {
          display: flex;
          align-items: center;
          gap: 26px;
          flex-wrap: wrap;
        }

        .result-summary-item {
          font-size: 1.02rem;
          font-weight: 600;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .result-section {
          padding: 28px 0 80px;
        }

        .results-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 20px;
          color: #111827;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .car-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 12px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
          transition: 0.25s ease;
        }

        .car-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.1);
        }

        .car-image-wrap {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .car-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
        }

        .favorite-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .favorite-btn svg {
          color: #9ca3af;
          fill: transparent;
        }

        .favorite-btn.active svg {
          color: #ec4899;
          fill: #ec4899;
        }

        .car-badge-top {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(107, 114, 128, 0.85);
          color: #facc15;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .car-tags {
          display: flex;
          gap: 8px;
          flex-wrap: nowrap;
          margin-bottom: 8px;
          overflow: hidden;
        }

        .car-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 0.85rem;
          color: #4b5563;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        .car-name {
          font-size: 1rem;
          font-weight: 800;
          color: #111827;
          text-transform: uppercase;
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .car-specs {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 6px;
        }

        .car-location {
          color: #4b5563;
          font-size: 0.9rem;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .car-divider {
          height: 1px;
          background: #e5e7eb;
          margin-bottom: 10px;
        }

        .car-bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
        }

        .car-rating {
          color: #4b5563;
          font-size: 0.95rem;
        }

        .car-price {
          color: #22c55e;
          font-size: 1.05rem;
          font-weight: 800;
        }

        .empty-state,
        .error-state,
        .loading-state {
          padding: 60px 20px;
          text-align: center;
          color: #6b7280;
        }

        .empty-state {
          padding: 70px 20px;
        }

        .empty-state img,
        .error-state img {
          width: 180px;
          max-width: 100%;
          height: auto;
          margin-bottom: 20px;
          object-fit: contain;
        }

        .empty-state-title,
        .error-state-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .empty-state-text,
        .error-state-text {
          font-size: 1rem;
          color: #6b7280;
        }

        @media (max-width: 1199.98px) {
          .results-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 991.98px) {
          .results-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .page-container {
            width: calc(100% - 28px);
          }

          .result-topbar-content {
            align-items: flex-start;
          }

          .result-summary-info {
            gap: 14px;
          }
        }

        @media (max-width: 575.98px) {
          .results-grid {
            grid-template-columns: 1fr;
          }

          .car-image {
            height: 200px;
          }

          .results-title {
            font-size: 1.7rem;
          }
        }
      `}</style>

      <div className="search-results-page">
        <CustomerHeader />

        <div className="result-topbar">
          <div className="page-container">
            <div className="result-topbar-content">
              <button className="result-back-btn" onClick={() => navigate(-1)}>
                ←
              </button>

              <div className="result-summary-info">
                <div className="result-summary-item">
                  <span>📍</span>
                  <span>{queryParams.searchLocation || "Tất cả địa điểm"}</span>
                </div>

                <div className="result-summary-item">
                  <span>📅</span>
                  <span>
                    {formatDisplayDateTime(queryParams.startDate)} -{" "}
                    {formatDisplayDateTime(queryParams.endDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="result-section">
          <div className="page-container">
            <h2 className="results-title">Danh sách xe phù hợp</h2>

            {loading ? (
              <div className="loading-state">Đang tải danh sách xe...</div>
            ) : error ? (
              <div className="error-state">
                <img src="/images/empty-search.svg" alt="Không tìm thấy" />
                <div className="error-state-title">Không tìm thấy xe phù hợp</div>
                <div className="error-state-text">{error}</div>
              </div>
            ) : cars.length === 0 ? (
              <div className="empty-state">
                <img src="/images/empty-search.svg" alt="Không tìm thấy" />
                <div className="empty-state-title">Không tìm thấy xe phù hợp</div>
                <div className="empty-state-text">
                  Hãy thử thay đổi địa điểm hoặc thời gian thuê để xem thêm kết quả.
                </div>
              </div>
            ) : (
              <div className="results-grid">
                {cars.map((car) => (
                  <div className="car-card" key={car.id}
                        onClick={() =>
                          navigate(
                            `/cars/${car.id}?startDate=${encodeURIComponent(queryParams.startDate)}&endDate=${encodeURIComponent(queryParams.endDate)}&location=${encodeURIComponent(queryParams.searchLocation)}`
                          )
                        }
                        style={{ cursor: "pointer" }}>
                    
                    <div className="car-image-wrap">
                      <img src={car.image} alt={car.name} className="car-image" />
                      <button
                        className={`favorite-btn ${favoriteIds.includes(car.id) ? "active" : ""}`}
                        onClick={(e) => handleToggleFavorite(e, car.id)}
                        disabled={favoriteLoadingId === car.id}
                      >
                        <Heart size={18} />
                      </button>
                      <div className="car-badge-top">⚡</div>
                    </div>

                    <div className="car-tags">
                      <span className="car-tag">🛡 Miễn thế chấp</span>
                      <span className="car-tag">📍 Giao xe tận nơi</span>
                    </div>

                    <div className="car-name">{car.name}</div>

                    <div className="car-specs">
                      <span>⚙ {car.transmission}</span>
                      <span>🪑 {car.seats}</span>
                      <span>⛽ {car.fuel}</span>
                    </div>

                    <div className="car-location">📍 {car.location}</div>

                    <div className="car-divider"></div>

                    <div className="car-bottom">
                      <div className="car-rating">
                        ⭐ {car.rating} • 🚗 {car.trips}
                      </div>
                      <div className="car-price">{car.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default SearchResults;