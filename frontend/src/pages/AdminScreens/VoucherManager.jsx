import React, { useEffect, useMemo, useState } from "react";
import {
  createVoucher,
  deleteVoucher,
  getAdminVouchers,
  updateVoucher,
} from "../../services/voucherService";

const initialForm = {
  title: "",
  codePrefix: "",
  discountType: 0,
  discountValue: "",
  maxDiscountValue: "",
  minOrderValue: "",
  totalQuantity: "",
  redeemPoints: "",
  isRedeemable: false,
  isPublicPromotion: false,
  isActive: true,
  startAt: "",
  endAt: "",
};

function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const data = await getAdminVouchers();
      setVouchers(Array.isArray(data) ? data : []);
    } catch (error) {
      alert(error.message);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingVoucher(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (voucher) => {
    setEditingVoucher(voucher);
    setForm({
      title: voucher.title || "",
      codePrefix: voucher.codePrefix || "",
      discountType:
      voucher.discountType === "Percentage" || voucher.discountType === 1 ? 1 : 0,
      discountValue: voucher.discountValue ?? "",
      maxDiscountValue: voucher.maxDiscountValue ?? "",
      minOrderValue: voucher.minOrderValue ?? "",
      totalQuantity: voucher.totalQuantity ?? "",
      redeemPoints: voucher.redeemPoints ?? "",
      isRedeemable: !!voucher.isRedeemable,
      isPublicPromotion: !!voucher.isPublicPromotion,
      isActive: !!voucher.isActive,
      startAt: toDateTimeLocal(voucher.startAt),
      endAt: toDateTimeLocal(voucher.endAt),
    });
    setShowModal(true);
  };

  const toDateTimeLocal = (value) => {
    if (!value) return "";
    const date = new Date(value);
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("vi-VN");
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return `${Number(value).toLocaleString("vi-VN")}đ`;
  };

  const getVoucherStatus = (voucher) => {
    const now = new Date();
    const start = new Date(voucher.startAt);
    const end = new Date(voucher.endAt);

    if (!voucher.isActive) {
      return { text: "Tắt", className: "Inactive" };
    }

    if (now < start) {
      return { text: "Sắp chạy", className: "Upcoming" };
    }

    if (now > end) {
      return { text: "Hết hạn", className: "Expired" };
    }

    return { text: "Đang chạy", className: "Active" };
  };

  const buildVoucherTitle = (voucher) => {
    if (voucher.discountType === 1) {
      return `Giảm ${voucher.discountValue}%`;
    }
    return `Giảm ${Number(voucher.discountValue || 0).toLocaleString("vi-VN")}đ`;
  };

  const validateForm = () => {
    if (!form.title.trim()) return "Vui lòng nhập tên voucher.";
    if (form.discountValue === "" || Number(form.discountValue) <= 0) {
      return "Giá trị giảm phải lớn hơn 0.";
    }
    if (!form.startAt || !form.endAt) {
      return "Vui lòng chọn thời gian bắt đầu và kết thúc.";
    }
    if (new Date(form.endAt) <= new Date(form.startAt)) {
      return "Thời gian kết thúc phải sau thời gian bắt đầu.";
    }
    return "";
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    codePrefix: form.codePrefix.trim() || null,
    discountType: Number(form.discountType) === 1 ? "Percentage" : "FixedAmount",
    discountValue: Number(form.discountValue || 0),
    maxDiscountValue:
      form.maxDiscountValue === "" ? null : Number(form.maxDiscountValue),
    minOrderValue: form.minOrderValue === "" ? null : Number(form.minOrderValue),
    totalQuantity: Number(form.totalQuantity || 0),
    redeemPoints: Number(form.redeemPoints || 0),
    isRedeemable: form.isRedeemable,
    isPublicPromotion: form.isPublicPromotion,
    isActive: form.isActive,
    startAt: form.startAt,
    endAt: form.endAt,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const message = validateForm();
    if (message) {
      alert(message);
      return;
    }

    try {
      setSubmitting(true);
      const payload = buildPayload();

      if (editingVoucher) {
        await updateVoucher(editingVoucher.id, payload);
        alert("Cập nhật voucher thành công.");
      } else {
        await createVoucher(payload);
        alert("Tạo voucher thành công.");
      }

      setShowModal(false);
      resetForm();
      fetchVouchers();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (voucher) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa voucher "${voucher.title}"?`);
    if (!ok) return;

    try {
      await deleteVoucher(voucher.id);
      alert("Xóa voucher thành công.");
      fetchVouchers();
    } catch (error) {
      alert(error.message);
    }
  };

  const voucherCards = useMemo(() => {
    return vouchers.map((voucher) => {
      const status = getVoucherStatus(voucher);
      const usedPercent =
        Number(voucher.totalQuantity || 0) > 0
          ? Math.min(
              100,
              Math.round((Number(voucher.usedQuantity || 0) / Number(voucher.totalQuantity)) * 100)
            )
          : 0;

      return {
        ...voucher,
        status,
        usedPercent,
      };
    });
  }, [vouchers]);

  return (
    <div className="voucher-container">
      <style>{`
        .voucher-container {
          font-family: Inter, sans-serif;
          padding: 20px;
        }

        .header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          gap: 16px;
        }

        .header-flex h1 {
          font-size: 1.8rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
        }

        .btn-add-voucher {
          background: #16a34a;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-add-voucher:hover {
          background: #15803d;
          transform: translateY(-2px);
        }

        .voucher-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .voucher-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          display: flex;
          overflow: hidden;
          position: relative;
          transition: 0.3s;
        }

        .voucher-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 20px rgba(0,0,0,0.05);
        }

        .voucher-left {
          width: 110px;
          background: #f1f5f9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px;
          border-right: 2px dashed #e2e8f0;
        }

        .voucher-card.Active .voucher-left {
          background: #dcfce7;
          color: #16a34a;
        }

        .voucher-card.Expired .voucher-left {
          background: #fee2e2;
          color: #dc2626;
        }

        .voucher-card.Upcoming .voucher-left {
          background: #fef9c3;
          color: #ca8a04;
        }

        .voucher-card.Inactive .voucher-left {
          background: #f1f5f9;
          color: #64748b;
        }

        .discount-val {
          font-size: 1.5rem;
          font-weight: 900;
          text-align: center;
        }

        .discount-unit {
          font-size: 0.8rem;
          font-weight: 700;
        }

        .voucher-right {
          flex: 1;
          padding: 16px;
          position: relative;
        }

        .voucher-code {
          display: inline-block;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          padding: 4px 12px;
          border-radius: 6px;
          font-family: monospace;
          font-weight: 700;
          color: #334155;
          margin-bottom: 10px;
        }

        .voucher-title {
          font-weight: 800;
          font-size: 1rem;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .voucher-desc {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .voucher-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .voucher-tag {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 999px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
        }

        .usage-container {
          margin-top: 10px;
        }

        .usage-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .usage-bar {
          width: 100%;
          height: 6px;
          background: #f1f5f9;
          border-radius: 3px;
          overflow: hidden;
        }

        .usage-fill {
          height: 100%;
          background: #16a34a;
          border-radius: 3px;
        }

        .status-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .Active .status-badge {
          background: #dcfce7;
          color: #16a34a;
        }

        .Expired .status-badge {
          background: #fee2e2;
          color: #dc2626;
        }

        .Upcoming .status-badge {
          background: #fef9c3;
          color: #ca8a04;
        }

        .Inactive .status-badge {
          background: #e2e8f0;
          color: #475569;
        }

        .cutout {
          position: absolute;
          width: 20px;
          height: 20px;
          background: #f1f5f9;
          border-radius: 50%;
          left: 100px;
          z-index: 1;
        }

        .cutout-top {
          top: -10px;
        }

        .cutout-bottom {
          bottom: -10px;
        }

        .voucher-actions {
          margin-top: 15px;
          display: flex;
          gap: 10px;
        }

        .action-btn {
          border: none;
          background: none;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0;
        }

        .edit-btn {
          color: #2563eb;
        }

        .delete-btn {
          color: #dc2626;
        }

        .loading-box,
        .empty-box {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 40px 20px;
          text-align: center;
          color: #64748b;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .modal-box {
          width: min(760px, 100%);
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.18);
          overflow: hidden;
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 800;
        }

        .close-btn {
          border: none;
          background: none;
          font-size: 1.4rem;
          cursor: pointer;
        }

        .modal-body {
          padding: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group.full {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: #334155;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          height: 46px;
          border-radius: 12px;
          border: 1px solid #dbe2ea;
          padding: 0 14px;
          font-size: 0.95rem;
          outline: none;
        }

        .form-check-row {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .form-check {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #334155;
        }

        .form-check input {
          width: auto;
          height: auto;
        }

        .modal-footer {
          padding: 18px 24px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-secondary,
        .btn-primary {
          border: none;
          border-radius: 12px;
          padding: 12px 18px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #0f172a;
        }

        .btn-primary {
          background: #16a34a;
          color: white;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .voucher-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="header-flex">
        <h1>Quản lý Voucher</h1>
        <button className="btn-add-voucher" onClick={openCreateModal}>
          <span>➕</span> Tạo mã mới
        </button>
      </div>

      {loading ? (
        <div className="loading-box">Đang tải danh sách voucher...</div>
      ) : voucherCards.length === 0 ? (
        <div className="empty-box">Chưa có voucher nào trong hệ thống.</div>
      ) : (
        <div className="voucher-grid">
          {voucherCards.map((v) => (
            <div key={v.id} className={`voucher-card ${v.status.className}`}>
              <div className="cutout cutout-top"></div>
              <div className="cutout cutout-bottom"></div>

              <div className="voucher-left">
                <span className="discount-val">
                  {v.discountType === 1
                    ? Number(v.discountValue)
                    : Number(v.discountValue).toLocaleString("vi-VN")}
                </span>
                <span className="discount-unit">
                  {v.discountType === 1 ? "%" : "VNĐ"}
                </span>
              </div>

              <div className="voucher-right">
                <span className="status-badge">{v.status.text}</span>

                <div className="voucher-code">{v.codePrefix || "NO-CODE"}</div>

                <div className="voucher-title">{buildVoucherTitle(v)}</div>

                <div className="voucher-desc">
                  Tên: {v.title}
                  <br />
                  Đơn tối thiểu: {formatMoney(v.minOrderValue)}
                  <br />
                  Hạn dùng: {formatDate(v.startAt)} đến {formatDate(v.endAt)}
                </div>

                <div className="voucher-tags">
                  {v.isPublicPromotion && (
                    <span className="voucher-tag">Khuyến mãi công khai</span>
                  )}
                  {v.isRedeemable && (
                    <span className="voucher-tag">
                      Đổi điểm: {v.redeemPoints} điểm
                    </span>
                  )}
                  {v.discountType === 1 && v.maxDiscountValue && (
                    <span className="voucher-tag">
                      Tối đa {formatMoney(v.maxDiscountValue)}
                    </span>
                  )}
                </div>

                <div className="usage-container">
                  <div className="usage-label">
                    <span>
                      Đã dùng: {v.usedQuantity}/{v.totalQuantity}
                    </span>
                    <span>{v.usedPercent}%</span>
                  </div>
                  <div className="usage-bar">
                    <div
                      className="usage-fill"
                      style={{
                        width: `${v.usedPercent}%`,
                        backgroundColor:
                          v.status.className === "Expired" ? "#cbd5e1" : "#16a34a",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="voucher-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => openEditModal(v)}
                  >
                    Sửa
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(v)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingVoucher ? "Cập nhật voucher" : "Tạo voucher mới"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full">
                    <label>Tên voucher</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Nhập tên voucher"
                    />
                  </div>

                  <div className="form-group">
                    <label>Mã hiển thị</label>
                    <input
                      type="text"
                      value={form.codePrefix}
                      onChange={(e) => handleChange("codePrefix", e.target.value)}
                      placeholder="Ví dụ: SALE50"
                    />
                  </div>

                  <div className="form-group">
                    <label>Loại giảm giá</label>
                    <select
                      value={form.discountType}
                      onChange={(e) =>
                        handleChange("discountType", Number(e.target.value))
                      }
                    >
                      <option value={0}>Giảm tiền</option>
                      <option value={1}>Giảm phần trăm</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Giá trị giảm</label>
                    <input
                      type="number"
                      value={form.discountValue}
                      onChange={(e) =>
                        handleChange("discountValue", e.target.value)
                      }
                      placeholder="Nhập giá trị giảm"
                    />
                  </div>

                  <div className="form-group">
                    <label>Giảm tối đa</label>
                    <input
                      type="number"
                      value={form.maxDiscountValue}
                      onChange={(e) =>
                        handleChange("maxDiscountValue", e.target.value)
                      }
                      placeholder="Chỉ dùng cho giảm %"
                    />
                  </div>

                  <div className="form-group">
                    <label>Đơn tối thiểu</label>
                    <input
                      type="number"
                      value={form.minOrderValue}
                      onChange={(e) =>
                        handleChange("minOrderValue", e.target.value)
                      }
                      placeholder="Nhập giá trị đơn tối thiểu"
                    />
                  </div>

                  <div className="form-group">
                    <label>Số lượng</label>
                    <input
                      type="number"
                      value={form.totalQuantity}
                      onChange={(e) =>
                        handleChange("totalQuantity", e.target.value)
                      }
                      placeholder="Nhập tổng số lượng"
                    />
                  </div>

                  <div className="form-group">
                    <label>Điểm đổi</label>
                    <input
                      type="number"
                      value={form.redeemPoints}
                      onChange={(e) =>
                        handleChange("redeemPoints", e.target.value)
                      }
                      placeholder="Nhập số điểm cần đổi"
                    />
                  </div>

                  <div className="form-group">
                    <label>Bắt đầu</label>
                    <input
                      type="datetime-local"
                      value={form.startAt}
                      onChange={(e) => handleChange("startAt", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Kết thúc</label>
                    <input
                      type="datetime-local"
                      value={form.endAt}
                      onChange={(e) => handleChange("endAt", e.target.value)}
                    />
                  </div>

                  <div className="form-group full">
                    <label>Tùy chọn</label>
                    <div className="form-check-row">
                      <label className="form-check">
                        <input
                          type="checkbox"
                          checked={form.isRedeemable}
                          onChange={(e) =>
                            handleChange("isRedeemable", e.target.checked)
                          }
                        />
                        Có thể đổi bằng điểm
                      </label>

                      <label className="form-check">
                        <input
                          type="checkbox"
                          checked={form.isPublicPromotion}
                          onChange={(e) =>
                            handleChange("isPublicPromotion", e.target.checked)
                          }
                        />
                        Hiện ở chương trình khuyến mãi
                      </label>

                      <label className="form-check">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(e) =>
                            handleChange("isActive", e.target.checked)
                          }
                        />
                        Đang kích hoạt
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting
                    ? "Đang xử lý..."
                    : editingVoucher
                    ? "Lưu thay đổi"
                    : "Tạo voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoucherManagement;