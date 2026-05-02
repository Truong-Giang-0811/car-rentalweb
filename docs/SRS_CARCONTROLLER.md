# Software Requirement Specification (SRS)

## Chức năng: Đăng ký xe mới (Create Car)

**Mã chức năng:** CAR-03  
**Trạng thái:** Draft / Review  
**Người soạn thảo:** [Vu Truong Giang]  
**Vai trò:** Developer / Analyst

---

### 1. Mô tả tổng quan (Description)

Chức năng này cho phép người dùng (Chủ xe) đăng ký thông tin xe mới lên hệ thống để cho thuê. Hệ thống sẽ lưu trữ các thông số kỹ thuật, đặc điểm nhận dạng và giá thuê của xe. Mọi xe sau khi tạo thành công sẽ mặc định ở trạng thái "Sẵn sàng" (`IsAvailable = true`).

---

### 2. Luồng nghiệp vụ (User Workflow)

| Bước | Hành động người dùng                | Phản hồi hệ thống                                                 |
| :--- | :---------------------------------- | :---------------------------------------------------------------- |
| 1    | Truy cập form "Đăng ký cho thuê xe" | Hiển thị form nhập liệu thông tin xe                              |
| 2    | Nhập thông tin xe và nhấn "Lưu"     | Kiểm tra các trường bắt buộc (Biển số, Hãng, Dòng xe, Địa chỉ)    |
| 3    | Gửi request POST đến API            | Backend xác thực Token và kiểm tra tính hợp lệ của dữ liệu        |
| 4    | Dữ liệu hợp lệ                      | Khởi tạo Object Car, gán `OwnerId`, băm nhỏ dữ liệu và lưu vào DB |
| 5    | Tạo thành công                      | Trả về `Id` của xe mới và thông báo thành công                    |
| 6    | Thiếu thông tin                     | Trả về lỗi 400 kèm thông báo thiếu thông tin bắt buộc             |

---

## 🔄 Create Car Flow (Mermaid Diagram)

```mermaid
flowchart TD
    A[Nhập thông tin xe] --> B{Nhấn nút Lưu}
    B --> C{Validate Client-side}
    C -->|Thiếu trường bắt buộc| D[Hiển thị cảnh báo trên UI]
    D --> A
    C -->|Hợp lệ| E[Gửi request POST /api/cars]
    E --> F{Backend Validate}
    F -->|Dữ liệu trống/null| G[Trả về 400: Thiếu thông tin]
    G --> A
    F -->|Hợp lệ| H[Lấy UserId từ Token]
    H --> I[Khởi tạo Guid & Gán mặc định IsAvailable=true]
    I --> J[Lưu vào bảng Cars]
    J --> K[Trả về 200 OK + car.Id]
    K --> L[Chuyển hướng đến trang Quản lý xe]
```

```mermaid
sequenceDiagram
    participant Owner as Chủ xe
    participant Frontend
    participant Backend
    participant Database

    Owner->>Frontend: Nhập thông tin (Biển số, Hãng, Giá...)
    Frontend->>Backend: POST /api/cars (CreateCarDto + Token)

    Backend->>Backend: Kiểm tra null/white space (LicensePlate, Brand...)

    alt Thông tin thiếu
        Backend-->>Frontend: 400 Bad Request (Thiếu thông tin)
    else Thông tin hợp lệ
        Backend->>Backend: GetUserId() từ JWT
        Backend->>Backend: Trim() dữ liệu & Gán CreatedAt (UTC)
        Backend->>Database: Thêm bản ghi mới vào bảng Cars
        Database-->>Backend: Thành công (Commit)
        Backend-->>Frontend: 200 OK { Id: "..." }
        Frontend-->>Owner: Thông báo tạo xe thành công
    end
```

---

### 3. Yêu cầu dữ liệu (Data Requirements)

#### 3.1. Dữ liệu đầu vào (CreateCarDto)

