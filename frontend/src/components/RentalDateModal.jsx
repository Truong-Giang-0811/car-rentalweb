import { useEffect, useMemo, useState } from "react";

function RentalDateModal({
  open,
  onClose,
  startValue,
  endValue,
  onConfirm,
}) {
  const [startDateTime, setStartDateTime] = useState(startValue || "");
  const [endDateTime, setEndDateTime] = useState(endValue || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setStartDateTime(startValue || "");
    setEndDateTime(endValue || "");
  }, [startValue, endValue, open]);

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 4);
    return d;
  }, []);

  const toInputDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const minInput = toInputDateTime(new Date());
  const maxInput = toInputDateTime(maxDate);

  const validate = () => {
    if (!startDateTime || !endDateTime) {
      return "Vui lòng chọn đầy đủ thời gian nhận xe và trả xe.";
    }

    const now = new Date();
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (start < now) {
      return "Thời gian nhận xe không được nhỏ hơn thời gian hiện tại.";
    }

    if (end < now) {
      return "Thời gian trả xe không được nhỏ hơn thời gian hiện tại.";
    }

    if (end <= start) {
      return "Thời gian trả xe phải sau thời gian nhận xe.";
    }

    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < 1) {
      return "Thời gian thuê tối thiểu là 1 ngày.";
    }

    if (diffDays > 30) {
      return "Giới hạn thời gian thuê xe tối đa 30 ngày. Bạn vui lòng điều chỉnh lại thời gian phù hợp";
    }

    return "";
  };

  const handleConfirm = () => {
    const message = validate();
    setError(message);

    if (message) return;

    onConfirm(startDateTime, endDateTime);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="rental-modal-overlay" onClick={onClose}>
      <div className="rental-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rental-modal-header">
          <h3>Thời gian</h3>
          <button type="button" className="rental-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="rental-modal-body">
          <div className="rental-mode-title">Thuê theo ngày</div>

          <div className="rental-form-grid">
            <div className="rental-field">
              <label>Nhận xe</label>
              <input
                type="datetime-local"
                step="1800"
                min={minInput}
                max={maxInput}
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
              />
            </div>

            <div className="rental-field">
              <label>Trả xe</label>
              <input
                type="datetime-local"
                step="1800"
                min={startDateTime || minInput}
                max={maxInput}
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rental-error-box">
              <span className="warning-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="rental-modal-footer">
          <button type="button" className="rental-confirm-btn" onClick={handleConfirm}>
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}

export default RentalDateModal;