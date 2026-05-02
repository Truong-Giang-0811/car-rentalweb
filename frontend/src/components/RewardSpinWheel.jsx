import { useEffect, useMemo, useRef, useState } from "react";
import { Gift, Sparkles, Trophy, X } from "lucide-react";
import RewardWheelSvg from "./RewardWheelSvg";

function RewardSpinWheel({
  canSpin,
  remainingSpins,
  spinning,
  spinResult,
  lastSpin,
  onSpin,
  showPopup,
  onClosePopup,
}) {
  const [rotationDeg, setRotationDeg] = useState(0);
  const prevResultRef = useRef(null);

  const displayResult = spinResult || (!canSpin ? lastSpin : null);

  const rewardToSegmentIndex = useMemo(
    () => ({
      "Chúc bạn may mắn lần sau": [0, 4],
      "+10 điểm": [1, 5],
      "+20 điểm": [2, 6],
      "+50 điểm": [3, 7],
    }),
    []
  );

  useEffect(() => {
    if (!spinResult) return;
    if (prevResultRef.current === spinResult) return;
    prevResultRef.current = spinResult;

    const indexes = rewardToSegmentIndex[spinResult.rewardLabel] || [0];
    const targetIndex = indexes[Math.floor(Math.random() * indexes.length)];

    const segmentAngle = 360 / 8;
    const targetCenterAngle = targetIndex * segmentAngle + segmentAngle / 2;

    // Pointer ở đỉnh trên, nên bánh xe phải quay ngược lại để ô trúng lên đỉnh
    const finalAngle = 360 - targetCenterAngle;

    // quay nhiều vòng cho đẹp
    const extraTurns = 360 * 6;

    setRotationDeg((prev) => {
      const normalizedPrev = prev % 360;
      return prev + extraTurns + ((finalAngle - normalizedPrev + 360) % 360);
    });
  }, [spinResult, rewardToSegmentIndex]);

  const getPopupTone = () => {
    const label = spinResult?.rewardLabel || "";
    if (label.includes("+50")) return "jackpot";
    if (label.includes("+20")) return "good";
    if (label.includes("+10")) return "normal";
    return "miss";
  };

  return (
    <>
      <style>{`
        .reward-spin-page {
          background: linear-gradient(180deg, #eefbf8 0%, #ffffff 100%);
          border: 1px solid #c7f0e8;
          border-radius: 32px;
          padding: 28px;
          box-shadow: 0 20px 44px rgba(16, 185, 129, 0.08);
          overflow: hidden;
        }

        .reward-spin-grid {
          display: grid;
          grid-template-columns: minmax(280px, 1fr) 470px 290px;
          gap: 24px;
          align-items: start;
        }

        .reward-spin-left {
          padding-top: 8px;
        }

        .reward-spin-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 15px;
          border-radius: 999px;
          background: #dcfce7;
          color: #166534;
          font-size: 0.88rem;
          font-weight: 800;
          margin-bottom: 16px;
        }

        .reward-spin-title {
          font-size: 2.15rem;
          font-weight: 900;
          color: #065f46;
          line-height: 1.2;
          margin: 0 0 14px;
        }

        .reward-spin-desc {
          color: #4b5563;
          line-height: 1.8;
          font-size: 1rem;
          margin-bottom: 22px;
        }

        .reward-spin-highlight-list {
          display: grid;
          gap: 12px;
        }

        .reward-spin-highlight-item {
          background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
          border: 1px solid #d1d5db;
          border-radius: 18px;
          padding: 15px 16px;
          color: #374151;
          line-height: 1.65;
          font-size: 0.95rem;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.75);
        }

        .reward-spin-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          margin-top: -6px;
        }

        .reward-wheel-shell {
          position: relative;
          width: 430px;
          height: 430px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reward-wheel-glow {
          position: absolute;
          width: 392px;
          height: 392px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(20,184,166,0.14) 0%, rgba(20,184,166,0.04) 48%, transparent 74%);
          z-index: 0;
        }

        .reward-wheel-ring {
          position: absolute;
          width: 384px;
          height: 384px;
          border-radius: 50%;
          background: linear-gradient(145deg, #17c7bb, #0f9f99);
          box-shadow:
            inset 0 5px 8px rgba(255,255,255,0.14),
            inset 0 -6px 10px rgba(0,0,0,0.08),
            0 0 0 5px #d1fae5,
            0 0 16px rgba(20,184,166,0.12);
          z-index: 1;
        }

        .reward-wheel-image-wrap {
          width: 368px;
          height: 368px;
          position: relative;
          z-index: 3;
          border-radius: 50%;
          overflow: hidden;
          box-shadow:
            0 8px 22px rgba(0,0,0,0.06),
            inset 0 6px 10px rgba(255,255,255,0.26);
        }

        .reward-wheel-image {
            width: 100%;
            height: 100%;
            display: block;
            border-radius: 50%;
            transform: rotate(var(--wheel-rotate));
            transition: transform 2.8s cubic-bezier(0.15, 0.9, 0.2, 1);
        }

        .reward-wheel-pointer {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 18px solid transparent;
          border-right: 18px solid transparent;
          border-top: 44px solid #f97316;
          z-index: 6;
          filter: drop-shadow(0 4px 10px rgba(249, 115, 22, 0.32));
        }

        .reward-wheel-center-dot {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(180deg, #ffffff 0%, #e5e7eb 100%);
          border: 5px solid #16a34a;
          z-index: 7;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        }

        .reward-spin-actions {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          width: 100%;
        }

        .reward-spin-btn {
          min-width: 250px;
          height: 54px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #fff;
          font-size: 1rem;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 14px 24px rgba(34, 197, 94, 0.18);
        }

        .reward-spin-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .reward-spin-result {
          width: min(360px, 100%);
          background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
          border: 1px solid #d1fae5;
          border-radius: 18px;
          padding: 16px;
          text-align: center;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
        }

        .reward-spin-result-title {
          color: #065f46;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .reward-spin-result-value {
          color: #111827;
          font-size: 1.28rem;
          font-weight: 900;
        }

        .reward-spin-right {
          display: grid;
          gap: 16px;
          align-self: start;
          padding-top: 8px;
        }

        .reward-side-card {
          background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 18px;
          box-shadow:
            0 12px 26px rgba(15, 23, 42, 0.05),
            inset 0 1px 0 rgba(255,255,255,0.8);
        }

        .reward-side-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 900;
          color: #111827;
          margin-bottom: 12px;
        }

        .reward-side-card-title svg {
          color: #16a34a;
        }

        .reward-status-pill {
          display: inline-flex;
          align-items: center;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 0.86rem;
          font-weight: 800;
        }

        .reward-status-pill.ready {
          background: #dcfce7;
          color: #15803d;
        }

        .reward-status-pill.used {
          background: #f3f4f6;
          color: #6b7280;
        }

        .reward-side-text {
          color: #6b7280;
          line-height: 1.7;
          font-size: 0.94rem;
        }

        .reward-prize-list {
          display: grid;
          gap: 10px;
        }

        .reward-prize-item {
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          font-weight: 800;
        }

        .reward-prize-item.miss {
          background: #f3f4f6;
          color: #6b7280;
        }

        .reward-prize-item.p10 {
          background: #fffbeb;
          border-color: #fde68a;
          color: #92400e;
        }

        .reward-prize-item.p20 {
          background: #eef2f7;
          border-color: #cbd5e1;
          color: #0f766e;
        }

        .reward-prize-item.p50 {
          background: #dcfce7;
          border-color: #86efac;
          color: #166534;
        }

        .spin-popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .spin-popup {
          width: min(420px, 100%);
          border-radius: 26px;
          padding: 24px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
          position: relative;
          text-align: center;
          animation: popupIn 0.25s ease;
        }

        .spin-popup.jackpot { border: 2px solid #22c55e; }
        .spin-popup.good { border: 2px solid #14b8a6; }
        .spin-popup.normal { border: 2px solid #facc15; }
        .spin-popup.miss { border: 2px solid #cbd5e1; }

        .spin-popup-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: #f3f4f6;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spin-popup-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          margin: 0 auto 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .spin-popup.jackpot .spin-popup-icon { background: #dcfce7; }
        .spin-popup.good .spin-popup-icon { background: #ccfbf1; }
        .spin-popup.normal .spin-popup-icon { background: #fef9c3; }
        .spin-popup.miss .spin-popup-icon { background: #f3f4f6; }

        .spin-popup-title {
          font-size: 1.35rem;
          font-weight: 900;
          color: #111827;
          margin-bottom: 8px;
        }

        .spin-popup-value {
          font-size: 2rem;
          font-weight: 900;
          margin-bottom: 10px;
        }

        .spin-popup.jackpot .spin-popup-value { color: #16a34a; }
        .spin-popup.good .spin-popup-value { color: #0f766e; }
        .spin-popup.normal .spin-popup-value { color: #a16207; }
        .spin-popup.miss .spin-popup-value { color: #6b7280; }

        .spin-popup-desc {
          color: #6b7280;
          line-height: 1.7;
          margin-bottom: 18px;
        }

        .spin-popup-btn {
          min-width: 140px;
          height: 46px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #fff;
          font-weight: 800;
          cursor: pointer;
        }

        @keyframes popupIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 1199.98px) {
          .reward-spin-grid {
            grid-template-columns: 1fr;
          }

          .reward-spin-right {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 991.98px) {
          .reward-spin-right {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 767.98px) {
          .reward-spin-page {
            padding: 20px;
            border-radius: 24px;
          }

          .reward-spin-title {
            font-size: 1.75rem;
          }

          .reward-wheel-shell {
            width: 320px;
            height: 320px;
          }

         .reward-wheel-glow {
            width: 292px;
            height: 292px;
          }

        .reward-wheel-ring {
            width: 284px;
            height: 284px;
        }

        .reward-wheel-image-wrap {
            width: 276px;
            height: 276px;
        }

        .reward-spin-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="reward-spin-page">
        <div className="reward-spin-grid">
          <div className="reward-spin-left">
            <div className="reward-spin-chip">
              <Sparkles size={16} />
              <span>Vòng quay may mắn mỗi ngày</span>
            </div>

            <h2 className="reward-spin-title">Quay là có quà</h2>

            <div className="reward-spin-desc">
              Mỗi ngày bạn có cơ hội nhận điểm thưởng để đổi voucher ưu đãi thuê xe.
              Thử vận may ngay hôm nay và sưu tầm thêm nhiều phần quà hấp dẫn.
            </div>

            <div className="reward-spin-highlight-list">
              <div className="reward-spin-highlight-item">
                Mỗi lượt quay có thể nhận: trượt, +10 điểm, +20 điểm hoặc +50 điểm.
              </div>
              <div className="reward-spin-highlight-item">
                Điểm thưởng sẽ được cộng ngay và dùng để đổi voucher ở tab Đổi quà.
              </div>
            </div>
          </div>

          <div className="reward-spin-center">
            <div className="reward-wheel-shell">
              <div className="reward-wheel-glow"></div>
              <div className="reward-wheel-ring"></div>
              <div className="reward-wheel-pointer"></div>

              <div
                className="reward-wheel-image-wrap"
                style={{ "--wheel-rotate": `${rotationDeg}deg` }}
              >
              <div className="reward-wheel-image">
                    <RewardWheelSvg />
              </div>
              </div>

              <div className="reward-wheel-center-dot"></div>
            </div>

            <div className="reward-spin-actions">
              <button
                className="reward-spin-btn"
                onClick={onSpin}
                disabled={spinning || !canSpin}
              >
                {spinning
                  ? "Đang quay..."
                  : canSpin
                  ? `Quay ngay (${remainingSpins} lượt)`
                  : "Hết lượt hôm nay"}
              </button>

              {displayResult && (
                <div className="reward-spin-result">
                  <div className="reward-spin-result-title">Kết quả gần nhất</div>
                  <div className="reward-spin-result-value">
                    {displayResult.rewardLabel}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="reward-spin-right">
            <div className="reward-side-card">
              <div className="reward-side-card-title">
                <Trophy size={18} />
                <span>Lượt quay hôm nay</span>
              </div>

              <div className={`reward-status-pill ${canSpin ? "ready" : "used"}`}>
                {canSpin ? `Còn ${remainingSpins} lượt` : "Đã hết lượt"}
              </div>

              <div className="reward-side-text" style={{ marginTop: "12px" }}>
                Dùng hết lượt quay mỗi ngày để tích lũy thêm thật nhiều điểm thưởng.
              </div>
            </div>

            <div className="reward-side-card">
              <div className="reward-side-card-title">
                <Gift size={18} />
                <span>Phần thưởng có thể nhận</span>
              </div>

              <div className="reward-prize-list">
                <div className="reward-prize-item miss">Chúc bạn may mắn lần sau</div>
                <div className="reward-prize-item p10">+10 điểm</div>
                <div className="reward-prize-item p20">+20 điểm</div>
                <div className="reward-prize-item p50">+50 điểm</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPopup && spinResult && (
        <div className="spin-popup-overlay">
          <div className={`spin-popup ${getPopupTone()}`}>
            <button className="spin-popup-close" onClick={onClosePopup}>
              <X size={18} />
            </button>

            <div className="spin-popup-icon">
              {spinResult.rewardLabel.includes("+") ? "🎉" : "🍀"}
            </div>

            <div className="spin-popup-title">
              {spinResult.rewardLabel.includes("+")
                ? "Chúc mừng bạn!"
                : "Thêm một chút may mắn nữa nhé"}
            </div>

            <div className="spin-popup-value">{spinResult.rewardLabel}</div>

            <div className="spin-popup-desc">
              {spinResult.rewardLabel.includes("+")
                ? "Điểm thưởng đã được cộng ngay vào tài khoản của bạn."
                : "Bạn chưa nhận được điểm ở lượt này, nhưng vẫn còn nhiều cơ hội hấp dẫn phía trước."}
            </div>

            <button className="spin-popup-btn" onClick={onClosePopup}>
              Tuyệt vời
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default RewardSpinWheel;