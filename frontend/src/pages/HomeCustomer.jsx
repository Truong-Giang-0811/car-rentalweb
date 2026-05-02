import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerHeader from "../components/CustomerHeader.jsx";
import Footer from "../components/Footer.jsx";
import { searchPublicCars } from "../services/carsService";
import LocationAutocomplete from "../components/LocationAutocomplete.jsx";
import RentalDateModal from "../components/RentalDateModal.jsx";

function HomeCustomer() {
  const navigate = useNavigate();

  const banners = [
    "/images/banner-1.jpg",
    "/images/banner-2.jpg",
    "/images/banner-3.jpeg",
  ];

  const promotions = [
    "/images/promo-1.jpg",
    "/images/promo-2.jpg",
    "/images/promo-3.jpg",
    "/images/promo-4.jpg",
    "/images/promo-5.jpg",
  ];

  const locations = [
    {
      id: 1,
      name: "TP. Hồ Chí Minh",
      count: "5000+ xe",
      image: "/images/location-1.jpg",
    },
    {
      id: 2,
      name: "Hà Nội",
      count: "2500+ xe",
      image: "/images/location-2.jpg",
    },
    {
      id: 3,
      name: "Đà Nẵng",
      count: "500+ xe",
      image: "/images/location-3.jpg",
    },
    {
      id: 4,
      name: "Phú Thọ",
      count: "500+ xe",
      image: "/images/location-4.jpg",
    },
    {
      id: 5,
      name: "Vĩnh Phúc",
      count: "300+ xe",
      image: "/images/location-5.jpg",
    },
    {
      id: 6,
      name: "Ninh Bình",
      count: "400+ xe",
      image: "/images/location-6.jpg",
    },
    {
      id: 7,
      name: "Nam Định",
      count: "350+ xe",
      image: "/images/location-7.jpg",
    },
    {
      id: 8,
      name: "Vũng Tàu",
      count: "450+ xe",
      image: "/images/location-8.jpg",
    },
  ];

  const advantages = [
    {
      id: 1,
      image: "/images/advantage-1.svg",
      title: "Lái xe an toàn cùng Kongcars",
      description:
        "Chuyến đi trên Kongcars được bảo vệ với Gói bảo hiểm thuê xe tự lái MIC & DBV (VNI). Khách thuê sẽ chỉ bồi thường tối đa 2.000.000VNĐ trong trường hợp có sự cố ngoài ý muốn.",
    },
    {
      id: 2,
      image: "/images/advantage-2.svg",
      title: "An tâm đặt xe",
      description:
        "Không tính phí huỷ chuyến trong vòng 1h sau khi thanh toán giữ chỗ. Hoàn tiền giữ chỗ và bồi thường 100% nếu chủ xe huỷ chuyến trong vòng 7 ngày trước chuyến đi.",
    },
    {
      id: 3,
      image: "/images/advantage-3.svg",
      title: "Thủ tục đơn giản",
      description:
        "Chỉ cần có CCCD gắn chip (Hoặc Passport) & Giấy phép lái xe là bạn đã đủ điều kiện thuê xe trên Kongcars.",
    },
    {
      id: 4,
      image: "/images/advantage-4.svg",
      title: "Thanh toán dễ dàng",
      description:
        "Đa dạng hình thức thanh toán: ATM, thẻ Visa & Ví điện tử (Momo, VnPay, ZaloPay).",
    },
    {
      id: 5,
      image: "/images/advantage-5.svg",
      title: "Giao xe tận nơi",
      description:
        "Bạn có thể lựa chọn giao xe tận nhà/sân bay. Phí tiết kiệm chỉ từ 15k/km.",
    },
    {
      id: 6,
      image: "/images/advantage-6.svg",
      title: "Dòng xe đa dạng",
      description:
        "Hơn 100 dòng xe cho bạn tuỳ lựa chọn: Mini, Sedan, CUV, SUV, MPV, Bán tải.",
    },
  ];

  const rentalSteps = [
    {
      id: "01",
      image: "/images/step-1.svg",
      title: "Đặt xe trên app/web Kongcars",
    },
    {
      id: "02",
      image: "/images/step-2.svg",
      title: "Nhận xe",
    },
    {
      id: "03",
      image: "/images/step-3.svg",
      title: "Bắt đầu hành trình",
    },
    {
      id: "04",
      image: "/images/step-4.svg",
      title: "Trả xe & kết thúc chuyến đi",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [location, setLocation] = useState("");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [returnDateTime, setReturnDateTime] = useState("");
  const [rentalTime, setRentalTime] = useState("Chọn thời gian thuê");
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [promoIndex, setPromoIndex] = useState(0);
  const [locationIndex, setLocationIndex] = useState(0);
  const [featuredCars, setFeaturedCars] = useState([]);

  const visiblePromoCount = 3;
  const visibleLocationCount = 4;

  useEffect(() => {
    const now = new Date();
    now.setSeconds(0, 0);

    const minutes = now.getMinutes();
    if (minutes === 0 || minutes === 30) {
      // giữ nguyên
    } else if (minutes < 30) {
      now.setMinutes(30);
    } else {
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
    }

    const end = new Date(now);
    end.setDate(end.getDate() + 1);

    const formatInputValue = (date) => {
      const pad = (n) => String(n).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const formatDisplayValue = (start, end) => {
      const formatOne = (d) =>
        new Date(d).toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

      return `${formatOne(start)} - ${formatOne(end)}`;
    };

    const startValue = formatInputValue(now);
    const endValue = formatInputValue(end);

    setPickupDateTime(startValue);
    setReturnDateTime(endValue);
    setRentalTime(formatDisplayValue(startValue, endValue));
  }, []);

  const validateSearch = () => {
    if (!location.trim()) {
      return "Vui lòng nhập địa điểm.";
    }

    if (!pickupDateTime || !returnDateTime) {
      return "Vui lòng chọn thời gian thuê.";
    }

    const start = new Date(pickupDateTime);
    const end = new Date(returnDateTime);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 1) {
      return "Thời gian thuê tối thiểu là 1 ngày.";
    }

    if (diffDays > 30) {
      return "Giới hạn thời gian thuê xe tối đa 30 ngày. Bạn vui lòng điều chỉnh lại thời gian phù hợp";
    }

    return "";
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners.length]);

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

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const data = await searchPublicCars("");
        const cars = Array.isArray(data) ? data : data?.items || [];
        const normalizedCars = cars.slice(0, 8).map(normalizeCar);
        setFeaturedCars(normalizedCars);
      } catch (error) {
        console.error("Lỗi lấy xe public:", error);
        setFeaturedCars([]);
      }
    };

    fetchFeaturedCars();
  }, []);

  const handleSearch = () => {
    const message = validateSearch();
    setSearchError(message);

    if (message) return;

    const query = new URLSearchParams({
      location,
      startDate: pickupDateTime,
      endDate: returnDateTime,
    });

    navigate(`/search?${query.toString()}`);
  };

  const handlePrevPromo = () => {
    setPromoIndex((prev) =>
      prev <= 0 ? promotions.length - visiblePromoCount : prev - 1
    );
  };

  const handleNextPromo = () => {
    setPromoIndex((prev) =>
      prev >= promotions.length - visiblePromoCount ? 0 : prev + 1
    );
  };

  const handlePrevLocation = () => {
    setLocationIndex((prev) =>
      prev <= 0 ? locations.length - visibleLocationCount : prev - 1
    );
  };

  const handleNextLocation = () => {
    setLocationIndex((prev) =>
      prev >= locations.length - visibleLocationCount ? 0 : prev + 1
    );
  };

  const displayCars = [
    ...featuredCars,
    ...Array.from({ length: Math.max(0, 8 - featuredCars.length) }, () => null),
  ].slice(0, 8);

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background-color: #f8f9fa;
          color: #1f2937;
        }

        .page-container {
          width: min(1400px, calc(100% - 120px));
          margin: 0 auto;
        }

        .home-page {
          min-height: 100vh;
          background: #ffffff;
        }

        .hero-section {
          padding: 26px 0 110px;
        }

        .hero-wrapper {
          position: relative;
          border-radius: 28px;
          overflow: visible;
        }

        .hero-banner {
          height: 650px;
          border-radius: 28px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
          overflow: hidden;
          transition: background-image 0.6s ease-in-out;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.18),
            rgba(0, 0, 0, 0.35)
          );
        }

        .hero-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #fff;
          padding: 20px;
          z-index: 2;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.2;
          max-width: 900px;
          margin-bottom: 18px;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
        }

        .hero-divider {
          width: 280px;
          height: 2px;
          background: rgba(255, 255, 255, 0.8);
          margin: 10px auto 24px;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          font-weight: 500;
          max-width: 900px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .hero-subtitle .highlight {
          color: #4ade80;
          font-weight: 800;
        }

        .search-panel {
          position: absolute;
          left: 50%;
          bottom: -60px;
          transform: translateX(-50%);
          width: min(1180px, calc(100% - 40px));
          z-index: 20;
        }

        .search-card {
          border-radius: 24px;
          overflow: visible;
          box-shadow: 0 18px 40px rgba(17, 24, 39, 0.14);
          border: 1px solid #e5e7eb;
          background: #fff;
        }

        .search-header {
          background: linear-gradient(135deg, #22c55e, #4ade80);
          color: #fff;
          text-align: center;
          font-size: 1.4rem;
          font-weight: 800;
          padding: 16px;
          border-top-left-radius: 24px;   /* 👈 thêm */
          border-top-right-radius: 24px;  /* 👈 thêm */
        }

        .search-body {
          background: #ffffff;
          padding: 18px 20px;
          position: relative;
          overflow: visible;
          border-bottom-left-radius: 24px;   
          border-bottom-right-radius: 24px;  

        }

        .search-grid {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          align-items: center;
        }

        .search-item {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 6px 12px;
          border-radius: 12px;
        }

        .search-item + .search-item {
          border-left: 1px solid #e5e7eb;
        }

        .search-icon {
          font-size: 1.35rem;
          line-height: 1;
          margin-top: 4px;
        }

        .search-label {
          color: #6b7280;
          font-size: 0.98rem;
          margin-bottom: 6px;
        }

        .search-select,
        .search-input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 1.15rem;
          font-weight: 700;
          color: #111827;
          background: transparent;
          padding: 0;
        }

        .search-btn {
          min-width: 126px;
          height: 55px;
          border: none;
          border-radius: 16px;
          background: #5bd48a;
          color: white;
          font-size: 1.35rem;
          font-weight: 800;
          padding: 0 20px;
          transition: 0.2s ease;
        }

        .search-btn:hover {
          background: #45c574;
        }

        .promo-section {
          padding: 40px 0 80px;
        }

        .promo-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .promo-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .promo-subtitle {
          font-size: 1.2rem;
          color: #4b5563;
        }

        .promo-wrapper {
          position: relative;
        }

        .promo-slider {
          overflow: hidden;
          margin: 0 -12px;
        }

        .promo-track {
          display: flex;
          transition: transform 0.55s ease;
          will-change: transform;
        }

        .promo-card {
          flex: 0 0 calc(100% / 3);
          padding: 0 12px;
        }

        .promo-card-inner {
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: 0.3s;
        }

        .promo-card-inner:hover {
          transform: translateY(-4px);
        }

        .promo-card img {
          width: 100%;
          height: 280px;
          object-fit: cover;
          display: block;
        }

        .promo-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          background: #fff;
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
          cursor: pointer;
          font-size: 20px;
          z-index: 3;
        }

        .promo-btn.left {
          left: -20px;
        }

        .promo-btn.right {
          right: -20px;
        }

        .promo-btn:hover {
          background: #f3f4f6;
        }

        .featured-section {
          padding: 20px 0 80px;
        }

        .featured-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .featured-title {
          font-size: 3.4rem;
          font-weight: 800;
          color: #111827;
          margin: 0;
        }

        .featured-grid {
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

        .car-card-placeholder {
          border: 1px dashed #d1d5db;
          background: #f9fafb;
          box-shadow: none;
        }

        .car-card-placeholder:hover {
          transform: none;
          box-shadow: none;
        }

        .car-placeholder-inner {
          min-height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-weight: 600;
          text-align: center;
          padding: 20px;
        }

        .car-image-wrap {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 14px;
        }

        .car-image {
          width: 100%;
          height: 255px;
          object-fit: cover;
          display: block;
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
          gap: 10px;
          flex-wrap: nowrap;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .car-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 0.9rem;
          color: #4b5563;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
        }

        .car-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: #111827;
          text-transform: uppercase;
          margin-bottom: 10px;
          line-height: 1.4;
        }

        .car-specs {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          color: #6b7280;
          font-size: 0.96rem;
          margin-bottom: 12px;
        }

        .car-location {
          color: #4b5563;
          font-size: 0.97rem;
          margin-bottom: 14px;
          line-height: 1.5;
        }

        .car-divider {
          height: 1px;
          background: #e5e7eb;
          margin-bottom: 14px;
        }

        .car-bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
        }

        .car-rating {
          color: #4b5563;
          font-size: 0.98rem;
        }

        .car-price-box {
          text-align: right;
        }

        .car-price {
          color: #22c55e;
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .location-section {
          padding: 20px 0 90px;
        }

        .location-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .location-title {
          font-size: 3.2rem;
          font-weight: 800;
          color: #111827;
          margin: 0;
        }

        .location-wrapper {
          position: relative;
        }

        .location-slider {
          overflow: hidden;
          margin: 0 -12px;
        }

        .location-track {
          display: flex;
          transition: transform 0.55s ease;
          will-change: transform;
        }

        .location-card {
          flex: 0 0 calc(100% / 4);
          padding: 0 12px;
        }

        .location-card-inner {
          position: relative;
          height: 500px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          clip-path: url(#locationClip);
          border-radius: 10px;
        }

        .location-card-inner::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0);
          transition: background 0.25s ease;
          z-index: 1;
        }

        .location-card-inner:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 38px rgba(15, 23, 42, 0.16);
        }

        .location-card-inner:hover::after {
          background: rgba(0, 0, 0, 0.14);
        }

        .location-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .location-info {
          position: absolute;
          left: 22px;
          bottom: 24px;
          color: #fff;
          z-index: 2;
        }

        .location-name {
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .location-count {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.92);
        }

        .location-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.86);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
          cursor: pointer;
          font-size: 1.5rem;
          z-index: 3;
        }

        .location-btn.left {
          left: -26px;
        }

        .location-btn.right {
          right: -26px;
        }

        .location-btn:hover {
          background: #ffffff;
        }

        .advantages-section {
          padding: 20px 0 100px;
        }

        .advantages-header {
          text-align: center;
          margin-bottom: 44px;
        }

        .advantages-title {
          font-size: 3rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 12px;
        }

        .advantages-subtitle {
          font-size: 1.2rem;
          color: #4b5563;
          line-height: 1.6;
          max-width: 520px;
          margin: 0 auto;
        }

        .advantages-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 46px 54px;
        }

        .advantage-card {
          text-align: center;
        }

        .advantage-image-wrap {
          width: 170px;
          height: 170px;
          margin: 0 auto 22px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .advantage-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .advantage-title {
          font-size: 1.7rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }

        .advantage-description {
          font-size: 1rem;
          line-height: 1.7;
          color: #374151;
          max-width: 360px;
          margin: 0 auto;
        }

        .insurance-section {
          padding: 20px 0 100px;
        }

        .insurance-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          border-radius: 24px;
          overflow: hidden;
        }

        .insurance-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          display: block;
        }

        .insurance-content {
          position: absolute;
          left: 250px;
          top: 35%;
          transform: translateY(-50%);
          color: #fff;
          z-index: 2;
          max-width: 400px;
        }

        .insurance-brand {
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .insurance-title {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .insurance-subtitle {
          font-size: 1.2rem;
          margin-bottom: 20px;
        }

        .insurance-btn {
          display: inline-block;
          padding: 10px 18px;
          background: #ffffff;
          color: #22c55e;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.25s;
        }

        .insurance-btn:hover {
          background: #f0fdf4;
        }

        .insurance-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .insurance-main-title {
          font-size: 2.8rem;
          font-weight: 800;
          color: #111827;
        }

        .steps-section {
          padding: 20px 0 100px;
        }

        .steps-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .steps-title {
          font-size: 3rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 14px;
        }

        .steps-subtitle {
          font-size: 1.2rem;
          color: #4b5563;
          line-height: 1.6;
          max-width: 720px;
          margin: 0 auto;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 36px;
        }

        .step-card {
          text-align: center;
        }

        .step-image-wrap {
          width: 230px;
          height: 230px;
          margin: 0 auto 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .step-text {
          max-width: 290px;
          margin: 0 auto;
          line-height: 1.4;
        }

        .step-number {
          font-size: 1.95rem;
          font-weight: 800;
          color: #5bd48a;
          margin-right: 8px;
        }

        .step-title {
          font-size: 1.9rem;
          font-weight: 800;
          color: #111827;
          display: inline;
        }

        .location-autocomplete {
          position: relative;
          z-index: 200;
        }

        .location-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          z-index: 9999;
          overflow: hidden;
        }

        .location-dropdown-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 12px 14px;
          border: none;
          background: #fff;
          cursor: pointer;
        }

        .location-dropdown-item:hover {
          background: #f9fafb;
        }

        .search-time-btn {
          width: 100%;
          border: none;
          background: transparent;
          text-align: left;
          padding: 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #111827;
          cursor: pointer;
        }

        .warning-icon {
          font-size: 25px;
          line-height: 1;
          flex-shrink: 0;
          margin-top: -6px;
        }

        .search-error-inline {
          display: flex;
          align-items: center;
          gap: 10px;

          margin-top: 10px;
          padding: 12px 14px;

          border-radius: 12px;
          background: #fff7ed;        
          border: 1px solid #fdba74; 
          color: #c2410c;             
        }

        .rental-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.48);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .rental-modal {
          width: min(760px, calc(100% - 24px));
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
        }

        .rental-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .rental-modal-header h3 {
          margin: 0;
          font-size: 1.9rem;
          font-weight: 800;
        }

        .rental-close-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: #fff;
          cursor: pointer;
        }

        .rental-modal-body {
          padding: 24px;
        }

        .rental-mode-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 22px;
          padding-bottom: 12px;
          border-bottom: 3px solid #5bd48a;
          width: fit-content;
        }

        .rental-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .rental-field label {
          display: block;
          font-weight: 700;
          margin-bottom: 8px;
          color: #374151;
        }

        .rental-field input {
          width: 100%;
          height: 50px;
          border-radius: 14px;
          border: 1px solid #d1d5db;
          padding: 0 14px;
          font-size: 1rem;
        }

        .rental-error-box {
          margin-top: 18px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          border-radius: 14px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
        }

        .rental-error-box p {
          margin: 0;
          color: #9a3412;
          font-weight: 600;
          line-height: 1.6;
        }

        .rental-modal-footer {
          padding: 20px 24px 24px;
          display: flex;
          justify-content: flex-end;
        }

        .rental-confirm-btn {
          min-width: 140px;
          height: 48px;
          border: none;
          border-radius: 14px;
          background: #5bd48a;
          color: #fff;
          font-weight: 800;
          cursor: pointer;
        }

        @media (max-width: 1199.98px) {
          .location-title {
            font-size: 2.8rem;
          }

          .location-card {
            flex: 0 0 calc(100% / 3);
          }

          .location-card-inner {
            height: 400px;
          }

          .steps-title {
            font-size: 2.6rem;
          }

          .step-image-wrap {
            width: 200px;
            height: 200px;
          }

          .step-number,
          .step-title {
            font-size: 1.55rem;
          }

          .advantages-title {
            font-size: 2.6rem;
          }

          .advantage-title {
            font-size: 1.45rem;
          }

          .featured-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .featured-title {
            font-size: 2.8rem;
          }

          .hero-title {
            font-size: 3.2rem;
            max-width: 760px;
          }
        }

        @media (max-width: 991.98px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
          }

          .advantages-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 36px 30px;
          }

          .location-card {
            flex: 0 0 calc(100% / 2);
          }

          .location-card-inner {
            height: 400px;
          }

          .featured-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .page-container {
            width: calc(100% - 28px);
          }

          .hero-banner {
            height: 560px;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.05rem;
          }

          .search-panel {
            position: static;
            transform: none;
            width: 100%;
            margin-top: 18px;
          }

          .search-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .search-item + .search-item {
            border-left: none;
            border-top: 1px solid #e5e7eb;
            padding-top: 18px;
          }

          .search-btn {
            width: 100%;
            height: 56px;
            font-size: 1.2rem;
          }
        }

        @media (max-width: 768px) {
          .insurance-image {
            height: 300px;
          }

          .insurance-content {
            left: 20px;
            max-width: 260px;
          }

          .insurance-title {
            font-size: 1.6rem;
          }

          .insurance-subtitle {
            font-size: 1rem;
          }
        }

        @media (max-width: 575.98px) {
          .steps-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .steps-title {
            font-size: 2.2rem;
          }

          .steps-subtitle {
            font-size: 1rem;
          }

          .step-image-wrap {
            width: 180px;
            height: 180px;
          }

          .step-number,
          .step-title {
            font-size: 1.35rem;
          }

          .advantages-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .advantages-title {
            font-size: 2.2rem;
          }

          .advantages-subtitle {
            font-size: 1rem;
          }

          .advantage-image-wrap {
            width: 150px;
            height: 150px;
          }

          .advantage-title {
            font-size: 1.3rem;
          }

          .advantage-description {
            font-size: 0.95rem;
          }

          .location-title {
            font-size: 2.2rem;
          }

          .location-card {
            flex: 0 0 100%;
          }

          .location-card-inner {
            height: 340px;
          }

          .location-btn.left {
            left: -10px;
          }

          .location-btn.right {
            right: -10px;
          }

          .promo-card {
            flex: 0 0 100%;
          }

          .promo-card img {
            height: 220px;
          }

          .featured-grid {
            grid-template-columns: 1fr;
          }

          .featured-title {
            font-size: 2.2rem;
          }

          .car-image {
            height: 220px;
          }

          .hero-section {
            padding: 16px 0 30px;
          }

          .hero-banner {
            height: 470px;
            border-radius: 20px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-divider {
            width: 180px;
          }

          .hero-subtitle {
            font-size: 0.95rem;
          }
        }
      `}</style>

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="locationClip" clipPathUnits="objectBoundingBox">
            <path d="M0,0 H0.55 C0.6,0 1,0.3 1,0.35 V1 H0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="home-page">
        <CustomerHeader />

        <section className="hero-section">
          <div className="page-container">
            <div className="hero-wrapper">
              <div
                className="hero-banner"
                style={{ backgroundImage: `url(${banners[currentSlide]})` }}
              >
                <div className="hero-overlay"></div>

                <div className="hero-content">
                  <h1 className="hero-title">
                    Kongcars - Cùng Bạn Trên
                    <br />
                    Mọi Hành Trình
                  </h1>

                  <div className="hero-divider"></div>

                  <p className="hero-subtitle">
                    Trải nghiệm sự khác biệt từ{" "}
                    <span className="highlight">hơn 10.000</span> xe tự lái đổi
                    mới khắp Việt Nam
                  </p>
                </div>
              </div>

              <div className="search-panel">
                <div className="search-card">
                  <div className="search-header">Tìm xe tự lái</div>

                  <div className="search-body">
                    <div className="search-grid">
                      <div className="search-item">
                        <div className="search-icon">📍</div>
                        <div className="w-100">
                          <div className="search-label">Địa điểm</div>
                          <LocationAutocomplete
                            value={location}
                            onChange={setLocation}
                            placeholder="Nhập địa điểm"
                          />
                        </div>
                      </div>

                      <div className="search-item">
                        <div className="search-icon">📅</div>
                        <div className="w-100">
                          <div className="search-label">Thời gian thuê</div>
                          <button
                            type="button"
                            className="search-time-btn"
                            onClick={() => setShowRentalModal(true)}
                          >
                            {rentalTime}
                          </button>
                        </div>
                      </div>

                      <div className="ps-lg-4 pt-3 pt-lg-0">
                        <button className="search-btn" onClick={handleSearch}>
                          Tìm Xe
                        </button>
                      </div>
                    </div>

                    {searchError && (
                      <div className="search-error-inline">
                        <span className="warning-icon">⚠️</span>
                        <span>{searchError}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="promo-section">
          <div className="page-container">
            <div className="promo-header">
              <h2 className="promo-title">Chương Trình Khuyến Mãi</h2>
              <p className="promo-subtitle">
                Nhận nhiều ưu đãi hấp dẫn từ Kongcars
              </p>
            </div>

            <div className="promo-wrapper">
              <button className="promo-btn left" onClick={handlePrevPromo}>
                ❮
              </button>

              <div className="promo-slider">
                <div
                  className="promo-track"
                  style={{
                    transform: `translateX(-${
                      promoIndex * (100 / visiblePromoCount)
                    }%)`,
                  }}
                >
                  {promotions.map((img, index) => (
                    <div className="promo-card" key={index}>
                      <div className="promo-card-inner">
                        <img src={img} alt={`promo-${index + 1}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="promo-btn right" onClick={handleNextPromo}>
                ❯
              </button>
            </div>
          </div>
        </section>

        <section className="featured-section">
          <div className="page-container">
            <div className="featured-header">
              <h2 className="featured-title">Xe Dành Cho Bạn</h2>
            </div>

            <div className="featured-grid">
              {displayCars.map((car, index) =>
                car ? (
                  <div className="car-card" key={car.id}
                          onClick={() => navigate(`/cars/${car.id}`)}
                          style={{ cursor: "pointer" }}
                  >
                    <div className="car-image-wrap">
                      <img src={car.image} alt={car.name} className="car-image" />
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

                      <div className="car-price-box">
                        <div className="car-price">{car.price}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="car-card car-card-placeholder" key={`empty-${index}`}>
                    <div className="car-placeholder-inner">
                      <span>Đang cập nhật xe mới</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="location-section">
          <div className="page-container">
            <div className="location-header">
              <h2 className="location-title">Địa Điểm Nổi Bật</h2>
            </div>

            <div className="location-wrapper">
              <button className="location-btn left" onClick={handlePrevLocation}>
                ❮
              </button>

              <div className="location-slider">
                <div
                  className="location-track"
                  style={{
                    transform: `translateX(-${
                      locationIndex * (100 / visibleLocationCount)
                    }%)`,
                  }}
                >
                  {locations.map((item) => (
                    <div className="location-card" key={item.id}>
                      <div className="location-card-inner">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="location-image"
                        />

                        <div className="location-info">
                          <div className="location-name">{item.name}</div>
                          <div className="location-count">{item.count}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="location-btn right" onClick={handleNextLocation}>
                ❯
              </button>
            </div>
          </div>
        </section>

        <section className="advantages-section">
          <div className="page-container">
            <div className="advantages-header">
              <h2 className="advantages-title">Ưu Điểm Của Kongcars</h2>
              <p className="advantages-subtitle">
                Những tính năng giúp bạn dễ dàng hơn khi thuê xe trên Kongcars.
              </p>
            </div>

            <div className="advantages-grid">
              {advantages.map((item) => (
                <div className="advantage-card" key={item.id}>
                  <div className="advantage-image-wrap">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="advantage-image"
                    />
                  </div>

                  <div className="advantage-title">{item.title}</div>
                  <p className="advantage-description">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="insurance-section">
          <div className="page-container">
            <div className="insurance-header">
              <h2 className="insurance-main-title">
                Hành Trình Của Bạn Luôn Được Bảo Vệ
              </h2>
            </div>

            <div className="insurance-wrapper">
              <img
                src="/images/insurance.jpg"
                alt="insurance"
                className="insurance-image"
              />

              <div className="insurance-content">
                <div className="insurance-brand">Kongcars</div>
                <div className="insurance-title">Bảo hiểm thuê xe</div>
                <div className="insurance-subtitle">An tâm hành trình</div>
                <div className="insurance-btn">Tìm hiểu thêm</div>
              </div>
            </div>
          </div>
        </section>

        <section className="steps-section">
          <div className="page-container">
            <div className="steps-header">
              <h2 className="steps-title">Hướng Dẫn Thuê Xe</h2>
              <p className="steps-subtitle">
                Chỉ với 4 bước đơn giản để trải nghiệm thuê xe Kongcars một cách nhanh chóng
              </p>
            </div>

            <div className="steps-grid">
              {rentalSteps.map((step) => (
                <div className="step-card" key={step.id}>
                  <div className="step-image-wrap">
                    <img src={step.image} alt={step.title} className="step-image" />
                  </div>

                  <div className="step-text">
                    <span className="step-number">{step.id}</span>
                    <span className="step-title">{step.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <RentalDateModal
        open={showRentalModal}
        onClose={() => setShowRentalModal(false)}
        startValue={pickupDateTime}
        endValue={returnDateTime}
        onConfirm={(start, end) => {
          setPickupDateTime(start);
          setReturnDateTime(end);

          const formatOne = (d) =>
            new Date(d).toLocaleString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

          setRentalTime(`${formatOne(start)} - ${formatOne(end)}`);
          setSearchError("");
        }}
      />

      <Footer />
    </>
  );
}

export default HomeCustomer;