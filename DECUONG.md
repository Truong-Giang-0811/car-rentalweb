# 🌐 ĐỀ CƯƠNG DỰ ÁN WEB NÂNG CAO  
## 🚗 HỆ THỐNG THUÊ XE TỰ LÁI (CAR RENTAL WEB SYSTEM)

---

## 1. 📌 Giới thiệu

Hệ thống thuê xe tự lái là nền tảng cho phép:

- Người dùng đăng xe cho thuê  
- Khách hàng tìm kiếm và đặt xe  
- Hai bên thực hiện hợp đồng điện tử  

Ngoài các chức năng cơ bản, hệ thống còn tích hợp:

- Yêu thích xe  
- Thông báo  
- Thanh toán online (PayOS)  
- Điểm thưởng & voucher  
- Hệ thống bài viết cộng đồng  

---

## 2. 🎯 Mục tiêu

- Xây dựng hệ thống web hoàn chỉnh theo mô hình thực tế  
- Áp dụng kiến trúc RESTful API  
- Phân quyền rõ ràng theo vai trò  
- Tích hợp các module nâng cao:

| Module | Mô tả |
|-------|------|
| Payment | Thanh toán online qua PayOS |
| Notification | Thông báo hệ thống |
| Reward System | Điểm thưởng & voucher |
| Admin Management | Quản lý hệ thống |

---

## 3. 🧱 Kiến trúc hệ thống

[ Web Client ] <----> [ ASP.NET Core API ] <----> [ SQL Server ]

| Thành phần | Công nghệ |
|----------|----------|
| Frontend | ReactJS |
| Backend | ASP.NET Core |
| Database | SQL Server |

---

## 4. 👥 Vai trò người dùng

| Vai trò | Mô tả |
|--------|------|
| Customer | Người thuê xe |
| Admin (Owner) | Chủ xe + quản trị hệ thống |

---

### 🔹 Customer (Người thuê xe)

- Tìm kiếm xe  
- Đặt thuê xe  
- Thanh toán đơn thuê  
- Xem hợp đồng  
- Yêu thích xe  
- Nhận thông báo  
- Tích điểm & sử dụng voucher  
- Quản lý tài khoản  
- Đăng bài, tương tác cộng đồng  

---

### 🔹 Admin (Owner)

- Quản lý xe (thêm / sửa / xóa)  
- Duyệt / từ chối đơn thuê  
- Quản lý hợp đồng  
- Quản lý người dùng  
- Quản lý bài viết / tin tức  
- Quản lý voucher / khuyến mãi  
- Nhận thông báo
- Giám sát hệ thống  

---

## 5. 🔄 Các chức năng chính

### 5.1 🚗 Thuê xe

| Chức năng | Mô tả |
|----------|------|
| Xem danh sách xe | Hiển thị danh sách xe |
| Xem chi tiết xe | Thông tin chi tiết |
| Đặt thuê xe | Tạo booking |
| Theo dõi trạng thái | Pending → Completed |
| Xem hợp đồng | Preview + PDF |

---

### 5.2 ❤️ Xe yêu thích (Favorite Cars)

- Thêm / xóa xe yêu thích  

| Thuộc tính | Giá trị |
|-----------|--------|
| Lưu trữ | UserId + CarId |
| Ràng buộc | Unique |

👉 Giúp cá nhân hóa trải nghiệm người dùng  

---

### 5.3 💳 Thanh toán (Payment System)

| Chức năng | Mô tả |
|----------|------|
| Tạo link thanh toán | Gọi PayOS |
| Thanh toán online | Redirect tới PayOS |
| Xử lý webhook | Xác nhận giao dịch |
| Cập nhật đơn | Status → Confirmed |

👉 Tích hợp PayOS để xử lý thanh toán thực tế  

---

### 5.4 🔔 Thông báo (Notification System)

| Sự kiện | Mô tả |
|--------|------|
| Booking mới | Có đơn thuê |
| Duyệt / từ chối | Cập nhật trạng thái |
| Thanh toán thành công | Xác nhận đơn |

