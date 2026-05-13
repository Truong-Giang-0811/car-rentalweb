import avatarImage from "../assets/avatar.png";
import logoImage from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import NotificationBell from "./NotificationBell";
import { getMyProfileApi } from "../services/authService";

function CustomerHeader() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile when logged in
  useEffect(() => {
    if (isLoggedIn) {
      getMyProfileApi()
        .then((data) => setUserProfile(data))
        .catch(() => setUserProfile(null));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const syncAuth = () => {
      const loggedIn = !!localStorage.getItem("token");
      setIsLoggedIn(loggedIn);
      if (!loggedIn) setUserProfile(null);
    };

    window.addEventListener("auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".avatar-box-wrapper")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const requireLogin = (callback) => {
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để sử dụng chức năng này.");
      navigate("/login");
      return;
    }
    callback?.();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-changed"));
    setShowDropdown(false);
    navigate("/home");
  };

  const displayName = userProfile?.fullName || "Tài khoản";

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .page-container {
          width: min(1400px, calc(100% - 120px));
          margin: 0 auto;
        }

        .top-navbar {
          height: 72px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .navbar-inner {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .brand-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .brand-logo {
          height: 48px;
          object-fit: contain;
        }

        .brand-text {
          font-size: 1.45rem;
          font-weight: 800;
          color: #111827;
          letter-spacing: 0.2px;
          text-decoration: none;
          line-height: 1;
          white-space: nowrap;
        }

        .brand-k {
          color: #16a34a;
          font-weight: 900;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          justify-content: center;
        }

        .nav-link-custom {
          font-weight: 600;
          font-size: 0.92rem;
          color: #374151;
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 8px;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }

        .nav-link-custom:hover {
          color: #16a34a;
          background: #f0fdf4;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          flex-shrink: 0;
        }

        .icon-btn:hover { background: #f3f4f6; }

        .icon-btn svg {
          color: #4b5563;
          transition: color 0.15s;
        }

        .icon-btn:hover svg { color: #16a34a; }

        .heart-icon svg {
          color: #ec4899;
          fill: transparent;
        }

        .heart-icon:hover svg {
          color: #db2777;
          fill: #fce7f3;
        }

        .icon-group {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 8px;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          margin: 0 4px;
        }

        .auth-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .register-link,
        .login-link {
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 8px 16px;
          border-radius: 10px;
          transition: 0.15s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }

        .register-link {
          color: #374151;
          background: transparent;
        }

        .register-link:hover { color: #16a34a; }

        .login-link {
          color: #fff;
          border: none;
          background: #16a34a;
        }

        .login-link:hover { background: #15803d; }

        .avatar-box-wrapper { position: relative; }

        .avatar-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px 4px 4px;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          cursor: pointer;
          user-select: none;
          transition: background 0.15s;
          background: #fff;
        }

        .avatar-box:hover { background: #f9fafb; }

        .avatar-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .user-name-text {
          font-size: 0.88rem;
          font-weight: 700;
          color: #111827;
          max-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-arrow {
          font-size: 0.7rem;
          color: #9ca3af;
        }

        .avatar-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          z-index: 999;
          min-width: 200px;
          animation: dropIn 0.16s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header {
          padding: 14px 16px 10px;
          border-bottom: 1px solid #f3f4f6;
        }

        .dropdown-name {
          font-weight: 700;
          font-size: 0.92rem;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-subtitle {
          font-size: 0.74rem;
          color: #9ca3af;
          margin-top: 2px;
        }

        .dropdown-item {
          width: 100%;
          padding: 10px 16px;
          border: none;
          background: #fff;
          text-align: left;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.87rem;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 9px;
          transition: background 0.12s;
          text-decoration: none;
        }

        .dropdown-item:hover {
          background: #f9fafb;
          color: #16a34a;
        }

        .dropdown-item.danger:hover {
          background: #fff1f2;
          color: #ef4444;
        }

        .dropdown-divider {
          height: 1px;
          background: #f3f4f6;
          margin: 4px 0;
        }

        .hamburger-btn {
          display: none;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #fff;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .hamburger-btn svg { color: #374151; }

        .mobile-menu {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 2000;
        }

        .mobile-menu.open { display: block; }

        .mobile-menu-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.35);
        }

        .mobile-menu-drawer {
          position: absolute;
          top: 0;
          right: 0;
          width: min(300px, 85vw);
          height: 100%;
          background: #fff;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          animation: slideIn 0.22s ease;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }

        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid #f3f4f6;
        }

        .mobile-menu-close {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .mobile-nav-link {
          display: block;
          padding: 13px 20px;
          font-weight: 600;
          font-size: 0.98rem;
          color: #374151;
          text-decoration: none;
          border-bottom: 1px solid #f9fafb;
          transition: background 0.12s, color 0.12s;
        }

        .mobile-nav-link:hover {
          background: #f0fdf4;
          color: #16a34a;
        }

        .mobile-auth-section {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid #e5e7eb;
          margin-top: auto;
        }

        .mobile-btn-register,
        .mobile-btn-login {
          display: block;
          text-align: center;
          padding: 12px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          transition: 0.15s;
        }

        .mobile-btn-register {
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .mobile-btn-register:hover { background: #f9fafb; }

        .mobile-btn-login {
          color: #fff;
          background: #16a34a;
        }

        .mobile-btn-login:hover { background: #15803d; }

        .mobile-user-info {
          padding: 16px 20px 12px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
        }

        @media (max-width: 1199.98px) {
          .page-container {
            width: calc(100% - 40px);
          }

          .nav-links { display: none; }

          .hamburger-btn { display: inline-flex; }

          .icon-group {
            border-right: none;
            margin-right: 0;
            padding-right: 4px;
          }
        }

        @media (max-width: 767.98px) {
          .page-container {
            width: calc(100% - 24px);
          }

          .top-navbar { height: 60px; }

          .navbar-inner { height: 60px; }

          .brand-logo { height: 38px; }

          .brand-text { font-size: 1.2rem; }

          .user-name-text { display: none; }

          .dropdown-arrow { display: none; }

          .icon-group {
            padding: 0 4px;
            gap: 2px;
          }
        }
      `}</style>

      <header className="top-navbar">
        <div className="page-container">
          <div className="navbar-inner">
            <Link to="/home" className="brand-wrap">
              <img src={logoImage} alt="logo" className="brand-logo" />
              <span className="brand-text">
                <span className="brand-k">K</span>ongcars
              </span>
            </Link>

            <nav className="nav-links">
              <a href="/home" className="nav-link-custom">
                Về Kongcars
              </a>
              <a href="/community" className="nav-link-custom">
                Tin tức
              </a>
              {isLoggedIn && (
                <>
                  <Link to="/my-bookings" className="nav-link-custom">
                    Chuyến của tôi
                  </Link>
                  <a href="/rewards" className="nav-link-custom">
                    Quà tặng
                  </a>
                </>
              )}
            </nav>

            <div className="header-right">
              {!isLoggedIn ? (
                <div className="auth-links">
                  <Link to="/register" className="register-link">
                    Đăng ký
                  </Link>
                  <Link to="/login" className="login-link">
                    Đăng nhập
                  </Link>
                </div>
              ) : (
                <>
                  <div className="icon-group">
                    <NotificationBell />
                    <button
                      className="icon-btn heart-icon"
                      title="Yêu thích"
                      onClick={() => requireLogin(() => navigate("/favorites"))}
                      type="button"
                    >
                      <Heart size={18} />
                    </button>
                    <button
                      className="icon-btn"
                      title="Tin nhắn"
                      onClick={() => requireLogin()}
                      type="button"
                    >
                      <MessageCircle size={18} />
                    </button>
                  </div>

                  <div className="avatar-box-wrapper">
                    <div
                      className="avatar-box"
                      onClick={() => setShowDropdown((prev) => !prev)}
                    >
                      <img
                        src={avatarImage}
                        alt="avatar"
                        className="avatar-img"
                      />
                      <span className="user-name-text">{displayName}</span>
                      <span className="dropdown-arrow">▾</span>
                    </div>

                    {showDropdown && (
                      <div className="avatar-dropdown">
                        <div className="dropdown-header">
                          <div className="dropdown-name">{displayName}</div>
                          <div className="dropdown-subtitle">
                            {userProfile?.email || ""}
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          className="dropdown-item"
                          onClick={() => setShowDropdown(false)}
                        >
                          <svg
                            width="16"
                            height="16"
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
                        </Link>
                        <div className="dropdown-divider" />
                        <button
                          className="dropdown-item danger"
                          onClick={handleLogout}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <button
                className="hamburger-btn"
                onClick={() => setShowMobileMenu(true)}
                type="button"
                aria-label="Mở menu"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${showMobileMenu ? "open" : ""}`}>
        <div
          className="mobile-menu-overlay"
          onClick={() => setShowMobileMenu(false)}
        />
        <div className="mobile-menu-drawer">
          <div className="mobile-menu-header">
            <span className="brand-text">
              <span className="brand-k">K</span>ongcars
            </span>
            <button
              className="mobile-menu-close"
              onClick={() => setShowMobileMenu(false)}
              aria-label="Đóng"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {isLoggedIn && (
            <div className="mobile-user-info">
              <img
                src={avatarImage}
                alt="avatar"
                className="mobile-user-avatar"
              />
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "#111827",
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#9ca3af",
                    marginTop: "2px",
                  }}
                >
                  {userProfile?.email || ""}
                </div>
              </div>
            </div>
          )}

          <a
            href="/home"
            className="mobile-nav-link"
            onClick={() => setShowMobileMenu(false)}
          >
            Về Kongcars
          </a>
          <a
            href="/community"
            className="mobile-nav-link"
            onClick={() => setShowMobileMenu(false)}
          >
            Tin tức
          </a>

          {isLoggedIn && (
            <>
              <Link
                to="/my-bookings"
                className="mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                Chuyến của tôi
              </Link>
              <a
                href="/rewards"
                className="mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                Quà tặng
              </a>
              <Link
                to="/favorites"
                className="mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                Yêu thích
              </Link>
              <Link
                to="/profile"
                className="mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                Thông tin cá nhân
              </Link>
              <div className="mobile-auth-section">
                <button
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#fee2e2",
                    color: "#dc2626",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            </>
          )}

          {!isLoggedIn && (
            <div className="mobile-auth-section">
              <Link
                to="/register"
                className="mobile-btn-register"
                onClick={() => setShowMobileMenu(false)}
              >
                Đăng ký
              </Link>
              <Link
                to="/login"
                className="mobile-btn-login"
                onClick={() => setShowMobileMenu(false)}
              >
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CustomerHeader;
