import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerHeader from "../components/CustomerHeader.jsx";
import Footer from "../components/Footer.jsx";
import { getFavoriteCars, toggleFavorite } from "../services/carsService";
import { ArrowLeft, Heart } from "lucide-react";

function FavoriteCars() {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") return "Liên hệ";
    return `${Number(value).toLocaleString("vi-VN")}đ/ngày`;
  };

  const getTransmissionLabel = (car) => {
    const value = car.transmissionTypeName || car.transmission || "";
    switch (String(value).toLowerCase()) {
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
    switch (String(value).toLowerCase()) {
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
      isFavorite: true,
    };
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getFavoriteCars();
      const rawCars = Array.isArray(data) ? data : data?.items || [];
      setCars(rawCars.map(normalizeCar));
    } catch (err) {
      setError(err.message || "Không tải được danh sách yêu thích.");
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (e, carId) => {
    e.stopPropagation();

    try {
      setProcessingId(carId);

      await toggleFavorite(carId);

      setCars((prev) => prev.filter((car) => car.id !== carId));
    } catch (err) {
      alert(err.message || "Cập nhật yêu thích thất bại");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <style>{`
        .favorite-page {
          min-height: 100vh;
          background: #fff;
        }

        .page-container {
          width: min(1400px, calc(100% - 120px));
          margin: 0 auto;
        }

        .favorite-section {
          padding: 28px 0 80px;
        }

        .favorite-topbar {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 14px 18px;
          margin-bottom: 28px;
        }

        .favorite-back-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .favorite-topbar-text {
          font-size: 1.05rem;
          font-weight: 700;
          color: #111827;
        }

        .favorite-title {
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
          cursor: pointer;
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
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.96);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .favorite-btn svg {
          color: #ec4899;
          fill: #ec4899;
        }

        .favorite-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .empty-state img {
          width: 180px;
          max-width: 100%;
          margin-bottom: 14px;
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
        }

        @media (max-width: 575.98px) {
          .results-grid {
            grid-template-columns: 1fr;
          }

          .car-image {
            height: 200px;
          }
        }
      `}</style>

      <div className="favorite-page">
        <CustomerHeader />

        <section className="favorite-section">
          <div className="page-container">
            <div className="favorite-topbar">
              <button className="favorite-back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
              </button>
              <div className="favorite-topbar-text">Danh sách xe yêu thích</div>
            </div>

            <h2 className="favorite-title">Xe yêu thích</h2>

            {loading ? (
              <div className="loading-state">Đang tải danh sách yêu thích...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : cars.length === 0 ? (
              <div className="empty-state">
                <img src="/images/empty-search.svg" alt="Không có xe yêu thích" />
                <div>Chưa có xe nào trong danh sách yêu thích</div>
              </div>
            ) : (
              <div className="results-grid">
                {cars.map((car) => (
                  <div
                    className="car-card"
                    key={car.id}
                    onClick={() => navigate(`/cars/${car.id}`)}
                  >
                    <div className="car-image-wrap">
                      <img src={car.image} alt={car.name} className="car-image" />

                      <button
                        className="favorite-btn"
                        onClick={(e) => handleToggleFavorite(e, car.id)}
                        disabled={processingId === car.id}
                        title="Bỏ yêu thích"
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

export default FavoriteCars;