- **LicensePlate:** `string`, bắt buộc, biển số xe (ví dụ: 30A-123.45).
- **Brand:** `string`, bắt buộc, hãng sản xuất (Toyota, VinFast, Hyundai...).
- **Model:** `string`, bắt buộc, dòng xe (Vios, VF8, Accent...).
- **Year:** `int`, năm sản xuất của xe.
- **Seats:** `int`, số chỗ ngồi (4, 5, 7...).
- **Transmission:** `string`, loại hộp số (Số sàn/Số tự động).
- **Fuel:** `string`, loại nhiên liệu (Xăng/Dầu/Điện).
- **Address:** `string`, bắt buộc, địa điểm nhận xe thực tế.
- **PricePerDay:** `decimal/double`, đơn giá thuê cho 1 ngày.
- **Description:** `string`, mô tả chi tiết thêm về xe (không bắt buộc).

#### 3.2. Dữ liệu xử lý (Logic Backend)

- **Validation:** Hệ thống kiểm tra nghiêm ngặt `LicensePlate`, `Brand`, `Model`, `Address`. Nếu bất kỳ trường nào rỗng hoặc chỉ chứa khoảng trắng, hệ thống sẽ từ chối xử lý.
- **Data Cleaning:** Tự động thực hiện hàm `.Trim()` để loại bỏ khoảng trắng thừa ở hai đầu chuỗi văn bản trước khi lưu vào Database.
- **Default Values (Giá trị mặc định):**
  - `Id`: Được khởi tạo bằng `Guid.NewGuid()`.
  - `OwnerId`: Lấy trực tiếp từ Claim của JWT Token (người dùng đang đăng nhập).
  - `IsAvailable`: Luôn mặc định là `true` để xe có thể hiển thị trên thị trường ngay lập tức.
  - `CreatedAt`: Thời gian tạo bản ghi tính theo giờ quốc tế `DateTime.UtcNow`.

#### 3.3. Dữ liệu đầu ra (Response)

- **Success:** Trả về mã `200 OK` kèm theo `Id` (Guid) của xe vừa tạo.
- **Mục đích:** Frontend sử dụng `Id` này để điều hướng người dùng sang trang tải lên hình ảnh xe (Step 2).

---

### 4. Ràng buộc kỹ thuật & Bảo mật (Technical Constraints)

- **Xác thực:** Mọi yêu cầu phải gửi kèm `Authorization: Bearer [JWT]` hợp lệ.
- **Bảo mật danh tính:** `OwnerId` tuyệt đối không được nhận từ phía Client gửi lên. Backend phải tự trích xuất từ Token để đảm bảo tính chính chủ, tránh việc tạo xe thay cho người khác.
- **Toàn vẹn dữ liệu:** Sử dụng cơ chế Transaction (Giao dịch). Nếu việc lưu thông tin xe gặp lỗi, toàn bộ tiến trình phải được hủy bỏ (Rollback) để đảm bảo không có dữ liệu rác trong hệ thống.

---

### 5. Trường hợp ngoại lệ & Xử lý lỗi (Edge Cases)

- **Thiếu thông tin bắt buộc:** Backend trả về lỗi `400 Bad Request` kèm thông báo: "Thiếu thông tin bắt buộc."
- **Sai định dạng dữ liệu:** Nếu các trường số (Year, Seats, Price) nhận giá trị là văn bản không hợp lệ, hệ thống sẽ trả về lỗi định dạng dữ liệu.
- **Lỗi kết nối:** Nếu Database bị ngắt kết nối, hệ thống trả về mã `500 Internal Server Error` và yêu cầu người dùng thử lại sau.

---

### 6. Giao diện (UI/UX)

- **Cấu trúc Form:** Chia thành các nhóm logic (Thông tin chung, Thông số kỹ thuật, Giá & Địa chỉ) để người dùng dễ nhập liệu.
- **Input Controls:**
  - Sử dụng **Dropdown/Select** cho các trường cố định như Hộp số, Nhiên liệu để chuẩn hóa dữ liệu.
  - Sử dụng **Numeric Input** cho các trường liên quan đến giá và số chỗ.
- **Phản hồi người dùng:** Nút "Lưu" phải hiển thị trạng thái **Loading/Disabled** trong khi API đang xử lý để tránh người dùng nhấn lặp lại.
- **Navigation:** Sau khi lưu thành công, hiển thị thông báo "Đăng ký xe thành công" và tự động điều hướng sang phần upload ảnh.

