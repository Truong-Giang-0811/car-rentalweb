import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerHeader from "../components/CustomerHeader.jsx";
import Footer from "../components/Footer.jsx";
import { getMyBookings } from "../services/bookingsService";
import {
  Car,
  CalendarDays,
  ChevronRight,
  Hourglass,
  CreditCard,
  BadgeCheck,
  Truck,
  PackageCheck,
  XCircle,
  AlertCircle,
  Search,
  Clock,
} from "lucide-react";

// ─── Status config ────────────────────────────────────────────────────
const STATUS_MAP = {
  Pending: {
    label: "Chờ xác nhận",
    color: "#f59e0b",
    bg: "#fffbeb",
    icon: Hourglass,
  },
  WaitingForDeposit: {
    label: "Chờ thanh toán",
    color: "#3b82f6",
    bg: "#eff6ff",
    icon: CreditCard,
  },
  Confirmed: {
    label: "Đã xác nhận",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    icon: BadgeCheck,
  },
  PickedUp: {
    label: "Đang thuê",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    icon: Truck,
  },
  Completed: {
    label: "Hoàn thành",
    color: "#16a34a",
    bg: "#f0fdf4",
    icon: PackageCheck,
  },
  Rejected: {
    label: "Bị từ chối",
    color: "#ef4444",
    bg: "#fef2f2",
    icon: XCircle,
  },
  Cancelled: {
    label: "Đã huỷ",
    color: "#6b7280",
    bg: "#f9fafb",
    icon: XCircle,
  },
  Expired: {
    label: "Đã hết hạn",
    color: "#ef4444",
    bg: "#fef2f2",
    icon: Clock,
  },
};

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "active", label: "Đang diễn ra" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã huỷ / Hết " },
];

const ACTIVE_STATUSES = ["WaitingForDeposit", "Confirmed", "PickedUp"];
const DONE_STATUSES = ["Completed"];
const CANCELLED_STATUSES = ["Rejected", "Cancelled", "Expired"];

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

function filterByTab(bookings, tab) {
  if (tab === "all") return bookings;
  if (tab === "active")
    return bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));
  if (tab === "completed")
    return bookings.filter((b) => DONE_STATUSES.includes(b.status));
  if (tab === "cancelled")
    return bookings.filter((b) => CANCELLED_STATUSES.includes(b.status));
  return bookings;
}

