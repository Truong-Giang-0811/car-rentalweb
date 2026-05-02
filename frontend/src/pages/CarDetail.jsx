import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CustomerHeader from "../components/CustomerHeader.jsx";
import Footer from "../components/Footer.jsx";
import RentalDateModal from "../components/RentalDateModal.jsx";
import {
  getPublicCarDetail,
  checkFavorite,
  toggleFavorite,
} from "../services/carsService";
import {
  getPublicVouchers,
  validateVoucherCode,
} from "../services/voucherService";
import { createBooking } from "../services/bookingsService";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  CarFront,
  MapPin,
  ShieldCheck,
  Gauge,
  Users,
  Fuel,
  FileText,
  CircleHelp,
  MapPinned,
  BadgeInfo,
  IdCard,
  Wallet,
  Navigation,
  Camera,
  Disc3,
  Radar,
  AlertTriangle,
  Monitor,
  CircleDollarSign,
  TicketPercent,
  BadgePercent,
} from "lucide-react";

function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [returnDateTime, setReturnDateTime] = useState("");
  const [deliveryType, setDeliveryType] = useState("self");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [showDateModal, setShowDateModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [publicVouchers, setPublicVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoVoucher, setPromoVoucher] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

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
      startDate: params.get("startDate") || "",
      endDate: params.get("endDate") || "",
      searchLocation: params.get("location") || "",
    };
  }, [location.search]);

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") return "Liên hệ";
    return `${Number(value).toLocaleString("vi-VN")}đ`;
  };

  const getTransmissionLabel = (value) => {
    const text = String(value || "").toLowerCase();
    if (text === "automatic" || text === "0") return "Số tự động";
    if (text === "manual" || text === "1") return "Số sàn";
    return value || "Đang cập nhật";
  };

  const getFuelLabel = (value) => {
    const text = String(value || "").toLowerCase();
    if (text === "gasoline" || text === "0") return "Xăng";
    if (text === "diesel" || text === "1") return "Dầu";
    if (text === "electric" || text === "2") return "Điện";
    if (text === "hybrid" || text === "3") return "Hybrid";
    return value || "Đang cập nhật";
  };

  const formatDisplayDateTime = (value) => {
    if (!value) return "Chọn thời gian";
    const d = new Date(value);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const images = useMemo(() => {
    if (!car) return [];

    const rawImages = Array.isArray(car.images)
      ? car.images
      : Array.isArray(car.Images)
        ? car.Images
        : [];

    const mapped = rawImages
      .map((item, index) => ({
        id: item.id || item.Id || `img-${index}`,
        url: item.url || item.Url || "",
        type: item.type ?? item.Type ?? 0,
        sortOrder: item.sortOrder ?? item.SortOrder ?? 0,
      }))
      .filter((item) => item.url);

    if (mapped.length > 0) return mapped;

    const thumbnail = car.thumbnail || car.Thumbnail || "";
    return thumbnail
      ? [{ id: "thumb", url: thumbnail, type: 0, sortOrder: 0 }]
      : [];
  }, [car]);

  const displayImages = useMemo(() => {
    if (images.length >= 4) return images.slice(0, 4);

    if (images.length > 0) {
      const cloned = [...images];
      while (cloned.length < 4) {
        cloned.push({
          ...images[Math.min(cloned.length - 1, images.length - 1)],
          id: `clone-${cloned.length}`,
        });
      }
      return cloned;
    }

    return [
      { id: "placeholder-1", url: "/images/car-placeholder.jpg" },
      { id: "placeholder-2", url: "/images/car-placeholder.jpg" },
      { id: "placeholder-3", url: "/images/car-placeholder.jpg" },
      { id: "placeholder-4", url: "/images/car-placeholder.jpg" },
    ];
  }, [images]);

  const handleToggleFavorite = async () => {
    if (!requireLogin()) return;

    try {
      setFavoriteLoading(true);
      await toggleFavorite(id);
      setIsFavorite((prev) => !prev);
    } catch (err) {
      console.error("Lỗi toggle favorite:", err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  useEffect(() => {
    const fetchPublicVouchers = async () => {
      try {
        const data = await getPublicVouchers();
        setPublicVouchers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi lấy voucher công khai:", error);
        setPublicVouchers([]);
      }
    };

    fetchPublicVouchers();
  }, []);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const result = await checkFavorite(id);
        setIsFavorite(!!result?.isFavorite);
      } catch (err) {
        console.error("Lỗi check favorite:", err);
        setIsFavorite(false);
      }
    };

    if (id) fetchFavoriteStatus();
  }, [id]);

  useEffect(() => {
    if (queryParams.startDate) setPickupDateTime(queryParams.startDate);
    if (queryParams.endDate) setReturnDateTime(queryParams.endDate);
  }, [queryParams]);

  useEffect(() => {
    const fetchCarDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicCarDetail(id);
        setCar(data);

        const rawImages = Array.isArray(data.images)
          ? data.images
          : Array.isArray(data.Images)
            ? data.Images
            : [];

        if (rawImages.length > 0) {
          setActiveImage(rawImages[0].url || rawImages[0].Url || "");
        } else {
          setActiveImage(
            data.thumbnail || data.Thumbnail || "/images/car-placeholder.jpg",
          );
        }
      } catch (err) {
        setError(err.message || "Không tải được chi tiết xe.");
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetail();
  }, [id]);

  if (loading) {
    return (
      <>
        <CustomerHeader />
        <div
          style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}
        >
          <div>Đang tải chi tiết xe...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !car) {
    return (
      <>
        <CustomerHeader />
        <div
          style={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
            padding: "40px 20px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <img
              src="/images/empty-search.svg"
              alt="Không tìm thấy"
              style={{ width: "180px", maxWidth: "100%", marginBottom: "16px" }}
            />
            <h2 style={{ marginBottom: "8px" }}>Không tìm thấy xe</h2>
            <p style={{ color: "#6b7280", marginBottom: "16px" }}>
              {error || "Xe này hiện không tồn tại hoặc đã ngừng hiển thị."}
            </p>
            <button
              onClick={() => navigate(-1)}
              style={{
                border: "none",
                background: "#22c55e",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Quay lại
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const brand = car.brand || car.Brand || "";
  const model = car.model || car.Model || "";
  const year = car.year || car.Year || "";
  const seats = car.seats || car.Seats || "";
  const transmission = car.transmission || car.Transmission || "";
  const fuel = car.fuel || car.Fuel || "";
  const fuelConsumption = car.fuelConsumption || car.FuelConsumption || "";
  const address = car.address || car.Address || "Đang cập nhật";
  const description =
    car.description || car.Description || "Đang cập nhật mô tả.";
  const owner = car.owner || car.Owner || null;
  const pricePerDay = car?.pricePerDay || car?.PricePerDay || 0;

  const title = `${brand} ${model} ${year}`.trim();
  const mainImage =
    activeImage || displayImages[0]?.url || "/images/car-placeholder.jpg";

  const featureItems = [
    { icon: Navigation, label: "Bản đồ" },
    { icon: Camera, label: "Camera 360" },
    { icon: Camera, label: "Camera cập lề" },
    { icon: Camera, label: "Camera lùi" },
    { icon: Radar, label: "Cảm biến lốp" },
    { icon: AlertTriangle, label: "Cảm biến va chạm" },
    { icon: Gauge, label: "Cảnh báo tốc độ" },
    { icon: CircleDollarSign, label: "Lốp dự phòng" },
    { icon: Monitor, label: "Màn hình DVD" },
    { icon: Disc3, label: "ETC" },
  ];

  const calculateRentalDays = () => {
    if (!pickupDateTime || !returnDateTime) return 1;

    const start = new Date(pickupDateTime);
    const end = new Date(returnDateTime);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays > 0 ? Math.ceil(diffDays) : 1;
  };

  const selectedVoucher = publicVouchers.find(
    (item) => String(item.id) === String(selectedVoucherId),
  );

  const calculateVoucherDiscount = () => {
    if (!selectedVoucher) return 0;

    const days = calculateRentalDays();
    const subtotal = Number(pricePerDay || 0) * days;

    const minOrderValue = Number(selectedVoucher.minOrderValue || 0);
    if (minOrderValue > 0 && subtotal < minOrderValue) return 0;

    const discountType = selectedVoucher.discountType;
    const discountValue = Number(selectedVoucher.discountValue || 0);
    const maxDiscountValue = Number(selectedVoucher.maxDiscountValue || 0);

    let discount = 0;

    if (discountType === "Percentage" || discountType === 1) {
      discount = (subtotal * discountValue) / 100;
      if (maxDiscountValue > 0) {
        discount = Math.min(discount, maxDiscountValue);
      }
    } else {
      discount = discountValue;
    }

    return Math.max(0, Math.round(discount));
  };

  const calculatePromoCodeDiscount = () => {
    if (!promoVoucher) return 0;

    const discountType = promoVoucher.discountType;
    const discountValue = Number(promoVoucher.discountValue || 0);
    const maxDiscountValue = Number(promoVoucher.maxDiscountValue || 0);

    let discount = 0;

    if (discountType === "Percentage" || discountType === 1) {
      discount = (rentalSubtotal * discountValue) / 100;

      if (maxDiscountValue > 0) {
        discount = Math.min(discount, maxDiscountValue);
      }
    } else {
      discount = discountValue;
    }

    return Math.max(0, Math.round(discount));
  };

  const rentalDays = calculateRentalDays();
  const rentalSubtotal = Number(pricePerDay || 0) * rentalDays;
  const voucherDiscount = calculateVoucherDiscount();
  const promoCodeDiscount = calculatePromoCodeDiscount();
  const finalTotal = Math.max(
    0,
    rentalSubtotal - voucherDiscount - promoCodeDiscount,
  );

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoMessage("Vui lòng nhập mã khuyến mãi.");
      setPromoVoucher(null);
      return;
    }

    try {
      setPromoLoading(true);
      setPromoMessage("");

      const result = await validateVoucherCode({
        code: promoCode,
        subtotal: rentalSubtotal,
      });

      if (!result?.isValid) {
        setPromoVoucher(null);
        setPromoMessage(result?.message || "Mã không hợp lệ.");
        return;
      }

      setPromoVoucher(result.voucher);
      setPromoMessage(result.message || "Áp dụng mã thành công.");
    } catch (error) {
      setPromoVoucher(null);
      setPromoMessage(error.message);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!requireLogin()) return;

    if (!pickupDateTime || !returnDateTime) {
      toast.error("Vui lòng chọn thời gian nhận và trả xe.");
      return;
    }

    if (new Date(pickupDateTime) >= new Date(returnDateTime)) {
      toast.error("Thời gian trả xe phải sau thời gian nhận xe.");
      return;
    }

    if (deliveryType === "delivery" && !deliveryAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao xe.");
      return;
    }

    try {
      setBookingLoading(true);

      const payload = {
        carId: id,
        startAt: new Date(pickupDateTime).toISOString(),
        endAt: new Date(returnDateTime).toISOString(),
        pickupType: deliveryType === "delivery" ? 1 : 0,
        pickupAddress:
          deliveryType === "delivery"
            ? deliveryAddress.trim()
            : car.address || car.Address || "",
        pricePerDay: Number(pricePerDay),
        insurancePerDay: 0,
        discountAmount: voucherDiscount + promoCodeDiscount,
        rentalPapers: "CCCD/CMND + Giấy phép lái xe",
        collateral: "Tài sản thế chấp: Tiền mặt hoặc giấy tờ xe",
        voucherId: selectedVoucherId || null,
        promoCode: promoVoucher ? promoCode : null,
        note: "",
        customerAgreedTerms: true,
      };

      const result = await createBooking(payload);
      toast.success("Đặt xe thành công! Vui lòng thanh toán để giữ xe.");
      navigate(`/bookings/${result.id}`);
    } catch (error) {
      toast.error(error.message || "Đặt xe thất bại, vui lòng thử lại.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #111827;
          background: #ffffff;
        }

        .detail-page {
          min-height: 100vh;
          background: #fff;
        }

        .page-container {
          width: min(1400px, calc(100% - 120px));
          margin: 0 auto;
        }

        .detail-breadcrumb {
          padding: 20px 0 14px;
        }

        .detail-breadcrumb button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: transparent;
          color: #16a34a;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          font-size: 1rem;
        }

        .detail-gallery-row {
          margin-bottom: 28px;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
          gap: 16px;
        }

        .main-image-box {
          border-radius: 24px;
          overflow: hidden;
          height: 520px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
        }

        .main-image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .thumb-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .thumb-item {
          height: 162px;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          background: #f3f4f6;
          transition: 0.2s ease;
        }

        .thumb-item.active {
          border-color: #22c55e;
        }

        .thumb-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .detail-content-row {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
          gap: 30px;
          align-items: start;
          padding-bottom: 50px;
        }

        .detail-left,
        .detail-right {
          min-width: 0;
        }

        .car-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 18px;
        }

        .car-head-left {
          min-width: 0;
        }

        .car-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #111827;
          margin: 0 0 12px;
          line-height: 1.2;
        }

        .car-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          color: #4b5563;
          font-weight: 600;
          margin-bottom: 14px;
        }

        .car-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .car-meta-item svg:nth-child(1) {
          color: #16a34a;
        }

        .car-meta-item:first-child svg {
          color: #f59e0b;
          fill: #f59e0b;
        }

        .car-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .circle-icon-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .circle-icon-btn:hover {
          background: #f9fafb;
        }

        .share-btn {
          color: #16a34a;
        }

        .heart-btn {
          color: #ec4899;
        }

        .heart-btn svg {
          color: #9ca3af;
          fill: transparent;
        }

        .heart-btn.active svg {
          color: #ec4899;
          fill: #ec4899;
        }

        .car-badges {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .car-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          color: #374151;
          font-weight: 700;
          font-size: 0.92rem;
        }

        .car-badge svg {
          color: #22c55e;
        }

        .detail-section {
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          padding: 24px 0;
        }

        .detail-section:first-child {
          border-top: 1px solid #e5e7eb;
        }

        .detail-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.32rem;
          font-weight: 800;
          margin: 0 0 18px;
          color: #111827;
        }

        .detail-section-title svg {
          color: #16a34a;
        }

        .spec-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .spec-card {
          padding: 8px 2px;
        }

        .spec-icon {
          color: #22c55e;
          margin-bottom: 10px;
        }

        .spec-label {
          font-size: 0.95rem;
          color: #6b7280;
          margin-bottom: 6px;
          font-weight: 600;
        }

        .spec-value {
          font-size: 1.08rem;
          font-weight: 800;
          color: #111827;
        }

        .detail-text {
          color: #374151;
          line-height: 1.75;
          font-size: 0.98rem;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px 22px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #111827;
          font-weight: 500;
        }

        .feature-item svg {
          color: #111827;
          flex-shrink: 0;
        }

        .doc-box,
        .mortgage-box {
          background: #f8f2ef;
          border-left: 6px solid #f97316;
          border-radius: 14px;
          padding: 18px 18px 18px 20px;
        }

        .doc-top {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-weight: 600;
          margin-bottom: 16px;
          font-size: 0.95rem;
        }

        .doc-top svg {
          color: #6b7280;
        }

        .doc-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
        }

        .doc-item + .doc-item {
          margin-top: 18px;
        }

        .mortgage-text {
          color: #111827;
          line-height: 1.7;
          font-size: 1rem;
        }

        .location-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #374151;
          line-height: 1.7;
        }

        .location-row svg {
          color: #16a34a;
          flex-shrink: 0;
        }

        .insurance-side-box {
          border: 1px solid #bbf7d0;
          background: #f0fdf4;
          border-radius: 18px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .insurance-side-title {
          font-weight: 800;
          color: #166534;
          margin-bottom: 6px;
        }

        .insurance-side-text {
          color: #166534;
          line-height: 1.6;
          font-size: 0.94rem;
        }

        .booking-box {
          border: 1px solid #d9e0e8;
          border-radius: 24px;
          padding: 22px;
          background: #f8fbff;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        }

        .old-price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .old-price {
          color: #9ca3af;
          text-decoration: line-through;
          font-weight: 700;
        }

        .discount-badge {
          background: #f97316;
          color: #fff;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 999px;
        }

        .booking-price-main {
          font-size: 2rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 18px;
        }

        .booking-price-main span {
          font-size: 1.2rem;
          color: #6b7280;
          font-weight: 700;
          margin-left: 4px;
        }

        .booking-datetime-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid #d1d5db;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 18px;
          cursor: pointer;
          background: #fff;
        }

        .booking-datetime-col {
          padding: 14px 16px;
          background: #fff;
        }

        .booking-datetime-col + .booking-datetime-col {
          border-left: 1px solid #d1d5db;
        }

        .booking-datetime-label {
          font-size: 0.92rem;
          color: #6b7280;
          margin-bottom: 6px;
          font-weight: 700;
        }

        .booking-datetime-value {
          font-size: 1rem;
          font-weight: 800;
          color: #111827;
          line-height: 1.5;
        }

        .booking-block-title {
          font-size: 1rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 12px;
        }

        .pickup-option {
          border: 1px solid #d1d5db;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          cursor: pointer;
          margin-bottom: 12px;
          background: #fff;
        }

        .pickup-option.active {
          border-color: #86efac;
          background: #f0fdf4;
        }

        .pickup-option-top {
          font-weight: 700;
          color: #374151;
          margin-bottom: 4px;
        }

        .pickup-option-address {
          color: #111827;
          font-weight: 700;
          line-height: 1.5;
        }

        .pickup-option-fee {
          color: #22c55e;
          font-weight: 800;
          white-space: nowrap;
        }

        .pickup-radio-line {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pickup-radio {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #d1d5db;
          display: inline-block;
          flex-shrink: 0;
          background: #fff;
        }

        .pickup-option.active .pickup-radio {
          border-color: #4ade80;
          background: #fff;
          box-shadow: inset 0 0 0 4px #4ade80;
        }

        .delivery-address-box {
          margin-bottom: 14px;
        }

        .booking-input {
          width: 100%;
          height: 50px;
          border-radius: 14px;
          border: 1px solid #d1d5db;
          padding: 0 14px;
          font-size: 0.96rem;
          background: #fff;
        }

        .booking-field {
          margin-bottom: 14px;
        }

        .promo-box {
          margin-bottom: 14px;
          padding: 14px 16px;
          border-radius: 14px;
          background: #fff7ed;
          border: 1px solid #fdba74;
        }

        .promo-title {
          font-weight: 800;
          color: #c2410c;
          margin-bottom: 6px;
        }

        .promo-text {
          color: #9a3412;
          font-size: 0.94rem;
          line-height: 1.6;
        }

        .price-breakdown {
          border-top: 1px solid #e5e7eb;
          margin-top: 12px;
          padding-top: 12px;
        }

        .price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .price-row:last-child {
          border-bottom: none;
        }

        .price-left {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .price-left svg {
          color: #6b7280;
        }

        .promo-row {
          align-items: center;
        }

        .promo-line-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .promo-line-left svg {
          color: #22c55e;
        }

        .price-row.discount .promo-line-left svg {
          color: #f97316;
        }

        .price-row.discount span,
        .price-row.discount strong {
          color: #ea580c;
        }

        .booking-total.final {
          border-top: none;
          padding-top: 16px;
          margin-top: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .booking-total-label {
          color: #111827;
          font-size: 1.05rem;
          font-weight: 800;
        }

        .booking-total-value {
          font-size: 1.35rem;
          font-weight: 800;
          color: #111827;
        }

        .booking-btn {
          width: 100%;
          margin-top: 18px;
          height: 56px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #5fd284, #58cc7b);
          color: #fff;
          font-size: 1.05rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .booking-btn:hover {
          opacity: 0.95;
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

        .owner-panel {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 28px;
          margin-bottom: 18px;
        }

        .owner-main {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
        }

        .owner-avatar-image {
          width: 74px;
          height: 74px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .owner-avatar-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .owner-avatar-fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #16a34a, #4ade80);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.3rem;
        }

        .owner-main-info {
          min-width: 0;
        }

        .owner-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
        }

        .owner-meta-line {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .owner-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #4b5563;
          font-size: 0.96rem;
          font-weight: 600;
        }

        .owner-rating svg {
          color: #f59e0b;
          fill: #f59e0b;
        }

        .owner-trips svg {
          color: #22c55e;
        }

        .owner-stats {
          display: flex;
          align-items: flex-start;
          gap: 42px;
          flex-shrink: 0;
        }

        .owner-stat {
          text-align: center;
          min-width: 110px;
        }

        .owner-stat-label {
          color: #9ca3af;
          font-size: 0.98rem;
          margin-bottom: 8px;
        }

        .owner-stat-value {
          color: #111827;
          font-size: 1.1rem;
          font-weight: 800;
        }

        .owner-highlight-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #eef5fd;
          border-radius: 12px;
          padding: 14px 16px;
        }

        .owner-highlight-icon {
          font-size: 1.2rem;
          line-height: 1.2;
          flex-shrink: 0;
        }

        .owner-highlight-text {
          color: #374151;
          line-height: 1.7;
          font-size: 0.97rem;
        }

        @media (max-width: 1199.98px) {
          .detail-content-row {
            grid-template-columns: 1fr;
          }

          .gallery-grid {
            grid-template-columns: 1fr;
          }

          .thumb-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .thumb-item {
            height: 140px;
          }

          .spec-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .feature-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 991.98px) {
          .owner-panel {
            flex-direction: column;
            align-items: flex-start;
          }

          .owner-stats {
            gap: 24px;
            flex-wrap: wrap;
          }

          .owner-stat {
            text-align: left;
            min-width: unset;
          }
        }

        @media (max-width: 767.98px) {
          .page-container {
            width: calc(100% - 24px);
          }

          .main-image-box {
            height: 320px;
          }

          .thumb-grid {
            grid-template-columns: 1fr;
          }

          .thumb-item {
            height: 120px;
          }

          .car-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .car-title {
            font-size: 1.7rem;
          }

          .spec-grid,
          .feature-grid {
            grid-template-columns: 1fr;
          }

          .booking-datetime-row {
            grid-template-columns: 1fr;
          }

          .booking-datetime-col + .booking-datetime-col {
            border-left: none;
            border-top: 1px solid #d1d5db;
          }

          .rental-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="detail-page">
        <CustomerHeader />

        <div className="page-container">
          <div className="detail-breadcrumb">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
              <span>Quay lại</span>
            </button>
          </div>

          <div className="detail-gallery-row">
            <div className="gallery-grid">
              <div className="main-image-box">
                <img src={mainImage} alt={title} />
              </div>

              <div className="thumb-grid">
                {displayImages.slice(1, 4).map((image) => (
                  <div
                    key={image.id}
                    className={`thumb-item ${mainImage === image.url ? "active" : ""}`}
                    onClick={() => setActiveImage(image.url)}
                  >
                    <img src={image.url} alt="Xe" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-content-row">
            <div className="detail-left">
              <div className="car-head">
                <div className="car-head-left">
                  <h1 className="car-title">{title}</h1>

                  <div className="car-meta-row">
                    <span className="car-meta-item">
                      <Star size={16} fill="currentColor" />
                      5.0
                    </span>
                    <span className="car-meta-item">
                      <CarFront size={16} />0 chuyến
                    </span>
                    <span className="car-meta-item">
                      <MapPin size={16} />
                      {address}
                    </span>
                  </div>

                  <div className="car-badges">
                    <div className="car-badge">
                      <ShieldCheck size={16} />
                      Miễn thế chấp
                    </div>
                    <div className="car-badge">
                      <MapPin size={16} />
                      Giao xe tận nơi
                    </div>
                  </div>
                </div>

                <div className="car-actions">
                  <button className="circle-icon-btn share-btn" type="button">
                    <Share2 size={20} />
                  </button>
                  <button
                    className={`circle-icon-btn heart-btn ${isFavorite ? "active" : ""}`}
                    type="button"
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                  >
                    <Heart size={20} />
                  </button>
                </div>
              </div>

              <div className="detail-section">
                <h2 className="detail-section-title">Đặc điểm</h2>

                <div className="spec-grid">
                  <div className="spec-card">
                    <div className="spec-icon">
                      <Gauge size={22} />
                    </div>
                    <div className="spec-label">Truyền động</div>
                    <div className="spec-value">
                      {getTransmissionLabel(transmission)}
                    </div>
                  </div>

                  <div className="spec-card">
                    <div className="spec-icon">
                      <Users size={22} />
                    </div>
                    <div className="spec-label">Số ghế</div>
                    <div className="spec-value">
                      {seats ? `${seats} chỗ` : "Đang cập nhật"}
                    </div>
                  </div>

                  <div className="spec-card">
                    <div className="spec-icon">
                      <Fuel size={22} />
                    </div>
                    <div className="spec-label">Nhiên liệu</div>
                    <div className="spec-value">{getFuelLabel(fuel)}</div>
                  </div>

                  <div className="spec-card">
                    <div className="spec-icon">
                      <Wallet size={22} />
                    </div>
                    <div className="spec-label">Mức tiêu hao</div>
                    <div className="spec-value">
                      {fuelConsumption
                        ? `${fuelConsumption} L/100km`
                        : "Đang cập nhật"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h2 className="detail-section-title">Mô tả</h2>
                <div className="detail-text">{description}</div>
              </div>

              <div className="detail-section">
                <h2 className="detail-section-title">Các tiện nghi khác</h2>

                <div className="feature-grid">
                  {featureItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div className="feature-item" key={index}>
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="detail-section">
                <h2 className="detail-section-title">
                  Giấy tờ thuê xe
                  <CircleHelp size={18} />
                </h2>

                <div className="doc-box">
                  <div className="doc-top">
                    <BadgeInfo size={16} />
                    <span>Chọn 1 trong 2 hình thức</span>
                  </div>

                  <div className="doc-item">
                    <FileText size={22} />
                    <span>GPLX (đối chiếu) & Passport (giữ lại)</span>
                  </div>

                  <div className="doc-item">
                    <IdCard size={22} />
                    <span>GPLX (đối chiếu) & CCCD (đối chiếu VNeID)</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h2 className="detail-section-title">
                  Tài sản thế chấp
                  <CircleHelp size={18} />
                </h2>

                <div className="mortgage-box">
                  <div className="mortgage-text">
                    Không yêu cầu khách thuê thế chấp Tiền mặt hoặc Xe máy.
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h2 className="detail-section-title">Điều khoản</h2>
                <div className="detail-text">
                  Quy định khác:
                  <br />• Sử dụng xe đúng mục đích.
                  <br />• Không sử dụng xe vào mục đích phi pháp, trái pháp
                  luật.
                  <br />• Không sử dụng xe thuê để cầm cố, thế chấp.
                  <br />• Không hút thuốc, nhả kẹo cao su, xả rác trong xe.
                  <br />• Không chở hàng quốc cấm dễ cháy nổ.
                  <br />• Không chở hoa quả, thực phẩm nặng mùi trong xe.
                  <br />• Khi trả xe, nếu xe bẩn hoặc có mùi trong xe, khách
                  hàng vui lòng vệ sinh xe sạch sẽ hoặc gửi phụ thu phí vệ sinh
                  xe.
                  <br />
                  Trân trọng cảm ơn, chúc quý khách hàng có những chuyến đi
                  tuyệt vời !
                </div>
              </div>

              <div className="detail-section">
                <h2 className="detail-section-title">Vị trí xe</h2>
                <div className="location-row">
                  <MapPinned size={18} />
                  <span>{address}</span>
                </div>
              </div>

              <div className="detail-section">
                <h2 className="detail-section-title">Chủ xe</h2>

                <div className="owner-panel">
                  <div className="owner-main">
                    <div className="owner-avatar-image">
                      {owner?.avatar || owner?.Avatar ? (
                        <img
                          src={owner?.avatar || owner?.Avatar}
                          alt={owner?.fullName || owner?.FullName || "Chủ xe"}
                        />
                      ) : (
                        <div className="owner-avatar-fallback">
                          {(owner?.fullName || owner?.FullName || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="owner-main-info">
                      <div className="owner-name">
                        {(
                          owner?.fullName ||
                          owner?.FullName ||
                          "Chủ xe"
                        ).toUpperCase()}
                      </div>

                      <div className="owner-meta-line">
                        <span className="owner-meta-item owner-rating">
                          <Star size={15} fill="currentColor" />
                          5.0
                        </span>

                        <span className="owner-meta-item owner-trips">
                          <CarFront size={15} />
                          43 chuyến
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="owner-stats">
                    <div className="owner-stat">
                      <div className="owner-stat-label">Tỉ lệ phản hồi</div>
                      <div className="owner-stat-value">100%</div>
                    </div>

                    <div className="owner-stat">
                      <div className="owner-stat-label">Phản hồi trong</div>
                      <div className="owner-stat-value">5 phút</div>
                    </div>

                    <div className="owner-stat">
                      <div className="owner-stat-label">Tỉ lệ đồng ý</div>
                      <div className="owner-stat-value">100%</div>
                    </div>
                  </div>
                </div>

                <div className="owner-highlight-box">
                  <div className="owner-highlight-icon">👑</div>
                  <div className="owner-highlight-text">
                    Chủ xe 5★ có thời gian phản hồi nhanh chóng, tỉ lệ đồng ý
                    cao, mức giá cạnh tranh & dịch vụ nhận được nhiều đánh giá
                    tốt từ khách hàng.
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-right">
              <div className="insurance-side-box">
                <div className="insurance-side-title">Bảo hiểm thuê xe</div>
                <div className="insurance-side-text">
                  Chuyến đi được áp dụng bảo hiểm thuê xe cơ bản. Khách thuê sẽ
                  được hỗ trợ trong các trường hợp đủ điều kiện.
                </div>
              </div>

              <div className="booking-box">
                <div className="old-price-row">
                  <span className="old-price">11.000đ</span>
                  <span className="discount-badge">-12%</span>
                </div>

                <div className="booking-price-main">
                  {formatPrice(pricePerDay)}
                  <span>/ngày</span>
                </div>

                <div
                  className="booking-datetime-row"
                  onClick={() => setShowDateModal(true)}
                >
                  <div className="booking-datetime-col">
                    <div className="booking-datetime-label">Nhận xe</div>
                    <div className="booking-datetime-value">
                      {formatDisplayDateTime(pickupDateTime)}
                    </div>
                  </div>

                  <div className="booking-datetime-col">
                    <div className="booking-datetime-label">Trả xe</div>
                    <div className="booking-datetime-value">
                      {formatDisplayDateTime(returnDateTime)}
                    </div>
                  </div>
                </div>

                <div className="booking-block-title">Địa điểm giao nhận xe</div>

                <div
                  className={`pickup-option ${deliveryType === "self" ? "active" : ""}`}
                  onClick={() => setDeliveryType("self")}
                >
                  <div>
                    <div className="pickup-radio-line">
                      <span className="pickup-radio"></span>
                      <div className="pickup-option-top">Tôi tự đến lấy xe</div>
                    </div>
                    <div className="pickup-option-address">{address}</div>
                  </div>
                  <div className="pickup-option-fee">Miễn phí</div>
                </div>

                <div
                  className={`pickup-option ${deliveryType === "delivery" ? "active" : ""}`}
                  onClick={() => setDeliveryType("delivery")}
                >
                  <div>
                    <div className="pickup-radio-line">
                      <span className="pickup-radio"></span>
                      <div className="pickup-option-top">
                        Tôi muốn được giao xe tận nơi
                      </div>
                    </div>
                  </div>
                </div>

                {deliveryType === "delivery" && (
                  <div className="delivery-address-box">
                    <input
                      className="booking-input"
                      type="text"
                      placeholder="Nhập địa chỉ giao xe"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>
                )}

                <div className="booking-block-title">
                  Chương trình khuyến mãi
                </div>

                <div className="booking-field">
                  <select
                    className="booking-input"
                    value={selectedVoucherId}
                    onChange={(e) => setSelectedVoucherId(e.target.value)}
                  >
                    <option value="">Không áp dụng</option>
                    {publicVouchers.map((voucher) => (
                      <option key={voucher.id} value={voucher.id}>
                        {voucher.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="booking-block-title">Mã khuyến mãi</div>

                <div
                  className="booking-field"
                  style={{ display: "flex", gap: "10px" }}
                >
                  <input
                    className="booking-input"
                    type="text"
                    placeholder="Nhập mã khuyến mãi"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromoCode}
                    disabled={promoLoading}
                    style={{
                      border: "none",
                      borderRadius: "14px",
                      padding: "0 18px",
                      background: "#16a34a",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                      minWidth: "110px",
                    }}
                  >
                    {promoLoading ? "Đang..." : "Áp dụng"}
                  </button>
                </div>

                {promoMessage && (
                  <div
                    style={{
                      marginBottom: "14px",
                      fontSize: "0.92rem",
                      fontWeight: 600,
                      color: promoVoucher ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {promoMessage}
                  </div>
                )}

                {selectedVoucher && (
                  <div className="promo-box">
                    <div className="promo-title">{selectedVoucher.title}</div>
                    <div className="promo-text">
                      {selectedVoucher.discountType === "Percentage" ||
                      selectedVoucher.discountType === 1
                        ? `Giảm ${selectedVoucher.discountValue}%`
                        : `Giảm ${Number(selectedVoucher.discountValue).toLocaleString("vi-VN")}đ`}
                      {selectedVoucher.minOrderValue
                        ? ` • Đơn tối thiểu ${Number(selectedVoucher.minOrderValue).toLocaleString("vi-VN")}đ`
                        : ""}
                    </div>
                  </div>
                )}

                <div className="price-breakdown">
                  <div className="price-row">
                    <div className="price-left">
                      <span>Đơn giá thuê</span>
                      <CircleHelp size={15} />
                    </div>
                    <strong>{formatPrice(pricePerDay)}/ngày</strong>
                  </div>

                  <div className="price-row">
                    <div className="price-left">
                      <span>Số ngày thuê</span>
                    </div>
                    <strong>{rentalDays} ngày</strong>
                  </div>

                  <div className="price-row">
                    <div className="price-left">
                      <span>Tạm tính</span>
                    </div>
                    <strong>{formatPrice(rentalSubtotal)}</strong>
                  </div>

                  <div className="price-row discount promo-row">
                    <div className="promo-line-left">
                      <BadgePercent size={16} />
                      <span>Chương trình giảm giá</span>
                    </div>
                    <strong>
                      {voucherDiscount > 0
                        ? `- ${formatPrice(voucherDiscount)}`
                        : "0đ"}
                    </strong>
                  </div>

                  <div className="price-row promo-row">
                    <div className="promo-line-left">
                      <TicketPercent size={16} />
                      <span>Mã khuyến mãi</span>
                    </div>
                    <strong>
                      {promoCodeDiscount > 0
                        ? `- ${formatPrice(promoCodeDiscount)}`
                        : "0đ"}
                    </strong>
                  </div>
                </div>

                <div className="booking-total final">
                  <div className="booking-total-label">Thành tiền</div>
                  <div className="booking-total-value">
                    {formatPrice(finalTotal)}
                  </div>
                </div>

                <button
                  className="booking-btn"
                  onClick={handleBooking}
                  disabled={bookingLoading}
                >
                  <span>⚡</span>
                  <span>{bookingLoading ? "ĐANG XỬ LÝ..." : "CHỌN THUÊ"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <RentalDateModal
          open={showDateModal}
          onClose={() => setShowDateModal(false)}
          startValue={pickupDateTime}
          endValue={returnDateTime}
          onConfirm={(newPickup, newReturn) => {
            setPickupDateTime(newPickup);
            setReturnDateTime(newReturn);
            setShowDateModal(false);
          }}
        />

        <Footer />
      </div>
    </>
  );
}

export default CarDetail;
