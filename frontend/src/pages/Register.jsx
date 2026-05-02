import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import bgImage from "../assets/login-bg.jpg";
import sideImage from "../assets/login-bg.jpg";
import { registerApi } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dob: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (!formData.dob) {
      newErrors.dob = "Vui lòng chọn ngày sinh";
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        newErrors.dob = "Bạn phải từ 18 tuổi trở lên";
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Bạn cần đồng ý với điều khoản dịch vụ";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const data = await registerApi({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: null,
        password: formData.password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/home");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";

      setErrors({
        general: message,
      });
    } finally {
      setLoading(false);
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
        }

        .register-page {
          min-height: 100vh;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .register-overlay {
          min-height: 100vh;
          background: rgba(10, 14, 30, 0.45);
        }

        .auth-card {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          min-height: 640px;
          background: rgba(255, 255, 255, 0.94);
          border-radius: 28px;
          overflow: hidden;
          backdrop-filter: blur(6px);
        }

        .auth-left {
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .auth-left-overlay {
          height: 100%;
          padding: 36px 32px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: linear-gradient(
            180deg,
            rgba(62, 66, 170, 0.84) 0%,
            rgba(102, 53, 194, 0.82) 100%
          );
        }

        .brand {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 28px;
        }

        .auth-left h1 {
          font-size: 2.1rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .auth-left p {
          font-size: 0.98rem;
          line-height: 1.7;
          max-width: 470px;
          margin: 0;
          color: rgba(255, 255, 255, 0.95);
        }

        .left-footer {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.88);
        }

        .auth-right {
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at top right, rgba(102, 53, 194, 0.08), transparent 35%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 250, 253, 0.94));
        }

        .auth-form-wrapper {
          width: 100%;
          max-width: 450px;
          padding: 26px 30px;
        }

        .auth-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: #1c2440;
          margin-bottom: 6px;
        }

        .auth-subtitle {
          color: #6b7280;
          margin-bottom: 16px;
          font-size: 0.95rem;
        }

        .custom-input {
          height: 44px;
          border-radius: 12px;
          border: 1px solid #d7def0;
          background-color: #f6f8ff;
          padding: 0 14px;
          font-size: 0.94rem;
        }

        .custom-input:focus {
          border-color: #6c63ff;
          box-shadow: 0 0 0 0.2rem rgba(108, 99, 255, 0.15);
          background-color: #ffffff;
        }

        .password-input-container {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          z-index: 3;
        }

        .password-field {
          padding-right: 46px;
        }

        .auth-btn {
          height: 46px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          color: white;
          font-weight: 700;
          transition: all 0.25s;
          width: 100%;
        }

        .auth-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(76, 61, 214, 0.28);
          color: white;
        }

        .register-text {
          margin-top: 18px;
          text-align: center;
          color: #6b7280;
          font-size: 0.94rem;
        }

        .register-text span {
          color: #5b4cf0;
          font-weight: 700;
          cursor: pointer;
        }

        .compact-label {
          font-size: 0.84rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        @media (max-width: 991.98px) {
          .auth-card {
            grid-template-columns: 1fr;
          }

          .auth-left {
            min-height: 240px;
          }

          .auth-left h1 {
            font-size: 1.9rem;
          }
        }

        @media (max-width: 575.98px) {
          .auth-form-wrapper {
            padding: 24px 18px;
          }

          .auth-left-overlay {
            padding: 24px 20px;
          }

          .auth-title {
            font-size: 1.65rem;
          }

          .brand {
            font-size: 1.55rem;
          }
        }
      `}</style>

      <div
        className="register-page"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="register-overlay">
          <div className="container">
            <div className="row justify-content-center align-items-center min-vh-100 py-4">
              <div className="col-12 col-xl-10">
                <div className="auth-card shadow-lg">
                  <div
                    className="auth-left"
                    style={{ backgroundImage: `url(${sideImage})` }}
                  >
                    <div className="auth-left-overlay">
                      <div>
                        <div className="brand">KongCars</div>
                        <h1>Tham gia cùng chúng tôi</h1>
                        <p>
                          Tạo tài khoản để bắt đầu hành trình của bạn cùng
                          KongCars, nhận ưu đãi hấp dẫn và trải nghiệm dịch vụ
                          thuê xe nhanh chóng, an toàn.
                        </p>
                      </div>

                      <div className="left-footer">
                        An toàn - Nhanh chóng - Tiết kiệm
                      </div>
                    </div>
                  </div>

                  <div className="auth-right">
                    <div className="auth-form-wrapper">
                      <h2 className="auth-title">Đăng ký tài khoản</h2>
                      <p className="auth-subtitle">
                        Khám phá hành trình mới cùng KongCars.
                      </p>

                      {errors.general && (
                        <div className="alert alert-danger py-2 mb-3" role="alert">
                          {errors.general}
                        </div>
                      )}

                      <form onSubmit={handleSubmit}>
                        <div className="mb-2">
                          <label className="form-label compact-label">
                            Họ và tên
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            className={`form-control custom-input ${
                              errors.fullName ? "is-invalid" : ""
                            }`}
                            placeholder="Nguyễn Văn A"
                            value={formData.fullName}
                            onChange={handleChange}
                          />
                          {errors.fullName && (
                            <div className="invalid-feedback">
                              {errors.fullName}
                            </div>
                          )}
                        </div>

                        <div className="mb-2">
                          <label className="form-label compact-label">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            className={`form-control custom-input ${
                              errors.email ? "is-invalid" : ""
                            }`}
                            placeholder="example@gmail.com"
                            value={formData.email}
                            onChange={handleChange}
                          />
                          {errors.email && (
                            <div className="invalid-feedback">
                              {errors.email}
                            </div>
                          )}
                        </div>

                        <div className="mb-2">
                          <label className="form-label compact-label">
                            Ngày sinh
                          </label>
                          <input
                            type="date"
                            name="dob"
                            className={`form-control custom-input ${
                              errors.dob ? "is-invalid" : ""
                            }`}
                            value={formData.dob}
                            onChange={handleChange}
                          />
                          {errors.dob && (
                            <div className="invalid-feedback">
                              {errors.dob}
                            </div>
                          )}
                        </div>

                        <div className="mb-2">
                          <label className="form-label compact-label">
                            Mật khẩu
                          </label>
                          <div className="password-input-container">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              className={`form-control custom-input password-field ${
                                errors.password ? "is-invalid" : ""
                              }`}
                              placeholder="Tối thiểu 6 ký tự"
                              value={formData.password}
                              onChange={handleChange}
                            />
                            <span
                              className="password-toggle"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </span>
                            {errors.password && (
                              <div className="invalid-feedback d-block">
                                {errors.password}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-2">
                          <label className="form-label compact-label">
                            Xác nhận mật khẩu
                          </label>
                          <div className="password-input-container">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              className={`form-control custom-input password-field ${
                                errors.confirmPassword ? "is-invalid" : ""
                              }`}
                              placeholder="Nhập lại mật khẩu"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                            />
                            <span
                              className="password-toggle"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </span>
                            {errors.confirmPassword && (
                              <div className="invalid-feedback d-block">
                                {errors.confirmPassword}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-3 mt-2">
                          <div className="form-check small">
                            <input
                              className={`form-check-input ${
                                errors.agreeTerms ? "is-invalid" : ""
                              }`}
                              type="checkbox"
                              id="agreeTerms"
                              name="agreeTerms"
                              checked={formData.agreeTerms}
                              onChange={handleChange}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="agreeTerms"
                            >
                              Tôi đồng ý với <span>Điều khoản & Chính sách</span>
                            </label>
                          </div>
                          {errors.agreeTerms && (
                            <div className="text-danger small mt-1">
                              {errors.agreeTerms}
                            </div>
                          )}
                        </div>

                        <div className="d-grid">
                          <button
                            type="submit"
                            className="btn auth-btn"
                            disabled={loading}
                          >
                            {loading ? "Đang xử lý..." : "Tạo tài khoản"}
                          </button>
                        </div>
                      </form>

                      <div className="register-text">
                        Đã có tài khoản?{" "}
                        <Link to="/login">
                          <span>Đăng nhập ngay</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;