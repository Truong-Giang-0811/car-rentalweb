import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyProfileApi,
  updateProfileApi,
  changePasswordApi,
} from "../services/authService";

// ── Tab IDs ──────────────────────────────────────────────
const TAB_INFO = "info";
const TAB_PASSWORD = "password";

export default function ProfilePage() {
  const navigate = useNavigate();

  // ── Auth guard ────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  // ── State ─────────────────────────────────────────────
  const [tab, setTab] = useState(TAB_INFO);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  // Show/hide password toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Fetch profile on mount ────────────────────────────
  useEffect(() => {
    getMyProfileApi()
      .then((data) => {
        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Handlers ──────────────────────────────────────────
  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
    setFormSuccess("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      setFormError("Họ và tên không được để trống.");
      return;
    }
    setSaving(true);
    setFormError("");
    setFormSuccess("");
    try {
      await updateProfileApi({
        fullName: form.fullName,
        email: form.email, // ✅ backend UpdateProfileDto có check email
        phoneNumber: form.phoneNumber,
      });
      setFormSuccess("Cập nhật thông tin thành công!");
      // Propagate name change to header
      window.dispatchEvent(new Event("auth-changed"));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePwChange = (e) => {
    setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPwError("");
    setPwSuccess("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (
      !pwForm.currentPassword ||
      !pwForm.newPassword ||
      !pwForm.confirmPassword
    ) {
      setPwError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Mật khẩu mới và xác nhận không khớp.");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    setPwSaving(true);
    setPwError("");
    setPwSuccess("");
    try {
      await changePasswordApi({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmPassword: pwForm.confirmPassword,
      });
      setPwSuccess("Đổi mật khẩu thành công!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{rawCss}</style>

      {/* ── Page header ── */}
      <div style={styles.pageHeader}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Quay lại
        </button>
        <h1 style={styles.pageTitle}>Tài khoản của tôi</h1>
      </div>

      <div style={styles.layout}>
        {/* ── Sidebar ── */}
        <aside style={styles.sidebar}>
          <div style={styles.avatarBlock}>
            <div style={styles.avatarCircle}>
              {form.fullName ? form.fullName.trim()[0].toUpperCase() : "U"}
            </div>
            <p style={styles.sidebarName}>{form.fullName || "Người dùng"}</p>
            <p style={styles.sidebarEmail}>{form.email}</p>
          </div>

          <nav style={styles.sideNav}>
            <button
              style={{
                ...styles.navItem,
                ...(tab === TAB_INFO ? styles.navItemActive : {}),
              }}
              onClick={() => setTab(TAB_INFO)}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Thông tin cá nhân
            </button>
            <button
              style={{
                ...styles.navItem,
                ...(tab === TAB_PASSWORD ? styles.navItemActive : {}),
              }}
              onClick={() => setTab(TAB_PASSWORD)}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Đổi mật khẩu
            </button>
          </nav>
        </aside>

        {/* ── Main panel ── */}
        <main style={styles.main}>
          {/* ── Tab: Thông tin cá nhân ── */}
          {tab === TAB_INFO && (
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Thông tin cá nhân</h2>
              <p style={styles.cardSub}>
                Cập nhật thông tin hồ sơ của bạn tại đây.
              </p>

              <form onSubmit={handleSaveProfile} style={styles.form} noValidate>
                <div style={styles.formRow}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      Họ và tên <span style={styles.req}>*</span>
                    </label>
                    <input
                      className="prof-input"
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleFormChange}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                      className="prof-input prof-input--disabled"
                      type="email"
                      name="email"
                      value={form.email}
                      readOnly
                      title="Email không thể thay đổi"
                    />
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Số điện thoại</label>
                  <input
                    className="prof-input"
                    type="tel"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleFormChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                {formError && <div style={styles.alertError}>{formError}</div>}
                {formSuccess && (
                  <div style={styles.alertSuccess}>{formSuccess}</div>
                )}

                <div style={styles.formActions}>
                  <button
                    type="submit"
                    style={styles.btnPrimary}
                    disabled={saving}
                    className="btn-primary-hover"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ── Tab: Đổi mật khẩu ── */}
          {tab === TAB_PASSWORD && (
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Đổi mật khẩu</h2>
              <p style={styles.cardSub}>
                Để bảo mật tài khoản, hãy đặt mật khẩu có ít nhất 6 ký tự.
              </p>

              <form
                onSubmit={handleChangePassword}
                style={styles.form}
                noValidate
              >
                {/* Old password */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Mật khẩu hiện tại <span style={styles.req}>*</span>
                  </label>
                  <div style={styles.pwWrap}>
                    <input
                      className="prof-input"
                      style={{ paddingRight: 44 }}
                      type={showOld ? "text" : "password"}
                      name="currentPassword"
                      value={pwForm.currentPassword}
                      onChange={handlePwChange}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() => setShowOld((v) => !v)}
                    >
                      {showOld ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Mật khẩu mới <span style={styles.req}>*</span>
                  </label>
                  <div style={styles.pwWrap}>
                    <input
                      className="prof-input"
                      style={{ paddingRight: 44 }}
                      type={showNew ? "text" : "password"}
                      name="newPassword"
                      value={pwForm.newPassword}
                      onChange={handlePwChange}
                      placeholder="Nhập mật khẩu mới (≥ 6 ký tự)"
                    />
                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() => setShowNew((v) => !v)}
                    >
                      {showNew ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {pwForm.newPassword && (
                    <StrengthBar password={pwForm.newPassword} />
                  )}
                </div>

                {/* Confirm password */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Xác nhận mật khẩu mới <span style={styles.req}>*</span>
                  </label>
                  <div style={styles.pwWrap}>
                    <input
                      className="prof-input"
                      style={{ paddingRight: 44 }}
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={pwForm.confirmPassword}
                      onChange={handlePwChange}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() => setShowConfirm((v) => !v)}
                    >
                      {showConfirm ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {pwError && <div style={styles.alertError}>{pwError}</div>}
                {pwSuccess && (
                  <div style={styles.alertSuccess}>{pwSuccess}</div>
                )}

                <div style={styles.formActions}>
                  <button
                    type="submit"
                    style={styles.btnPrimary}
                    disabled={pwSaving}
                    className="btn-primary-hover"
                  >
                    {pwSaving ? "Đang đổi..." : "Đổi mật khẩu"}
                  </button>
                </div>
              </form>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function StrengthBar({ password }) {
  const score = (() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  })();

  const labels = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: 4,
              flex: 1,
              borderRadius: 99,
              background: i <= score ? colors[score] : "#e5e7eb",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <p
        style={{
          fontSize: "0.75rem",
          color: colors[score],
          marginTop: 4,
          fontWeight: 600,
        }}
      >
        {labels[score]}
      </p>
    </div>
  );
}

function Eye() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ── Styles ────────────────────────────────────────────────

const GREEN = "#16a34a";
const GREEN_LIGHT = "#dcfce7";
const BORDER = "#e5e7eb";
const RADIUS = 14;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "32px 20px 60px",
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    maxWidth: 1000,
    margin: "0 auto 28px",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    fontWeight: 600,
    fontSize: "0.9rem",
    padding: "6px 10px",
    borderRadius: 8,
    transition: "color 0.2s",
  },
  pageTitle: {
    fontSize: "1.6rem",
    fontWeight: 800,
    color: "#111827",
    margin: 0,
  },
  layout: {
    display: "flex",
    gap: 24,
    maxWidth: 1000,
    margin: "0 auto",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  sidebar: {
    width: 240,
    flexShrink: 0,
    background: "#fff",
    borderRadius: RADIUS,
    border: `1px solid ${BORDER}`,
    overflow: "hidden",
  },
  avatarBlock: {
    padding: "28px 20px 20px",
    borderBottom: `1px solid ${BORDER}`,
    textAlign: "center",
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${GREEN}, #15803d)`,
    color: "#fff",
    fontSize: "1.9rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
    boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
  },
  sidebarName: {
    margin: 0,
    fontWeight: 700,
    color: "#111827",
    fontSize: "0.95rem",
  },
  sidebarEmail: {
    margin: "4px 0 0",
    fontSize: "0.78rem",
    color: "#9ca3af",
  },
  sideNav: {
    padding: "10px 0",
  },
  navItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.88rem",
    color: "#374151",
    transition: "all 0.15s",
    textAlign: "left",
  },
  navItemActive: {
    background: GREEN_LIGHT,
    color: GREEN,
    borderLeftWidth: 3,
    borderLeftStyle: "solid",
    borderLeftColor: GREEN,
    paddingLeft: 17,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    background: "#fff",
    borderRadius: RADIUS,
    border: `1px solid ${BORDER}`,
    padding: "32px 36px",
  },
  cardTitle: {
    margin: "0 0 4px",
    fontSize: "1.2rem",
    fontWeight: 800,
    color: "#111827",
  },
  cardSub: {
    margin: "0 0 28px",
    color: "#6b7280",
    fontSize: "0.87rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  formRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
    minWidth: 200,
  },
  label: {
    fontWeight: 600,
    fontSize: "0.85rem",
    color: "#374151",
  },
  req: {
    color: "#ef4444",
    marginLeft: 2,
  },
  pwWrap: {
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    padding: 0,
  },
  alertError: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: "0.87rem",
    fontWeight: 600,
  },
  alertSuccess: {
    background: "#f0fdf4",
    color: GREEN,
    border: `1px solid ${GREEN_LIGHT}`,
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: "0.87rem",
    fontWeight: 600,
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: 4,
  },
  btnPrimary: {
    background: GREEN,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 28px",
    fontWeight: 700,
    fontSize: "0.92rem",
    cursor: "pointer",
    transition: "background 0.2s, opacity 0.2s",
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e5e7eb",
    borderTop: `4px solid ${GREEN}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#6b7280",
    fontWeight: 600,
  },
};

const rawCss = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800&display=swap');

  @keyframes spin { to { transform: rotate(360deg); } }

  .prof-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-size: 0.92rem;
    font-family: inherit;
    color: #111827;
    background: #fff;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
    outline: none;
  }

  .prof-input:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22,163,74,0.12);
  }

  .prof-input--disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .btn-primary-hover:hover:not(:disabled) {
    background: #15803d !important;
  }

  .btn-primary-hover:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .prof-card { padding: 22px 18px !important; }
  }
`;