---

### 7. Điều kiện tiền đề & Hậu điều kiện

- **Tiền đề (Pre-conditions):**
  - Người dùng đã đăng nhập với vai trò hợp lệ (Owner).
  - Phiên làm việc (Token) vẫn còn hiệu lực.
- **Hậu điều kiện (Post-conditions):**
  - Một bản ghi xe mới được tạo thành công trong Database.
  - Thông tin xe xuất hiện trong danh sách "Xe của tôi" của người dùng.

## Chức năng: Hiển thị danh sách xe của tôi (My Cars)

**Mã chức năng:** CAR-04  
**Trạng thái:** Draft / Review  
**Người soạn thảo:** [Vu Truong Giang]  
**Vai trò:** Developer / Analyst

---

### 1. Mô tả tổng quan (Description)

Chức năng này cho phép **Chủ xe (Owner)** xem danh sách tất cả các xe mà họ đã đăng ký lên hệ thống. Hệ thống sẽ hiển thị các thông tin cơ bản của xe kèm theo ảnh đại diện (Thumbnail) để chủ xe dễ dàng theo dõi trạng thái và quản lý tài sản của mình.

---

### 2. Luồng nghiệp vụ (User Workflow)

| Bước | Hành động người dùng          | Phản hồi hệ thống                                                      |
| :--- | :---------------------------- | :--------------------------------------------------------------------- |
| 1    | Truy cập vào mục "Xe của tôi" | Frontend gửi request kèm JWT Token đến API                             |
| 2    | Hệ thống xác thực người dùng  | Backend lấy `userId` từ Token                                          |
| 3    | Truy vấn dữ liệu              | Backend tìm kiếm các xe có `OwnerId` tương ứng trong Database          |
| 4    | Xử lý hình ảnh                | Hệ thống tự động chọn ảnh loại `Type = 0` (Mặt trước) làm ảnh đại diện |
| 5    | Trả về kết quả                | Hiển thị danh sách xe sắp xếp theo thời gian tạo mới nhất              |

---

## 🔄 My Cars Flow (Mermaid Diagram)

```mermaid
flowchart TD
    A[Truy cập trang Xe của tôi] --> B[Gửi Request GET /api/cars/my]
    B --> C{Xác thực JWT}
    C -->|Không hợp lệ| D[Yêu cầu đăng nhập lại]
    C -->|Hợp lệ| E[Lấy UserId từ Token]
    E --> F[Truy vấn bảng Cars theo OwnerId]
    F --> G[Lấy ảnh đầu tiên làm Thumbnail]
    G --> H[Sắp xếp CreatedAt giảm dần]
    H --> I[Trả về danh sách 200 OK]
    I --> J[Hiển thị danh sách xe lên UI]
```

```mermaid
sequenceDiagram
    participant Owner as Chủ xe
    participant Frontend
    participant Backend
    participant Database

    Owner->>Frontend: Mở trang "Xe của tôi"
    Frontend->>Backend: GET /api/cars/my (Authorization: Bearer Token)

    Backend->>Backend: GetUserId() từ Token

    Backend->>Database: Query Cars where OwnerId = userId
    Database->>Database: Join CarImages lấy ảnh đầu tiên
    Database-->>Backend: Trả về danh sách xe (List Cars)

    Backend->>Backend: Format URL Thumbnail
    Backend-->>Frontend: JSON Result (Id, Brand, Model, Price, Thumbnail,...)
    Frontend-->>Owner: Hiển thị danh sách xe dưới dạng Card
```

---

### 3. Yêu cầu dữ liệu (Data Requirements)

#### 3.1. Dữ liệu đầu vào (Request)

- **Header:** `Authorization: Bearer [JWT_Token]` (Bắt buộc để xác thực người dùng).

#### 3.2. Dữ liệu xử lý (Logic Backend)

- **Lọc dữ liệu:** Truy vấn bảng `Cars`, chỉ lấy các bản ghi có `OwnerId` khớp với `userId` được trích xuất từ Token.
- **Sắp xếp:** Sử dụng `OrderByDescending(c => c.CreatedAt)` để hiển thị xe mới nhất lên đầu danh sách.
- **Xử lý Thumbnail:**
  - Hệ thống tìm kiếm trong bảng `CarImages`.
  - Ưu tiên chọn ảnh có `Type = 0` (Mặt trước).
  - Nếu không có `Type = 0`, lấy ảnh đầu tiên dựa trên `SortOrder`.