// ─── Component ────────────────────────────────────────────────────────
function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getMyBookings();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách chuyến.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = filterByTab(bookings, tab).filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (b.carNameSnapshot || "").toLowerCase().includes(q) ||
      (b.carLicensePlateSnapshot || "").toLowerCase().includes(q) ||
      (b.ownerName || "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <style>{css}</style>
      <CustomerHeader />

      <div className="mb-page">
        <div className="mb-container">
          {/* ── Header ── */}
          <div className="mb-header">
            <div>
              <h1 className="mb-title">Chuyến của tôi</h1>
              <p className="mb-subtitle">
                Quản lý toàn bộ lịch sử và đơn thuê xe của bạn
              </p>
            </div>
            <div className="mb-search-wrap">
              <Search size={15} className="mb-search-icon" />
              <input
                className="mb-search"
                placeholder="Tìm theo tên xe, biển số..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="mb-tabs">
            {TABS.map((t) => {
              const count = filterByTab(bookings, t.key).length;
              return (
                <button
                  key={t.key}
                  className={`mb-tab ${tab === t.key ? "active" : ""}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                  {count > 0 && (
                    <span
                      className={`mb-tab-count ${tab === t.key ? "active" : ""}`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="mb-center">
              <div className="mb-spinner" />
              <p style={{ color: "#6b7280", marginTop: 12 }}>
                Đang tải chuyến của bạn...
              </p>
            </div>
          ) : error ? (
            <div className="mb-center">
              <AlertCircle size={40} color="#ef4444" />
              <p style={{ color: "#374151", fontWeight: 600, marginTop: 10 }}>
                {error}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mb-empty">
              <Car size={52} color="#d1d5db" />
              <p className="mb-empty-title">Không có chuyến nào</p>
              <p className="mb-empty-sub">
                {search
                  ? "Không tìm thấy kết quả phù hợp."
                  : "Bạn chưa có đơn thuê xe nào trong mục này."}
              </p>
              <button
                className="mb-explore-btn"
                onClick={() => navigate("/home")}
              >
                Khám phá xe ngay
              </button>
            </div>
          ) : (
            <div className="mb-list">
              {filtered.map((b) => {
                const status = STATUS_MAP[b.status] || STATUS_MAP["Pending"];
                const Icon = status.icon;
                return (
                  <div
                    key={b.id}
                    className="mb-card"
                    onClick={() => navigate(`/bookings/${b.id}`)}
                  >
                    {/* Thumbnail */}
                    <div className="mb-card-thumb">
                      {b.thumbnail ? (
                        <img src={b.thumbnail} alt={b.carNameSnapshot} />
                      ) : (
                        <div className="mb-thumb-placeholder">
                          <Car size={28} color="#d1d5db" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="mb-card-info">
                      <div className="mb-card-top">
                        <div>
                          <div className="mb-car-name">
                            {b.carNameSnapshot || "Xe không xác định"}
                          </div>
                          <div className="mb-car-plate">
                            {b.carLicensePlateSnapshot || "—"}
                          </div>
                        </div>
                        <div
                          className="mb-status-badge"
                          style={{ color: status.color, background: status.bg }}
                        >
                          <Icon size={12} />
                          {status.label}
                        </div>
                      </div>

                      <div className="mb-card-meta">
                        <div className="mb-meta-item">
                          <CalendarDays size={13} />
                          <span>{formatDateTime(b.startAt)}</span>
                          <span className="mb-meta-sep">→</span>
                          <span>{formatDateTime(b.endAt)}</span>
                        </div>
                        {b.ownerName && (
                          <div className="mb-meta-item">
                            <Car size={13} />
                            <span>Chủ xe: {b.ownerName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total + arrow */}
                    <div className="mb-card-right">
                      <div className="mb-total">{formatVND(b.totalAmount)}</div>
                      <ChevronRight size={18} color="#9ca3af" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

  @keyframes mb-fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes mb-spin {
    to { transform: rotate(360deg); }
  }

  .mb-page {
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Be Vietnam Pro', sans-serif;
    padding-bottom: 60px;
  }
  .mb-container {
    width: min(900px, calc(100% - 40px));
    margin: 0 auto;
    animation: mb-fadeUp 0.4s ease both;
  }

  /* ── Header ── */
  .mb-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    padding: 36px 0 24px;
  }
  .mb-title {
    font-size: 1.7rem;
    font-weight: 800;
    color: #111827;
    margin: 0 0 4px;
  }
  .mb-subtitle {
    font-size: 0.88rem;
    color: #6b7280;
    margin: 0;
  }
  .mb-search-wrap {
    position: relative;
    align-self: flex-end;
  }
  .mb-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
  }
  .mb-search {
    padding: 10px 14px 10px 36px;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    font-size: 0.87rem;
    font-family: 'Be Vietnam Pro', sans-serif;
    width: 260px;
    outline: none;
    background: #fff;
    transition: border-color 0.2s;
  }
  .mb-search:focus { border-color: #16a34a; }

  /* ── Tabs ── */
  .mb-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 20px;
    border-bottom: 1.5px solid #e5e7eb;
    padding-bottom: 0;
  }
  .mb-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border: none;
    background: none;
    font-size: 0.87rem;
    font-weight: 600;
    color: #6b7280;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1.5px;
    transition: 0.2s;
    font-family: 'Be Vietnam Pro', sans-serif;
    white-space: nowrap;
  }
  .mb-tab:hover { color: #16a34a; }
  .mb-tab.active {
    color: #16a34a;
    border-bottom-color: #16a34a;
  }
  .mb-tab-count {
    padding: 1px 7px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    background: #f3f4f6;
    color: #6b7280;
  }
  .mb-tab-count.active {
    background: #dcfce7;
    color: #16a34a;
  }

  /* ── Center states ── */
  .mb-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    gap: 8px;
  }
  .mb-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #e5e7eb;
    border-top-color: #16a34a;
    border-radius: 50%;
    animation: mb-spin 0.8s linear infinite;
  }

  /* ── Empty ── */
  .mb-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80px 20px;
    gap: 8px;
  }
  .mb-empty-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #374151;
    margin: 8px 0 0;
  }
  .mb-empty-sub {
    font-size: 0.87rem;
    color: #9ca3af;
    text-align: center;
  }
  .mb-explore-btn {
    margin-top: 16px;
    padding: 11px 28px;
    background: #16a34a;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    font-family: 'Be Vietnam Pro', sans-serif;
    transition: background 0.2s;
  }
  .mb-explore-btn:hover { background: #15803d; }

  /* ── List ── */
  .mb-list { display: flex; flex-direction: column; gap: 12px; }

  /* ── Card ── */
  .mb-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 16px 18px;
    cursor: pointer;
    transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s;
  }
  .mb-card:hover {
    border-color: #86efac;
    box-shadow: 0 4px 20px rgba(22,163,74,0.08);
    transform: translateY(-1px);
  }

  /* Thumbnail */
  .mb-card-thumb {
    width: 88px;
    height: 66px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f3f4f6;
  }
  .mb-card-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .mb-thumb-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Info */
  .mb-card-info { flex: 1; min-width: 0; }
  .mb-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
  }
  .mb-car-name {
    font-size: 0.97rem;
    font-weight: 700;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 260px;
  }
  .mb-car-plate {
    font-size: 0.78rem;
    color: #6b7280;
    font-weight: 500;
    margin-top: 2px;
  }
  .mb-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.76rem;
    font-weight: 700;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .mb-card-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .mb-meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    color: #6b7280;
    font-weight: 500;
  }
  .mb-meta-item svg { color: #9ca3af; flex-shrink: 0; }
  .mb-meta-sep { color: #d1d5db; }

  /* Right */
  .mb-card-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }
  .mb-total {
    font-size: 1rem;
    font-weight: 800;
    color: #111827;
    white-space: nowrap;
  }

  @media (max-width: 600px) {
    .mb-card { flex-wrap: wrap; }
    .mb-card-thumb { width: 72px; height: 56px; }
    .mb-search { width: 100%; }
    .mb-header { flex-direction: column; }
    .mb-car-name { max-width: 180px; }
  }
`;

export default MyBookings;
