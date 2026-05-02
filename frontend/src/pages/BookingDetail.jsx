import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import CustomerHeader from "../components/CustomerHeader.jsx";
import Footer from "../components/Footer.jsx";
import { getBookingDetail } from "../services/bookingsService";
import { createPayOSLink } from "../services/bookingsService";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Car,
  CalendarDays,
  MapPin,
  FileText,
  Clock,
  CircleDollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hourglass,
  Truck,
  PackageCheck,
  BadgeCheck,
  CreditCard,
  Shield,
  User,
  Hash,
  ChevronRight,
} from "lucide-react";

// ─── Trạng thái booking ───────────────────────────────────────────────
const STATUS_MAP = {
  Pending: {
    label: "Chờ xác nhận",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fcd34d",
    icon: Hourglass,
    step: 1,
  },
  WaitingForDeposit: {
    label: "Chờ thanh toán",
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#93c5fd",
    icon: CreditCard,
    step: 2,
  },
  Confirmed: {
    label: "Đã xác nhận",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#c4b5fd",
    icon: BadgeCheck,
    step: 3,
  },
  PickedUp: {
    label: "Đang thuê",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    border: "#7dd3fc",
    icon: Truck,
    step: 4,
  },
  Completed: {
    label: "Hoàn thành",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#86efac",
    icon: PackageCheck,
    step: 5,
  },
  Rejected: {
    label: "Bị từ chối",
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fca5a5",
    icon: XCircle,
    step: -1,
  },
  Cancelled: {
    label: "Đã huỷ",
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#d1d5db",
    icon: XCircle,
    step: -1,
  },
};

const STEPS = [
  { key: "Pending", label: "Chờ xác nhận" },
  { key: "WaitingForDeposit", label: "Chờ thanh toán" },
  { key: "Confirmed", label: "Đã xác nhận" },
  { key: "PickedUp", label: "Đang thuê" },
  { key: "Completed", label: "Hoàn thành" },
];