- **Tối ưu hóa:** Sử dụng `.AsNoTracking()` trong Entity Framework để giảm tải bộ nhớ và tăng tốc độ truy vấn cho các thao tác chỉ đọc (Read-only).

#### 3.3. Dữ liệu đầu ra (Response)

Danh sách trả về một mảng các đối tượng xe, mỗi đối tượng gồm:

- `Id`: `Guid/int`, mã định danh xe.
- `Brand`, `Model`, `Year`: Thông tin chi tiết về hãng, dòng và đời xe.
- `Seats`: Số chỗ ngồi.
- `Address`: Địa điểm hiện tại của xe.
- `PricePerDay`: Giá thuê tính theo ngày.
- `IsAvailable`: Trạng thái (Trống/Đang được thuê).
- `Thumbnail`: Chuỗi URL đầy đủ dẫn đến file ảnh (đã được nối với `baseUrl`).

---

### 4. Ràng buộc kỹ thuật & Bảo mật (Technical Constraints)

- **Xác thực (Authentication):** Chỉ những yêu cầu có đính kèm JWT hợp lệ mới được xử lý.
- **Bảo mật dữ liệu (Data Privacy):** Chủ xe tuyệt đối không thể truy cập danh sách xe của người khác thông qua việc thay đổi ID (Ràng buộc chặt chẽ bởi `userId` lấy từ Token phía Backend).
- **Xử lý hình ảnh:** Nếu xe chưa được cập nhật ảnh, trường `Thumbnail` phải trả về `null` thay vì chuỗi trống hoặc lỗi 404.
- **Tối ưu hóa băng thông:** Chỉ thực hiện `Select` các trường cần thiết cho giao diện danh sách, không tải các dữ liệu nặng như `Description` chi tiết hoặc toàn bộ danh sách ảnh trong bước này.

---

### 5. Trường hợp ngoại lệ & Xử lý lỗi (Edge Cases)

- **Danh sách trống:** Nếu chủ xe chưa đăng ký xe nào, trả về mã `200 OK` với mảng rỗng `[]`. Frontend hiển thị thông báo: "Bạn chưa đăng ký xe nào".
- **Token hết hạn/Sai:** Trả về mã lỗi `401 Unauthorized`. Frontend điều hướng về trang đăng nhập.
- **Lỗi đường dẫn ảnh:** Nếu ảnh không tồn tại trên server, trả về `null` để Frontend hiển thị ảnh mặc định (Placeholder).

---

### 6. Giao diện (UI/UX)

- **Layout:** Hiển thị dưới dạng danh sách các thẻ (**Card**) trực quan.
- **Thông tin trên Card:**
  - Ảnh đại diện xe (Thumbnail).
  - Tên xe (Kết hợp Brand + Model).
  - Giá thuê và địa chỉ.
  - Nhãn trạng thái (Badge): **Available** (Xanh) hoặc **Busy** (Đỏ).
- **Tương tác:**
  - Nhấn vào Card để xem chi tiết xe.
  - Tích hợp nút "Chỉnh sửa" hoặc "Quản lý" nhanh trên từng thẻ.
- **Tính năng bổ sung:** Hỗ trợ **Pull-to-refresh** trên thiết bị di động để người dùng cập nhật lại danh sách.

---

### 7. Điều kiện tiền đề & Hậu điều kiện

- **Điều kiện tiền đề (Pre-conditions):**
  - Người dùng đã đăng nhập thành công.
  - Tài khoản có quyền hợp lệ (Owner/Customer).
- **Điều kiện hậu (Post-conditions):**
  - Hiển thị danh sách xe thuộc sở hữu của người dùng một cách chính xác.
  - Trạng thái xe được cập nhật thời gian thực từ Database.

## Chức năng: Cập nhật thông tin xe (Update Car)

**Mã chức năng:** CAR-05  
**Trạng thái:** Draft / Review  
**Người soạn thảo:** [Vu Truong Giang]  
**Vai trò:** Developer / Analyst

