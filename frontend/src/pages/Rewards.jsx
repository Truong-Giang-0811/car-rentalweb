import { useEffect, useMemo, useState } from "react";
import CustomerHeader from "../components/CustomerHeader";
import Footer from "../components/Footer";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  getMyRewardVouchers,
  getSpinStatus,
  spinReward,
  getRewardHistory,
} from "../services/voucherService";
import { useNavigate } from "react-router-dom";
import RewardSpinWheel from "../components/RewardSpinWheel";
import {
  Gift,
  TicketPercent,
  Wallet,
  Sparkles,
  BadgePercent,
  Clock3,
  CheckCircle2,
} from "lucide-react";

function Rewards() {
  const [points, setPoints] = useState(0);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("redeem");
  const [myVouchers, setMyVouchers] = useState([]);
  const [spinStatus, setSpinStatus] = useState({
    canSpin: false,
    remainingSpins: 0,
    lastSpin: null,
  });
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [showSpinPopup, setShowSpinPopup] = useState(false);
  const [rewardHistory, setRewardHistory] = useState([]);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setPageLoading(true);

      const [pointRes, voucherRes, myVoucherRes, spinStatusRes, historyRes] =
        await Promise.all([
          api.get("/rewards/me"),
          api.get("/rewards/redeemable-vouchers"),
          getMyRewardVouchers(),
          getSpinStatus(),
          getRewardHistory(),
        ]);

      setSpinStatus(
        spinStatusRes || {
          canSpin: false,
          remainingSpins: 0,
          lastSpin: null,
        }
      );
      setPoints(pointRes.data?.totalPoints || 0);
      setVouchers(Array.isArray(voucherRes.data) ? voucherRes.data : []);
      setMyVouchers(Array.isArray(myVoucherRes) ? myVoucherRes : []);
      setRewardHistory(Array.isArray(historyRes) ? historyRes : []);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải dữ liệu quà tặng");
      setVouchers([]);
      setMyVouchers([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRedeem = async (voucher) => {
    if (points < voucher.redeemPoints) {
      toast.error("Bạn chưa đủ điểm để đổi voucher này");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/rewards/redeem/${voucher.id}`);
      toast.success(res.data?.message || "Đổi voucher thành công");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Đổi voucher thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async () => {
    if (!spinStatus?.canSpin) {
      toast.error("Bạn đã dùng hết lượt quay hôm nay rồi");
      return;
    }

    try {
      setSpinning(true);
      setSpinResult(null);

      const result = await spinReward();

      setSpinResult(result.reward);
      setSpinStatus({
        canSpin: result.canSpin,
        remainingSpins: result.remainingSpins ?? 0,
        lastSpin: result.reward,
      });
      setPoints(result.totalPoints || 0);

      setTimeout(() => {
        setShowSpinPopup(true);
      }, 3000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSpinning(false);
    }
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === "") return "0đ";
    return `${Number(value).toLocaleString("vi-VN")}đ`;
  };

  const formatDate = (value) => {
    if (!value) return "Đang cập nhật";
    return new Date(value).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (value) => {
    if (!value) return "Đang cập nhật";
    return new Date(value).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    };

  const isPercentageType = (discountType) =>
    discountType === "Percentage" || discountType === 1;

  const totalVoucher = vouchers.length;

  const bestVoucher = useMemo(() => {
    if (!vouchers.length) return null;
    return [...vouchers].sort(
      (a, b) => Number(b.discountValue || 0) - Number(a.discountValue || 0)
    )[0];
  }, [vouchers]);

  const getVoucherStatus = (voucher) => {
    const status = String(voucher.status ?? "").toLowerCase();

    if (status === "used" || status === "1") {
      return { text: "Đã dùng", className: "used" };
    }

    if (status === "expired" || status === "2") {
      return { text: "Hết hạn", className: "expired" };
    }

    return { text: "Chưa dùng", className: "unused" };
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Đã sao chép mã voucher");
    } catch (error) {
      toast.error("Không thể sao chép mã");
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .rewards-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fffb 0%, #ffffff 28%);
        }

        .page-container {
          width: min(1400px, calc(100% - 120px));
          margin: 0 auto;
        }

        .rewards-section {
          padding: 32px 0 80px;
        }

        .rewards-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
          gap: 24px;
          margin-bottom: 30px;
        }

        .rewards-main-card {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 55%, #4ade80 100%);
          color: #fff;
          padding: 30px 32px;
          min-height: 260px;
          box-shadow: 0 22px 50px rgba(34, 197, 94, 0.18);
        }

        .rewards-main-card::before {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          right: -60px;
          top: -40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
        }

        .rewards-main-card::after {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          left: -50px;
          bottom: -70px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
        }

        .hero-content {
          position: relative;
          z-index: 2;
        }

        .hero-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.16);
          font-size: 0.92rem;
          font-weight: 700;
          margin-bottom: 18px;
        }

        .hero-title {
          font-size: 2.2rem;
          font-weight: 900;
          line-height: 1.2;
          margin: 0 0 12px;
        }

        .hero-subtitle {
          max-width: 680px;
          font-size: 1rem;
          line-height: 1.7;
          color: rgba(255,255,255,0.92);
          margin-bottom: 22px;
        }

        .points-big {
          display: inline-flex;
          align-items: baseline;
          gap: 10px;
        }

        .points-big-number {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1;
        }

        .points-big-label {
          font-size: 1rem;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
        }

        .hero-note-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .hero-note {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(255,255,255,0.14);
          font-size: 0.93rem;
          font-weight: 600;
        }

        .rewards-side {
          display: grid;
          gap: 18px;
        }

        .mini-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 22px;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
        }

        .mini-card-head {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 12px;
        }

        .mini-card-head svg {
          color: #16a34a;
        }

        .mini-card-value {
          font-size: 1.95rem;
          font-weight: 900;
          color: #111827;
          margin-bottom: 8px;
        }

        .mini-card-text {
          color: #6b7280;
          line-height: 1.6;
          font-size: 0.94rem;
        }

        .best-voucher-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 18px;
          padding: 14px;
          margin-top: 12px;
        }

        .best-voucher-box svg {
          color: #16a34a;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .best-voucher-title {
          font-weight: 800;
          color: #166534;
          margin-bottom: 4px;
        }

        .best-voucher-text {
          color: #166534;
          line-height: 1.6;
          font-size: 0.92rem;
        }

        .reward-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }

        .reward-tab-btn {
          border: 1px solid #d1d5db;
          background: #fff;
          color: #374151;
          height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .reward-tab-btn:hover {
          background: #f9fafb;
        }

        .reward-tab-btn.active {
          background: #16a34a;
          color: #fff;
          border-color: #16a34a;
        }

        .rewards-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .rewards-title {
          font-size: 2rem;
          font-weight: 900;
          color: #111827;
          margin: 0 0 6px;
        }

        .rewards-subtitle {
          color: #6b7280;
          margin: 0;
          line-height: 1.7;
        }

        .voucher-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .voucher-card {
          position: relative;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 26px;
          overflow: hidden;
          transition: 0.25s ease;
          box-shadow: 0 12px 26px rgba(15, 23, 42, 0.05);
        }

        .voucher-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 38px rgba(15, 23, 42, 0.10);
        }

        .voucher-top {
          display: flex;
          min-height: 145px;
        }

        .voucher-left {
          width: 118px;
          background: linear-gradient(180deg, #dcfce7 0%, #f0fdf4 100%);
          border-right: 2px dashed #cbd5e1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px 10px;
        }

        .voucher-discount-value {
          font-size: 1.6rem;
          font-weight: 900;
          color: #16a34a;
          text-align: center;
          line-height: 1.2;
        }

        .voucher-discount-unit {
          font-size: 0.82rem;
          font-weight: 800;
          color: #15803d;
          margin-top: 6px;
        }

        .voucher-right {
          flex: 1;
          padding: 18px 18px 14px;
        }

        .voucher-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          font-size: 0.74rem;
          font-weight: 800;
          color: #16a34a;
          background: #dcfce7;
          border-radius: 999px;
          padding: 5px 10px;
        }

        .voucher-name {
          font-size: 1.05rem;
          font-weight: 900;
          color: #111827;
          margin-bottom: 10px;
          padding-right: 68px;
          line-height: 1.4;
        }

        .voucher-meta {
          display: grid;
          gap: 8px;
          color: #4b5563;
          font-size: 0.92rem;
        }

        .voucher-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          line-height: 1.5;
        }

        .voucher-meta-row svg {
          color: #16a34a;
          flex-shrink: 0;
        }

        .voucher-bottom {
          padding: 0 18px 18px;
        }

        .voucher-divider {
          height: 1px;
          background: #eef2f7;
          margin-bottom: 14px;
        }

        .voucher-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .voucher-point-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .voucher-point-label {
          color: #6b7280;
          font-size: 0.86rem;
          font-weight: 600;
        }

        .voucher-point-value {
          color: #111827;
          font-size: 1.1rem;
          font-weight: 900;
        }

        .redeem-btn {
          min-width: 126px;
          height: 46px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #fff;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .redeem-btn:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        .redeem-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .redeem-btn.disabled-point {
          background: #e5e7eb;
          color: #6b7280;
        }

        .empty-box,
        .loading-box {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 50px 24px;
          text-align: center;
          color: #6b7280;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
        }

        .empty-icon {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          margin: 0 auto 14px;
          background: #f0fdf4;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-icon svg {
          color: #16a34a;
        }

        .empty-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 6px;
        }

        .empty-text {
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .my-voucher-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .my-voucher-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 20px;
          box-shadow: 0 12px 26px rgba(15, 23, 42, 0.05);
        }

        .my-voucher-card.unused {
          border-color: #bbf7d0;
        }

        .my-voucher-card.used {
          opacity: 0.75;
        }

        .my-voucher-card.expired {
          opacity: 0.7;
          border-color: #fecaca;
        }

        .my-voucher-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 14px;
        }

        .my-voucher-title {
          font-size: 1.05rem;
          font-weight: 900;
          color: #111827;
          margin-bottom: 6px;
        }

        .my-voucher-status {
          display: inline-flex;
          align-items: center;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 800;
          background: #f3f4f6;
          color: #374151;
        }

        .my-voucher-discount {
          font-size: 1.15rem;
          font-weight: 900;
          color: #16a34a;
          white-space: nowrap;
        }

        .my-voucher-code-box {
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 14px;
        }

        .my-voucher-code-label {
          color: #6b7280;
          font-size: 0.86rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .my-voucher-code {
          font-family: monospace;
          font-size: 1.05rem;
          font-weight: 900;
          color: #111827;
          word-break: break-all;
        }

        .my-voucher-meta {
          display: grid;
          gap: 6px;
          color: #4b5563;
          font-size: 0.92rem;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .my-voucher-actions {
          display: flex;
          justify-content: flex-end;
        }

        .copy-btn {
          border: none;
          height: 42px;
          padding: 0 16px;
          border-radius: 12px;
          background: #16a34a;
          color: #fff;
          font-weight: 800;
          cursor: pointer;
        }

        .copy-btn:hover {
          opacity: 0.95;
        }

        .rewards-back {
          margin-bottom: 18px;
        }

        .rewards-back button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: transparent;
          color: #16a34a;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          padding: 0;
        }

        .rewards-back button:hover {
          opacity: 0.85;
        }

        .history-list {
            display: grid;
            gap: 16px;
        }

        .history-card {
            display: grid;
            grid-template-columns: 64px minmax(0, 1fr) auto;
            gap: 16px;
            align-items: center;
            background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
            border: 1px solid #e5e7eb;
            border-radius: 22px;
            padding: 18px;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
        }

        .history-left {
            display: flex;
            justify-content: center;
        }

        .history-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            font-size: 1.25rem;
        }

        .history-icon.spin {
            background: #ecfeff;
        }

        .history-icon.redeem {
            background: #f0fdf4;
        }

        .history-main {
            min-width: 0;
        }

        .history-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 6px;
        }

        .history-title {
            font-size: 1rem;
            font-weight: 900;
            color: #111827;
        }

        .history-date {
            color: #6b7280;
            font-size: 0.9rem;
            white-space: nowrap;
        }

        .history-desc {
            color: #374151;
            font-size: 0.96rem;
            line-height: 1.6;
            margin-bottom: 6px;
        }

        .history-code {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 10px;
            background: #f8fafc;
            border: 1px dashed #cbd5e1;
            font-family: monospace;
            font-size: 0.9rem;
            font-weight: 800;
            color: #111827;
        }

        .history-right {
            display: flex;
            justify-content: flex-end;
        }

        .history-point {
            font-size: 0.96rem;
            font-weight: 900;
            white-space: nowrap;
        }

        .history-point.spin {
            color: #16a34a;
        }

        .history-point.redeem {
            color: #ea580c;
        }

        @media (max-width: 767.98px) {
        .history-card {
            grid-template-columns: 1fr;
        }

        .history-top {
            flex-direction: column;
            gap: 6px;
        }

        .history-right {
            justify-content: flex-start;
        }

        .history-date {
            white-space: normal;
        }
        }

        @media (max-width: 1199.98px) {
          .voucher-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .rewards-hero {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 991.98px) {
          .my-voucher-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 767.98px) {
          .page-container {
            width: calc(100% - 24px);
          }

          .rewards-section {
            padding: 24px 0 60px;
          }

          .voucher-grid {
            grid-template-columns: 1fr;
          }

          .rewards-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-title {
            font-size: 1.7rem;
          }

          .points-big-number {
            font-size: 2.35rem;
          }

          .voucher-top {
            flex-direction: column;
          }

          .voucher-left {
            width: 100%;
            min-height: 92px;
            border-right: none;
            border-bottom: 2px dashed #cbd5e1;
          }

          .voucher-bottom-row {
            flex-direction: column;
            align-items: stretch;
          }

          .redeem-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="rewards-page">
        <CustomerHeader />

        <section className="rewards-section">
          <div className="page-container">
            <div className="rewards-back">
              <button onClick={() => navigate(-1)}>← Quay lại</button>
            </div>

            <div className="rewards-hero">
              <div className="rewards-main-card">
                <div className="hero-content">
                  <div className="hero-chip">
                    <Sparkles size={16} />
                    <span>Kho quà tặng dành riêng cho bạn</span>
                  </div>

                  <h1 className="hero-title">
                    Tích điểm và đổi ngay
                    <br />
                    các voucher ưu đãi thuê xe
                  </h1>

                  <div className="hero-subtitle">
                    Sử dụng điểm thưởng để đổi các mã ưu đãi hấp dẫn. Voucher sau khi đổi
                    sẽ có thể dùng ở phần mã khuyến mãi khi đặt xe.
                  </div>

                  <div className="points-big">
                    <span className="points-big-number">{points}</span>
                    <span className="points-big-label">điểm hiện có</span>
                  </div>

                  <div className="hero-note-row">
                    <div className="hero-note">
                      <Gift size={16} />
                      <span>{totalVoucher} voucher đang có thể đổi</span>
                    </div>
                    <div className="hero-note">
                      <CheckCircle2 size={16} />
                      <span>Đổi xong nhận mã dùng ngay</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rewards-side">
                <div className="mini-card">
                  <div className="mini-card-head">
                    <Wallet size={18} />
                    <span>Số dư điểm thưởng</span>
                  </div>
                  <div className="mini-card-value">{points} điểm</div>
                  <div className="mini-card-text">
                    Điểm thưởng được dùng để đổi voucher giảm giá. Sau khi đổi thành công,
                    hệ thống sẽ trừ điểm tương ứng và tạo mã voucher cho bạn.
                  </div>
                </div>

                <div className="mini-card">
                  <div className="mini-card-head">
                    <TicketPercent size={18} />
                    <span>Gợi ý tốt nhất</span>
                  </div>

                  {bestVoucher ? (
                    <div className="best-voucher-box">
                      <BadgePercent size={18} />
                      <div>
                        <div className="best-voucher-title">{bestVoucher.title}</div>
                        <div className="best-voucher-text">
                          Cần {bestVoucher.redeemPoints} điểm để đổi •{" "}
                          {isPercentageType(bestVoucher.discountType)
                            ? `Giảm ${bestVoucher.discountValue}%`
                            : `Giảm ${Number(bestVoucher.discountValue).toLocaleString("vi-VN")}đ`}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mini-card-text">
                      Hiện chưa có voucher phù hợp để đổi.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="reward-tabs">
              <button
                className={`reward-tab-btn ${activeTab === "redeem" ? "active" : ""}`}
                onClick={() => setActiveTab("redeem")}
              >
                Đổi quà
              </button>

              <button
                className={`reward-tab-btn ${activeTab === "mine" ? "active" : ""}`}
                onClick={() => setActiveTab("mine")}
              >
                Voucher của tôi
              </button>

              <button
                className={`reward-tab-btn ${activeTab === "spin" ? "active" : ""}`}
                onClick={() => setActiveTab("spin")}
              >
                Vòng quay may mắn
              </button>

              <button
                className={`reward-tab-btn ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                Lịch sử
              </button>
            </div>

            <div className="rewards-header">
              <div>
                <h2 className="rewards-title">
                  {activeTab === "redeem"
                    ? "Đổi điểm lấy voucher"
                    : activeTab === "mine"
                    ? "Voucher của tôi"
                    : activeTab === "spin"
                    ? "Vòng quay may mắn"
                    : "Lịch sử quà tặng"}
                </h2>

                <p className="rewards-subtitle">
                  {activeTab === "redeem"
                    ? "Chọn voucher phù hợp với nhu cầu của bạn. Hệ thống sẽ trừ điểm ngay sau khi đổi thành công."
                    : activeTab === "mine"
                    ? "Danh sách các voucher bạn đã đổi thành công và có thể sử dụng."
                    : activeTab === "spin"
                    ? "Quay để nhận điểm thưởng mỗi ngày. Điểm có thể dùng để đổi voucher."
                    : "Theo dõi toàn bộ hoạt động đổi quà và vòng quay may mắn của bạn."}
                </p>
              </div>
            </div>

            {activeTab === "redeem" && (
              <>
                {pageLoading ? (
                  <div className="loading-box">Đang tải danh sách voucher...</div>
                ) : vouchers.length === 0 ? (
                  <div className="empty-box">
                    <div className="empty-icon">
                      <Gift size={30} />
                    </div>
                    <div className="empty-title">Hiện chưa có voucher để đổi</div>
                    <div className="empty-text">
                      Quản trị viên chưa mở voucher đổi điểm hoặc tất cả voucher đã hết lượt.
                      Bạn quay lại sau nhé.
                    </div>
                  </div>
                ) : (
                  <div className="voucher-grid">
                    {vouchers.map((voucher) => {
                      const enoughPoints = points >= Number(voucher.redeemPoints || 0);

                      return (
                        <div className="voucher-card" key={voucher.id}>
                          <div className="voucher-badge">Đổi điểm</div>

                          <div className="voucher-top">
                            <div className="voucher-left">
                              <div className="voucher-discount-value">
                                {isPercentageType(voucher.discountType)
                                  ? Number(voucher.discountValue)
                                  : Number(voucher.discountValue).toLocaleString("vi-VN")}
                              </div>
                              <div className="voucher-discount-unit">
                                {isPercentageType(voucher.discountType) ? "%" : "VNĐ"}
                              </div>
                            </div>

                            <div className="voucher-right">
                              <div className="voucher-name">{voucher.title}</div>

                              <div className="voucher-meta">
                                <div className="voucher-meta-row">
                                  <BadgePercent size={16} />
                                  <span>
                                    {isPercentageType(voucher.discountType)
                                      ? `Giảm ${voucher.discountValue}%`
                                      : `Giảm ${formatMoney(voucher.discountValue)}`}
                                  </span>
                                </div>

                                {voucher.minOrderValue ? (
                                  <div className="voucher-meta-row">
                                    <Wallet size={16} />
                                    <span>Đơn tối thiểu {formatMoney(voucher.minOrderValue)}</span>
                                  </div>
                                ) : null}

                                <div className="voucher-meta-row">
                                  <Clock3 size={16} />
                                  <span>Hạn dùng đến {formatDate(voucher.endAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="voucher-bottom">
                            <div className="voucher-divider"></div>

                            <div className="voucher-bottom-row">
                              <div className="voucher-point-box">
                                <span className="voucher-point-label">Cần để đổi</span>
                                <span className="voucher-point-value">
                                  {voucher.redeemPoints} điểm
                                </span>
                              </div>

                              <button
                                className={`redeem-btn ${!enoughPoints ? "disabled-point" : ""}`}
                                onClick={() => handleRedeem(voucher)}
                                disabled={loading || !enoughPoints}
                              >
                                {!enoughPoints ? "Không đủ điểm" : "Đổi ngay"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === "mine" && (
              <>
                {pageLoading ? (
                  <div className="loading-box">Đang tải voucher của bạn...</div>
                ) : myVouchers.length === 0 ? (
                  <div className="empty-box">
                    <div className="empty-icon">
                      <TicketPercent size={30} />
                    </div>
                    <div className="empty-title">Bạn chưa có voucher nào</div>
                    <div className="empty-text">
                      Hãy đổi điểm để nhận voucher ưu đãi. Sau khi đổi thành công, mã voucher sẽ xuất hiện tại đây.
                    </div>
                  </div>
                ) : (
                  <div className="my-voucher-grid">
                    {myVouchers.map((voucher) => {
                      const statusInfo = getVoucherStatus(voucher);

                      return (
                        <div className={`my-voucher-card ${statusInfo.className}`} key={voucher.id}>
                          <div className="my-voucher-top">
                            <div>
                              <div className="my-voucher-title">{voucher.title}</div>
                              <div className="my-voucher-status">{statusInfo.text}</div>
                            </div>

                            <div className="my-voucher-discount">
                              {isPercentageType(voucher.discountType)
                                ? `${voucher.discountValue}%`
                                : formatMoney(voucher.discountValue)}
                            </div>
                          </div>

                          <div className="my-voucher-code-box">
                            <div className="my-voucher-code-label">Mã voucher</div>
                            <div className="my-voucher-code">{voucher.code}</div>
                          </div>

                          <div className="my-voucher-meta">
                            <div>Hạn dùng: {formatDate(voucher.expiredAt)}</div>
                            {voucher.minOrderValue ? (
                              <div>Đơn tối thiểu: {formatMoney(voucher.minOrderValue)}</div>
                            ) : null}
                          </div>

                          <div className="my-voucher-actions">
                            <button
                              className="copy-btn"
                              onClick={() => copyToClipboard(voucher.code)}
                            >
                              Sao chép mã
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === "spin" && (
              <RewardSpinWheel
                points={points}
                canSpin={spinStatus?.canSpin}
                remainingSpins={spinStatus?.remainingSpins || 0}
                spinning={spinning}
                spinResult={spinResult}
                lastSpin={spinStatus?.lastSpin}
                onSpin={handleSpin}
                showPopup={showSpinPopup}
                onClosePopup={() => setShowSpinPopup(false)}
              />
            )}

            {activeTab === "history" && (
                <>
                    {pageLoading ? (
                    <div className="loading-box">Đang tải lịch sử...</div>
                    ) : rewardHistory.length === 0 ? (
                    <div className="empty-box">
                        <div className="empty-icon">
                        <Gift size={30} />
                        </div>
                        <div className="empty-title">Chưa có lịch sử nào</div>
                        <div className="empty-text">
                        Khi bạn quay thưởng hoặc đổi voucher, lịch sử sẽ được hiển thị tại đây.
                        </div>
                    </div>
                    ) : (
                    <div className="history-list">
                        {rewardHistory.map((item, index) => (
                        <div className="history-card" key={`${item.type}-${item.createdAt}-${index}`}>
                            <div className="history-left">
                            <div className={`history-icon ${item.type}`}>
                                {item.type === "spin" ? "🎡" : "🎁"}
                            </div>
                            </div>

                            <div className="history-main">
                            <div className="history-top">
                                <div className="history-title">{item.title}</div>
                                <div className="history-date">{formatDateTime(item.createdAt)}</div>
                            </div>

                            <div className="history-desc">{item.description}</div>

                            {item.code ? (
                                <div className="history-code">Mã voucher: {item.code}</div>
                            ) : null}
                            </div>

                            <div className="history-right">
                            <div className={`history-point ${item.type}`}>
                                {item.type === "redeem"
                                ? `- ${item.points} điểm`
                                : item.points > 0
                                ? `+ ${item.points} điểm`
                                : "Không trúng"}
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </>
                )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default Rewards;