| Loại | Giá trị |
|-----|--------|
| Booking | Đơn thuê |
| Payment | Thanh toán |
| System | Hệ thống |

---

### 5.5 📄 Hợp đồng điện tử

| Chức năng | Mô tả |
|----------|------|
| Tạo hợp đồng | Sau khi thanh toán |
| Hiển thị | Text + PDF |
| Nội dung | Xe, thời gian, chi phí |

Bao gồm:

- Thông tin xe  
- Thông tin thuê  
- Chi phí  
- Xác nhận điện tử  

---

### 5.6 👤 Quản lý tài khoản

- Cập nhật thông tin  
- Đổi mật khẩu  
- Xem lịch sử thuê  
- Xem điểm thưởng  

---

### 5.7 📝 Bài viết & cộng đồng

| Chức năng | Mô tả |
|----------|------|
| Đăng bài | Tạo bài viết |
| Like | Thích |
| Comment | Bình luận |

👉 Tăng tương tác người dùng  

---

### 5.8 🎁 Điểm thưởng & Voucher

| Chức năng | Mô tả |
|----------|------|
| Tích điểm | Sau mỗi chuyến thuê |
| Đổi voucher | Sử dụng điểm |
| Áp mã | Giảm giá khi thuê |

---

### 5.9 🛠️ Quản trị hệ thống

Admin có thể:

- Quản lý người dùng  
- Quản lý xe  
- Quản lý hợp đồng  
- Quản lý bài viết  
- Quản lý voucher  

---

## 6. 🧾 Thiết kế database

| Bảng | Mô tả |
|-----|------|
| AppUser | Người dùng |
| Car | Xe |
| Booking | Đơn thuê |
| RentalAgreement | Hợp đồng |
| FavoriteCar | Xe yêu thích |
| Notification | Thông báo |
| Post | Bài viết |
| PostLike | Like |
| PostComment | Comment |
| Voucher | Voucher |
| Payment | Thanh toán |

---

## 7. 📊 Trạng thái đơn thuê

| Status | Ý nghĩa |
|--------|--------|
| Pending | Chờ duyệt |
| Approved | Đã duyệt |
| WaitingForPayment | Chờ thanh toán |
| Confirmed | Đã thanh toán |
| InProgress | Đang thuê |
| Completed | Hoàn thành |

---

## 8. 🔐 Xác nhận điện tử

| Vai trò | Hành động |
|--------|----------|
| Customer | Đồng ý hợp đồng |
| Admin | Duyệt đơn |

👉 Thanh toán thành công = xác nhận hợp đồng  

---

## 9. 🖥️ Giao diện hệ thống

### 🔹 Customer

- Home  
- Car Detail  
- Booking  
- Payment  
- Contract  
- Favorite Cars  
- Notifications  
- Profile  

---

### 🔹 Admin (Owner)

- Dashboard  
- Car Management  
- Booking Management  
- Contract Management  
- User Management  
- Post Management  
- Voucher Management  

---

## 10. 🧩 Công nghệ sử dụng

| Thành phần | Công nghệ |
|----------|---------|
| Frontend | ReactJS |
| Backend | ASP.NET Core |
| Database | SQL Server |
| ORM | Entity Framework Core |
| Auth | JWT |
| Payment | PayOS |
| PDF | PDF Service |
| Realtime | (Optional) |

---

## 11. 🚀 Điểm nổi bật

- Phân quyền rõ ràng (Customer - Admin)  
- Quy trình thuê xe thực tế  
- Hợp đồng điện tử  
- Thanh toán online tích hợp PayOS  
- Notification system  
- Reward & voucher system  
- Social features  

---

## 12. 🔮 Hướng phát triển

- AI gợi ý xe  
- Bản đồ  
- Ký số nâng cao  
- Push notification  

---

## 13. 📌 Kết luận

Hệ thống không chỉ giải quyết bài toán thuê xe  
mà còn mở rộng thành một nền tảng dịch vụ đa chức năng  
kết hợp giữa thương mại, giao tiếp và quản trị hệ thống.