---

### 1. Mô tả tổng quan (Description)

Chức năng này cho phép chủ xe chỉnh sửa các thông số kỹ thuật, thông tin mô tả hoặc thay đổi giá thuê của một chiếc xe đã đăng ký. Hệ thống đảm bảo tính toàn vẹn dữ liệu bằng cách xác thực quyền sở hữu trước khi cho phép lưu các thay đổi.

---

### 2. Luồng nghiệp vụ (User Workflow)

| Bước | Hành động người dùng                  | Phản hồi hệ thống                                                     |
| :--- | :------------------------------------ | :-------------------------------------------------------------------- |
| 1    | Nhấn nút "Chỉnh sửa" trên Card xe     | Frontend gọi API lấy chi tiết xe và hiển thị form điền sẵn dữ liệu cũ |
| 2    | Thay đổi thông tin và nhấn "Cập nhật" | Kiểm tra tính hợp lệ của dữ liệu đầu vào                              |
| 3    | Gửi request PUT đến API               | Backend xác thực Token và kiểm tra quyền sở hữu xe                    |
| 4    | Dữ liệu hợp lệ và đúng chủ xe         | Cập nhật các trường thông tin tương ứng trong Database                |
| 5    | Thành công                            | Trả về thông báo "Cập nhật thành công" và điều hướng về danh sách     |

---

## 🔄 Update Car Flow (Mermaid Diagram)

```mermaid
flowchart TD
    A[Mở form chỉnh sửa] --> B[Thay đổi thông tin xe]
    B --> C{Nhấn Cập nhật}
    C --> D["Gửi request PUT /api/cars/{id}"]
    D --> E{Backend Check Owner}
    E -->|Không phải chủ xe| F["Trả về 404/403: Không có quyền"]
    E -->|Hợp lệ| G[Validate & Trim dữ liệu mới]
    G --> H[Update bản ghi vào bảng Cars]
    H --> I[Trả về 200 OK]
    I --> J[Hiển thị Toast thông báo thành công]
```

---

### 3. Yêu cầu dữ liệu (Data Requirements)

#### 3.1. Dữ liệu đầu vào (CreateCarDto)

- Tương tự như chức năng tạo xe (LicensePlate, Brand, Model, Year, Seats, Transmission, Fuel, Address, PricePerDay, Description).

#### 3.2. Dữ liệu xử lý (Logic Backend)

- **Xác thực quyền:** Sử dụng `c.Id == id && c.OwnerId == userId` để đảm bảo người dùng chỉ sửa được xe của chính họ.
- **Cập nhật từng phần:** Chỉ cập nhật các trường được phép thay đổi. Các trường như `Id`, `OwnerId`, `CreatedAt` được giữ nguyên.
- **Chuẩn hóa:** Tiếp tục thực hiện `.Trim()` cho các chuỗi văn bản để loại bỏ khoảng trắng thừa.

#### 3.3. Dữ liệu đầu ra (Response)

- **Success:** `{ message: "Cập nhật thành công." }` kèm mã 200.
- **Fail:** Trả về mã 404 nếu không tìm thấy xe hoặc không đúng chủ sở hữu.

---

### 4. Ràng buộc kỹ thuật & Bảo mật

- **Bảo mật:** Ràng buộc chặt chẽ `OwnerId` từ JWT Token.
- **Hiệu suất:** Không sử dụng `AsNoTracking()` vì cần tải thực thể lên để theo dõi thay đổi (Change Tracking) trước khi `SaveChangesAsync()`.

---

## Chức năng: Xóa xe (Delete Car)

**Mã chức năng:** CAR-06  
**Trạng thái:** Draft / Review  
**Người soạn thảo:** [Vu Truong Giang]  
**Vai trò:** Developer / Analyst

---

### 1. Mô tả tổng quan (Description)

Chức năng này cho phép chủ xe gỡ bỏ hoàn toàn một chiếc xe khỏi hệ thống. Khi thực hiện xóa, hệ thống sẽ đồng thời dọn dẹp các dữ liệu liên quan (như hình ảnh xe) để tránh mồ côi dữ liệu.