function formatVND(value) {
  if (!value && value !== 0) return "—";
  return `${Number(value).toLocaleString("vi-VN")}đ`;
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────
function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [showContract, setShowContract] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getBookingDetail(id);
        setBooking(data);
        console.log("=== BOOKING DETAIL ===");
        console.log("ownerAgreedAt:", data.ownerAgreedAt);
        console.log("status:", data.status);
      } catch (err) {
        setError(err.message || "Không tải được đơn thuê.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  const CountdownTimer = ({ approvedAt, timeoutMinutes = 15 }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
      if (!approvedAt) return;

      console.log("ownerAgreedAt (raw):", approvedAt);

      // Ép đúng UTC để tránh lệch múi giờ
      const approvedUTC = new Date(approvedAt + "Z"); // Thêm "Z" để buộc UTC
      const endTime = approvedUTC.getTime() + timeoutMinutes * 60 * 1000;

      console.log("End time (UTC):", new Date(endTime).toISOString());

      const interval = setInterval(() => {
        const remaining = endTime - Date.now();

        if (remaining <= 0) {
          setTimeLeft("00:00");
          setIsExpired(true);
          clearInterval(interval);
          return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
      }, 1000);

      return () => clearInterval(interval);
    }, [approvedAt, timeoutMinutes]);

    return (
      <div
        style={{
          color: isExpired ? "#ef4444" : "#facc15",
          fontWeight: "700",
          margin: "12px 0",
          fontSize: "1.1rem",
        }}
      >
        ⏳{" "}
        {isExpired
          ? "Đơn đã hết hạn thanh toán"
          : `Còn ${timeLeft} để thanh toán`}
      </div>
    );
  };

  const handlePayOS = async () => {
    try {
      setPayLoading(true);
      const result = await createPayOSLink(id);
      if (result?.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.error("Không lấy được link thanh toán.");
      }
    } catch (err) {
      toast.error(err.message || "Lỗi kết nối thanh toán.");
    } finally {
      setPayLoading(false);
    }
  };

  const handlePrintContract = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <html>
      <head>
        <title>Hợp đồng thuê xe - ${booking.id}</title>
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
        <div class="content">${booking.contractSnapshot}</div>
        <div class="footer">
          <div class="signature">
            <p><strong>BÊN CHO THUÊ</strong></p>
            <p>(Ký và ghi rõ họ tên)</p>
            <br/><br/>
            <p>${booking.ownerNameSnapshot}</p>
          </div>
          <div class="signature">
            <p><strong>BÊN THUÊ</strong></p>
            <p>(Ký và ghi rõ họ tên)</p>
            <br/><br/>
            <p>${booking.customerNameSnapshot}</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `);
    printWindow.document.close();
  };

  // ─── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <CustomerHeader />
        <div style={styles.centerWrap}>
          <div style={styles.spinner} />
          <p style={{ color: "#6b7280", marginTop: 16 }}>
            Đang tải đơn thuê...
          </p>
        </div>
        <Footer />
      </>
    );
  }

  // ─── Error ───────────────────────────────────────────────────────────
  if (error || !booking) {
    return (
      <>
        <CustomerHeader />
        <div style={styles.centerWrap}>
          <AlertCircle size={48} color="#ef4444" />
          <p style={{ color: "#374151", fontWeight: 700, marginTop: 12 }}>
            {error || "Không tìm thấy đơn thuê."}
          </p>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            Quay lại
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const statusInfo = STATUS_MAP[booking.status] || STATUS_MAP["Pending"];
  const StatusIcon = statusInfo.icon;
  const currentStep = statusInfo.step;
  const isTerminal = currentStep === -1;
  const isRejected = booking.status === "Rejected";
  const isCancelled = booking.status === "Cancelled";

  return (
    <>
      <style>{css}</style>
      <CustomerHeader />

      <div className="bd-page">
        <div className="bd-container">
          {/* ── Breadcrumb ── */}
          <div className="bd-breadcrumb">
            <button
              onClick={() => navigate("/my-bookings")}
              className="bd-back-btn"
            >
              <ArrowLeft size={16} />
              Chuyến của tôi
            </button>
            <ChevronRight size={14} color="#9ca3af" />
            <span className="bd-breadcrumb-current">Chi tiết đơn thuê</span>
          </div>

          {/* ── Hero: Status + Tên xe ── */}
          <div
            className="bd-hero"
            style={{
              borderColor: statusInfo.border,
              background: statusInfo.bg,
            }}
          >
            <div className="bd-hero-left">
              <div
                className="bd-status-badge"
                style={{ background: statusInfo.color }}
              >
                <StatusIcon size={14} />
                {statusInfo.label}
              </div>
              <h1 className="bd-car-name">
                {booking.carNameSnapshot || "Xe không xác định"}
              </h1>
              <div className="bd-plate">
                <Hash size={13} />
                {booking.carLicensePlateSnapshot || "—"}
              </div>
            </div>
            <div className="bd-hero-right">
              <div className="bd-booking-id-label">Mã đơn</div>
              <div className="bd-booking-id">
                {String(booking.id).slice(0, 8).toUpperCase()}
              </div>
              <div className="bd-created-at">
                <Clock size={12} />
                Tạo lúc {formatDateTime(booking.createdAt)}
              </div>
            </div>
          </div>

          {/* ── Progress stepper (chỉ hiện khi không terminal) ── */}
          {!isTerminal && (
            <div className="bd-stepper">
              {STEPS.map((step, idx) => {
                const stepNum = idx + 1;
                const done = stepNum < currentStep;
                const active = stepNum === currentStep;
                return (
                  <div key={step.key} className="bd-step-wrap">
                    <div
                      className={`bd-step-node ${done ? "done" : ""} ${active ? "active" : ""}`}
                    >
                      {done ? <CheckCircle2 size={14} /> : stepNum}
                    </div>
                    <div className={`bd-step-label ${active ? "active" : ""}`}>
                      {step.label}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`bd-step-line ${done ? "done" : ""}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Rejected / Cancelled banner ── */}
          {isTerminal && (
            <div
              className="bd-terminal-banner"
              style={{
                borderColor: statusInfo.border,
                background: statusInfo.bg,
                color: statusInfo.color,
              }}
            >
              <XCircle size={18} />
              <span>
                {isRejected
                  ? "Đơn thuê này đã bị chủ xe từ chối."
                  : "Đơn thuê này đã bị huỷ."}
              </span>
            </div>
          )}

          {/* ── Grid nội dung ── */}
          <div className="bd-grid">
            {/* ── CỘT TRÁI ── */}
            <div className="bd-col-left">
              {/* Thông tin chuyến đi */}
              <div className="bd-card">
                <div className="bd-card-title">
                  <CalendarDays size={16} />
                  Thông tin chuyến đi
                </div>
                <div className="bd-info-rows">
                  <div className="bd-info-row">
                    <span className="bd-info-label">Nhận xe</span>
                    <span className="bd-info-value highlight">
                      {formatDateTime(booking.startAt)}
                    </span>
                  </div>
                  <div className="bd-info-row">
                    <span className="bd-info-label">Trả xe</span>
                    <span className="bd-info-value highlight">
                      {formatDateTime(booking.endAt)}
                    </span>
                  </div>
                  <div className="bd-info-row">
                    <span className="bd-info-label">Số ngày thuê</span>
                    <span className="bd-info-value">
                      {booking.rentalDays} ngày
                    </span>
                  </div>
                  <div className="bd-info-row">
                    <span className="bd-info-label">Hình thức nhận</span>
                    <span className="bd-info-value">
                      {booking.pickupType === 1 ? "Giao tận nơi" : "Tự đến lấy"}
                    </span>
                  </div>
                  <div className="bd-info-row">
                    <span className="bd-info-label">Địa điểm</span>
                    <span className="bd-info-value">
                      <MapPin
                        size={13}
                        style={{
                          marginRight: 4,
                          color: "#16a34a",
                          flexShrink: 0,
                        }}
                      />
                      {booking.pickupAddress || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Các bên liên quan */}
              <div className="bd-card">
                <div className="bd-card-title">
                  <User size={16} />
                  Các bên liên quan
                </div>
                <div className="bd-info-rows">
                  <div className="bd-info-row">
                    <span className="bd-info-label">Người thuê</span>
                    <span className="bd-info-value">
                      {booking.customerNameSnapshot || "—"}
                    </span>
                  </div>
                  <div className="bd-info-row">
                    <span className="bd-info-label">Chủ xe</span>
                    <span className="bd-info-value">
                      {booking.ownerNameSnapshot || "—"}
                    </span>
                  </div>
                </div>

                <div className="bd-agree-grid">
                  <div
                    className={`bd-agree-box ${booking.customerAgreedTerms ? "agreed" : ""}`}
                  >
                    {booking.customerAgreedTerms ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    <div>
                      <div className="bd-agree-name">Người thuê đã ký</div>
                      <div className="bd-agree-date">
                        {formatDate(booking.customerAgreedAt)}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`bd-agree-box ${booking.ownerAgreedTerms ? "agreed" : ""}`}
                  >
                    {booking.ownerAgreedTerms ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    <div>
                      <div className="bd-agree-name">Chủ xe đã ký</div>
                      <div className="bd-agree-date">
                        {booking.ownerAgreedAt
                          ? formatDate(booking.ownerAgreedAt)
                          : "Chưa xác nhận"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Giấy tờ & tài sản thế chấp */}
              <div className="bd-card">
                <div className="bd-card-title">
                  <Shield size={16} />
                  Giấy tờ & tài sản thế chấp
                </div>
                <div className="bd-info-rows">
                  <div className="bd-info-row">
                    <span className="bd-info-label">Giấy tờ thuê xe</span>
                    <span className="bd-info-value">
                      {booking.rentalPapers || "—"}
                    </span>
                  </div>
                  <div className="bd-info-row">
                    <span className="bd-info-label">Tài sản thế chấp</span>
                    <span className="bd-info-value">
                      {booking.collateral || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CỘT PHẢI ── */}
            <div className="bd-col-right">
              {/* CTA thanh toán */}
              {booking.status === "WaitingForDeposit" && (
                <div className="bd-cta-card">
                  <div className="bd-cta-icon">
                    <CreditCard size={22} color="#fff" />
                  </div>
                  <div className="bd-cta-title">Sẵn sàng thanh toán!</div>

                  <CountdownTimer
                    approvedAt={booking.ownerAgreedAt || booking.createdAt}
                    timeoutMinutes={15}
                  />

                  <button
                    className="bd-pay-btn"
                    onClick={handlePayOS}
                    disabled={payLoading}
                  >
                    Thanh toán ngay để giữ xe
                  </button>
                </div>
              )}

              {/* Hợp đồng PDF */}
              {booking.contractSnapshot && (
                <div className="bd-card">
                  <div className="bd-card-title">
                    <FileText size={16} />
                    Hợp đồng thuê xe
                  </div>
                  <button
                    onClick={handlePrintContract}
                    className="bd-pdf-link"
                    style={{
                      width: "100%",
                      border: "1px solid #86efac",
                      cursor: "pointer",
                      justifyContent: "center",
                    }}
                  >
                    <FileText size={18} />
                    Xem & In hợp đồng đầy đủ
                  </button>
                </div>
              )}

              {/* Chi phí */}
              <div className="bd-card">
                <div className="bd-card-title">
                  <CircleDollarSign size={16} />
                  Chi tiết chi phí
                </div>
                <div className="bd-price-rows">
                  <div className="bd-price-row">
                    <span>Giá thuê / ngày</span>
                    <span>{formatVND(booking.pricePerDay)}</span>
                  </div>
                  {booking.insurancePerDay > 0 && (
                    <div className="bd-price-row">
                      <span>Bảo hiểm / ngày</span>
                      <span>{formatVND(booking.insurancePerDay)}</span>
                    </div>
                  )}
                  <div className="bd-price-row">
                    <span>Số ngày thuê</span>
                    <span>{booking.rentalDays} ngày</span>
                  </div>
                  <div className="bd-price-row">
                    <span>Tạm tính</span>
                    <span>
                      {formatVND(
                        (Number(booking.pricePerDay) +
                          Number(booking.insurancePerDay || 0)) *
                          booking.rentalDays,
                      )}
                    </span>
                  </div>
                  {booking.discountAmount > 0 && (
                    <div className="bd-price-row discount">
                      <span>Giảm giá</span>
                      <span>- {formatVND(booking.discountAmount)}</span>
                    </div>
                  )}
                  <div className="bd-price-divider" />
                  <div className="bd-price-row total">
                    <span>Thành tiền</span>
                    <span>{formatVND(booking.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Nội dung hợp đồng dạng text */}
              {booking.contractSnapshot && (
                <div className="bd-card">
                  <div
                    className="bd-card-title"
                    style={{ cursor: "pointer", userSelect: "none" }}
                    onClick={() => setShowContract((p) => !p)}
                  >
                    <FileText size={16} />
                    Nội dung hợp đồng
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "0.8rem",
                        color: "#6b7280",
                      }}
                    >
                      {showContract ? "Ẩn ▲" : "Xem ▼"}
                    </span>
                  </div>
                  {showContract && (
                    <pre className="bd-contract-pre">
                      {booking.contractSnapshot}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

// ─── Inline styles (non-CSS-class) ───────────────────────────────────
const styles = {
  centerWrap: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #16a34a",
    borderRadius: "50%",
    animation: "bd-spin 0.8s linear infinite",
  },
  backBtn: {
    marginTop: 16,
    padding: "10px 24px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
};

// ─── CSS ──────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

  @keyframes bd-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes bd-fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .bd-page {
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Be Vietnam Pro', sans-serif;
    padding-bottom: 60px;
  }

  .bd-container {
    width: min(1100px, calc(100% - 48px));
    margin: 0 auto;
    animation: bd-fadeUp 0.45s ease both;
  }

  /* ── Breadcrumb ── */
  .bd-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 28px 0 20px;
  }
  .bd-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
  }
  .bd-back-btn:hover { color: #16a34a; }
  .bd-breadcrumb-current {
    font-size: 0.9rem;
    color: #9ca3af;
    font-weight: 500;
  }

  /* ── Hero ── */
  .bd-hero {
    border: 1.5px solid;
    border-radius: 18px;
    padding: 24px 28px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
  }
  .bd-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    color: #fff;
    font-size: 0.78rem;
    font-weight: 700;
    margin-bottom: 10px;
    letter-spacing: 0.3px;
  }
  .bd-car-name {
    font-size: 1.55rem;
    font-weight: 800;
    color: #111827;
    margin: 0 0 8px;
    line-height: 1.2;
  }
  .bd-plate {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #6b7280;
    background: #f3f4f6;
    padding: 4px 10px;
    border-radius: 8px;
  }
  .bd-hero-right {
    text-align: right;
  }
  .bd-booking-id-label {
    font-size: 0.75rem;
    color: #9ca3af;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  .bd-booking-id {
    font-size: 1.4rem;
    font-weight: 800;
    color: #111827;
    font-variant-numeric: tabular-nums;
    letter-spacing: 2px;
    margin: 4px 0;
  }
  .bd-created-at {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.78rem;
    color: #9ca3af;
  }

  /* ── Stepper ── */
  .bd-stepper {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 0;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 28px;
    flex-wrap: wrap;
    row-gap: 12px;
  }
  .bd-step-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;
    min-width: 80px;
  }
  .bd-step-node {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #f3f4f6;
    border: 2px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    color: #9ca3af;
    position: relative;
    z-index: 1;
    transition: 0.2s;
  }
  .bd-step-node.done {
    background: #dcfce7;
    border-color: #16a34a;
    color: #16a34a;
  }
  .bd-step-node.active {
    background: #16a34a;
    border-color: #16a34a;
    color: #fff;
    box-shadow: 0 0 0 4px #bbf7d0;
  }
  .bd-step-label {
    font-size: 0.72rem;
    color: #9ca3af;
    font-weight: 500;
    margin-top: 6px;
    text-align: center;
    max-width: 80px;
    line-height: 1.3;
  }
  .bd-step-label.active {
    color: #16a34a;
    font-weight: 700;
  }
  .bd-step-line {
    position: absolute;
    top: 15px;
    left: calc(50% + 16px);
    right: calc(-50% + 16px);
    height: 2px;
    background: #e5e7eb;
    z-index: 0;
  }
  .bd-step-line.done { background: #16a34a; }

  /* ── Terminal banner ── */
  .bd-terminal-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    border: 1.5px solid;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 28px;
  }

  /* ── Grid ── */
  .bd-grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 860px) {
    .bd-grid { grid-template-columns: 1fr; }
    .bd-car-name { font-size: 1.2rem; }
    .bd-hero-right { text-align: left; }
  }

  /* ── Card ── */
  .bd-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 20px 22px;
    margin-bottom: 16px;
  }
  .bd-card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.88rem;
    font-weight: 700;
    color: #111827;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f3f4f6;
  }
  .bd-card-title svg { color: #16a34a; flex-shrink: 0; }

  /* ── Info rows ── */
  .bd-info-rows { display: flex; flex-direction: column; gap: 10px; }
  .bd-info-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.88rem;
  }
  .bd-info-label {
    color: #6b7280;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 130px;
  }
  .bd-info-value {
    color: #111827;
    font-weight: 600;
    text-align: right;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .bd-info-value.highlight { color: #16a34a; }

  /* ── Agree grid ── */
  .bd-agree-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 14px;
  }
  .bd-agree-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    font-size: 0.8rem;
  }
  .bd-agree-box svg { color: #9ca3af; flex-shrink: 0; }
  .bd-agree-box.agreed { background: #f0fdf4; border-color: #86efac; }
  .bd-agree-box.agreed svg { color: #16a34a; }
  .bd-agree-name { font-weight: 700; color: #374151; line-height: 1.3; }
  .bd-agree-date { color: #9ca3af; font-size: 0.75rem; margin-top: 2px; }

  /* ── CTA card ── */
  .bd-cta-card {
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    border-radius: 16px;
    padding: 22px 22px 20px;
    margin-bottom: 16px;
    color: #fff;
    text-align: center;
  }
  .bd-cta-icon {
    width: 48px;
    height: 48px;
    background: rgba(255,255,255,0.2);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
  }
  .bd-cta-title {
    font-size: 1.05rem;
    font-weight: 800;
    margin-bottom: 6px;
  }
  .bd-cta-desc {
    font-size: 0.83rem;
    opacity: 0.85;
    line-height: 1.5;
    margin-bottom: 16px;
  }
  .bd-pay-btn {
    width: 100%;
    padding: 12px;
    background: #fff;
    color: #16a34a;
    border: none;
    border-radius: 12px;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    transition: 0.2s;
    font-family: 'Be Vietnam Pro', sans-serif;
  }
  .bd-pay-btn:hover:not(:disabled) { background: #f0fdf4; }
  .bd-pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── PDF link ── */
  .bd-pdf-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    border-radius: 10px;
    background: #f0fdf4;
    border: 1px solid #86efac;
    color: #15803d;
    font-weight: 700;
    font-size: 0.88rem;
    text-decoration: none;
    transition: 0.2s;
  }
  .bd-pdf-link:hover { background: #dcfce7; }

  /* ── Price rows ── */
  .bd-price-rows { display: flex; flex-direction: column; gap: 9px; }
  .bd-price-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.88rem;
    color: #374151;
    font-weight: 500;
  }
  .bd-price-row.discount { color: #16a34a; }
  .bd-price-row.total {
    font-size: 1rem;
    font-weight: 800;
    color: #111827;
  }
  .bd-price-divider {
    height: 1px;
    background: #f3f4f6;
    margin: 4px 0;
  }

  /* ── Contract pre ── */
  .bd-contract-pre {
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 14px;
    font-size: 0.78rem;
    color: #374151;
    white-space: pre-wrap;
    line-height: 1.7;
    max-height: 340px;
    overflow-y: auto;
    font-family: 'Be Vietnam Pro', monospace;
    margin-top: 4px;
  }
`;

export default BookingDetail;
