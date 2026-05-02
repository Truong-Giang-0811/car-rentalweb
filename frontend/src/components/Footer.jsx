function Footer() {
  return (
    <>
      <style>{`
        .page-container {
          width: min(1400px, calc(100% - 120px));
          margin: 0 auto;
        }

        .site-footer {
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          margin-top: 80px;
        }

        .footer-top {
          padding: 56px 0 32px;
        }

        .footer-logo {
          font-size: 3rem;
          font-weight: 900;
          color: #111827;
          margin-bottom: 26px;
        }

        .footer-logo .highlight {
          color: #4ade80;
        }

        .footer-contact-item {
          margin-bottom: 26px;
        }

        .footer-contact-item strong {
          display: block;
          font-size: 1.6rem;
          color: #111827;
          margin-bottom: 4px;
        }

        .footer-contact-item span {
          color: #6b7280;
          font-size: 1.05rem;
        }

        .footer-socials {
          display: flex;
          gap: 14px;
          margin-top: 10px;
        }

        .footer-social-btn {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: 1px solid #d1d5db;
          background: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .footer-social-btn:hover {
          background: #f9fafb;
        }

        .footer-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 24px;
        }

        .footer-link {
          display: block;
          text-decoration: none;
          color: #6b7280;
          font-size: 1.12rem;
          margin-bottom: 18px;
          line-height: 1.5;
          transition: 0.2s ease;
        }

        .footer-link:hover {
          color: #16a34a;
        }

        .footer-divider {
          border-top: 1px solid #e5e7eb;
        }

        .footer-middle,
        .footer-bottom {
          padding: 24px 0;
        }

        .footer-text {
          color: #6b7280;
          font-size: 1.05rem;
          line-height: 1.7;
        }

        .footer-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 240px;
          min-height: 70px;
          padding: 10px 18px;
          border-radius: 14px;
          background: #ef4444;
          color: #fff;
          font-weight: 800;
          font-size: 1.1rem;
        }

        .footer-payment-title {
          color: #6b7280;
          font-size: 1.15rem;
          margin-bottom: 18px;
        }

        .footer-payments {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
        }

        .payment-item {
          min-width: 72px;
          height: 52px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 14px;
          font-size: 0.95rem;
          font-weight: 700;
          color: #374151;
        }

        @media (max-width: 991.98px) {
          .page-container {
            width: calc(100% - 28px);
          }

          .footer-top {
            padding: 44px 0 20px;
          }

          .footer-logo {
            font-size: 2.4rem;
          }

          .footer-title {
            margin-top: 10px;
          }
        }
      `}</style>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="page-container">
            <div className="row g-4">
              <div className="col-12 col-lg-4">
                <div className="footer-logo">
                  <span className="highlight">K</span>ONGCARS
                </div>

                <div className="footer-contact-item">
                  <strong>1900 9217</strong>
                  <span>Tổng đài hỗ trợ: 7AM - 10PM</span>
                </div>

                <div className="footer-contact-item">
                  <strong>nguyenvancong@kongcars.vn</strong>
                  <span>Gửi mail cho Kongcars</span>
                </div>

                <div className="footer-socials">
                  <button className="footer-social-btn">f</button>
                  <button className="footer-social-btn">♪</button>
                  <button className="footer-social-btn">Z</button>
                </div>
              </div>

              <div className="col-6 col-lg-2">
                <h4 className="footer-title">Chính Sách</h4>
                <a href="#" className="footer-link">Chính sách & quy định</a>
                <a href="#" className="footer-link">Quy chế hoạt động</a>
                <a href="#" className="footer-link">Chính sách bảo mật</a>
                <a href="#" className="footer-link">Giải quyết khiếu nại</a>
              </div>

              <div className="col-6 col-lg-2">
                <h4 className="footer-title">Tìm Hiểu Thêm</h4>
                <a href="#" className="footer-link">Hướng dẫn chung</a>
                <a href="#" className="footer-link">Hướng dẫn đặt xe</a>
                <a href="#" className="footer-link">Hướng dẫn thanh toán</a>
                <a href="#" className="footer-link">Hỏi và trả lời</a>
              </div>

              <div className="col-6 col-lg-2">
                <h4 className="footer-title">&nbsp;</h4>
                <a href="#" className="footer-link">Về Kongcars</a>
                <a href="#" className="footer-link">Kongcars Blog</a>
                <a href="#" className="footer-link">Tuyển dụng</a>
              </div>

              <div className="col-6 col-lg-2">
                <h4 className="footer-title">Đối Tác</h4>
                <a href="#" className="footer-link">Đăng ký GPS MITRACK 4G</a>
                <a href="#" className="footer-link">Đăng ký cho thuê xe dài hạn</a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-middle">
          <div className="page-container">
            <div className="row g-4">
              <div className="col-12 col-lg-4">
                <div className="footer-text">© Công ty Cổ phần Kongcars Asia</div>
              </div>
              <div className="col-12 col-lg-2">
                <div className="footer-text">Số GCNĐKKD: 0317307544</div>
              </div>
              <div className="col-12 col-lg-2">
                <div className="footer-text">Ngày cấp: 24-05-22</div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="footer-text">
                  Nơi cấp: Sở Kế hoạch và Đầu tư TPHN
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div className="page-container">
            <div className="row g-4 align-items-start">
              <div className="col-12 col-lg-4">
                <div className="footer-text mb-4">
                  Địa chỉ: Số 49, Ngõ 82, Trần Cung, Nghĩa Tân, Cầu Giấy, Thành phố Hà Nội,
                  Việt Nam.
                </div>

                <div className="footer-badge">ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG</div>
              </div>

              <div className="col-12 col-lg-2">
                <div className="footer-text">Tên TK: CT CP KONGCARS ASIA</div>
              </div>

              <div className="col-12 col-lg-2">
                <div className="footer-text">Số TK: 102-989-1989</div>
              </div>

              <div className="col-12 col-lg-4">
                <div className="footer-text mb-4">
                  Ngân hàng Vietcombank - CN Tân Định
                </div>

                <div className="footer-payment-title">Phương thức thanh toán</div>

                <div className="footer-payments">
                  <div className="payment-item">MoMo</div>
                  <div className="payment-item">VNPAY</div>
                  <div className="payment-item">Apple Pay</div>
                  <div className="payment-item">VISA</div>
                  <div className="payment-item">ZaloPay</div>
                  <div className="payment-item">Viettel</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;