---

### 2. Luồng nghiệp vụ (User Workflow)

| Bước | Hành động người dùng                  | Phản hồi hệ thống                                            |
| :--- | :------------------------------------ | :----------------------------------------------------------- |
| 1    | Nhấn nút "Xóa" trên giao diện quản lý | Hiển thị hộp thoại xác nhận (Confirm Dialog)                 |
| 2    | Xác nhận xóa                          | Gửi request DELETE kèm ID xe và Token                        |
| 3    | Backend xử lý                         | Kiểm tra quyền chủ xe và thực hiện xóa các bản ghi liên quan |
| 4    | Thành công                            | Trả về mã 200 và cập nhật lại danh sách trên UI              |

---

## 🔄 Delete Car Flow (Mermaid Diagram)

```mermaid
sequenceDiagram
    participant Owner as Chủ xe
    participant Frontend
    participant Backend
    participant Database

    Owner->>Frontend: Nhấn nút Xóa & Xác nhận
    Frontend->>Backend: DELETE /api/cars/{id}

    Backend->>Database: Tìm xe theo Id và OwnerId
    alt Không tìm thấy
        Database-->>Backend: null
        Backend-->>Frontend: 404 Not Found
    else Tìm thấy xe
        Backend->>Database: Tìm & Xóa các bản ghi trong CarImages
        Backend->>Database: Xóa bản ghi trong Cars
        Database-->>Backend: Thành công (Commit Transaction)
        Backend-->>Frontend: 200 OK (Đã xóa thành công)
        Frontend-->>Owner: Thông báo và xóa Card xe khỏi UI
    end
```

---

### 3. Yêu cầu dữ liệu (Data Requirements)

#### 3.1. Dữ liệu đầu vào (Request)

- `id`: `Guid`, mã định danh của xe cần xóa (truyền qua URL).
- `Authorization Header`: Chứa JWT Token của chủ xe.

#### 3.2. Dữ liệu xử lý (Logic Backend)

- **Clean-up:** Trước khi xóa xe, hệ thống thực hiện `RemoveRange` cho danh sách ảnh của xe đó trong bảng `CarImages` để đảm bảo không vi phạm ràng buộc khóa ngoại (Foreign Key Constraint).
- **Phân quyền:** Chỉ cho phép xóa nếu `OwnerId` trong Database khớp với `Sub/NameIdentifier` trong Token.

#### 3.3. Dữ liệu đầu ra (Response)

- **Success:** `{ message: "Đã xóa xe thành công." }`.

---

### 4. Ràng buộc kỹ thuật & Bảo mật

- **Bảo mật:** Ngăn chặn việc xóa xe của người khác bằng cách giả mạo ID thông qua kiểm tra `OwnerId` tại Server-side.
- **Toàn vẹn:** Các ảnh liên quan phải được xóa trước hoặc sử dụng cơ chế Cascade Delete trong Database (Trong code hiện tại đang xử lý thủ công bằng `RemoveRange`).

---

### 5. Trường hợp ngoại lệ & Xử lý lỗi

- **Xe đang có đơn thuê:** (Logic bổ sung trong tương lai) Nếu xe đang trong quá trình được đặt hoặc đang thuê (`Bookings` active), hệ thống nên từ chối xóa và yêu cầu kết thúc chuyến đi trước.
- **Lỗi tệp tin:** Nếu xóa bản ghi DB thành công nhưng tệp ảnh vật lý trên Server vẫn còn, hệ thống cần có cơ chế dọn dẹp định kỳ (Storage Cleanup).

---

### 6. Giao diện (UI/UX)

- **Cảnh báo:** Luôn hiển thị thông báo "Hành động này không thể hoàn tác" trước khi thực hiện xóa.
- **Phản hồi:** Sau khi xóa, card xe phải biến mất ngay lập tức hoặc danh sách được tải lại tự động.

---

### 7. Điều kiện tiền đề & Hậu điều kiện

- **Tiền đề:** Xe phải thuộc sở hữu của người dùng đang đăng nhập.
- **Hậu điều kiện:** Dữ liệu xe và hình ảnh liên quan bị xóa vĩnh viễn khỏi Database.

```

```
