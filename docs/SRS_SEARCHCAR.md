# Software Requirement Specification (SRS)
## Chức năng: Tìm kiếm xe (Search Cars)

**Mã chức năng:** SEARCH-01  
**Trạng thái:** Draft / Review  
**Người soạn thảo:** Nguyễn Văn Công  
**Vai trò:** Developer / Analyst  

---

## 1. 📌 Mô tả tổng quan (Description)

Chức năng tìm kiếm xe cho phép người dùng (Customer) tìm xe theo:

- Địa chỉ
- Ngày bắt đầu thuê
- Ngày kết thúc thuê

Hệ thống hỗ trợ **gợi ý địa chỉ (autocomplete)** dựa trên dữ liệu có trong database.

---

## 2. 🔄 Luồng nghiệp vụ (User Workflow)

| Bước | Hành động người dùng | Phản hồi hệ thống |
| :--- | :--- | :--- |
| 1 | Truy cập trang tìm kiếm | Hiển thị form |
| 2 | Nhập địa chỉ | Hiển thị gợi ý |
| 3 | Chọn địa chỉ | Điền vào input |
| 4 | Chọn ngày thuê | Lưu dữ liệu |
| 5 | Nhấn tìm kiếm | Gửi API |
| 6 | Backend xử lý | Truy vấn DB |
| 7 | Có kết quả | Hiển thị danh sách xe |
| 8 | Không có | Hiển thị thông báo |

---
## 🔄 Search Flow (Mermaid Diagram)

```mermaid

flowchart TD

A[Truy cập trang tìm kiếm xe] --> B[Nhập địa chỉ]

B --> C[Hệ thống hiển thị gợi ý địa chỉ từ DB]

C --> D[Người dùng chọn địa chỉ]

D --> E[Chọn ngày bắt đầu thuê]
E --> F[Chọn ngày kết thúc thuê]

F --> G{Kiểm tra dữ liệu hợp lệ}

G -->|Thiếu địa chỉ| H[Hiển thị lỗi: Vui lòng nhập địa chỉ]
H --> B

G -->|Thiếu ngày thuê| I[Hiển thị lỗi: Vui lòng chọn ngày thuê]
I --> E

G -->|EndDate < StartDate| J[Hiển thị lỗi: Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu]
J --> E

G -->|Hợp lệ| K[Gửi request tìm kiếm đến API]

K --> L[Backend truy vấn DB]

L --> M{Có xe phù hợp không?}

M -->|Không| N[Hiển thị thông báo không tìm thấy xe phù hợp]

M -->|Có| O[Trả về danh sách xe phù hợp]

O --> P[Hiển thị kết quả tìm kiếm]

```

## 🔗 Sequence Diagram

```mermaid

sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Nhập địa chỉ
    Frontend->>Backend: GET /api/cars/address-suggestions?keyword=...
    Backend->>Database: Tìm địa chỉ phù hợp
    Database-->>Backend: Danh sách địa chỉ
    Backend-->>Frontend: Address Suggestions
    Frontend-->>User: Hiển thị gợi ý địa chỉ

    User->>Frontend: Chọn địa chỉ + chọn ngày thuê
    Frontend->>Backend: GET /api/cars/search?address=...&startDate=...&endDate=...

    Backend->>Backend: Validate dữ liệu
    Backend->>Database: Tìm xe theo địa chỉ
    Backend->>Database: Loại bỏ xe đã được booking trong khoảng thời gian yêu cầu
    Database-->>Backend: Danh sách xe phù hợp

    alt Không có xe phù hợp
        Backend-->>Frontend: 404 Not Found / []
        Frontend-->>User: Hiển thị thông báo không tìm thấy xe phù hợp
    else Có xe phù hợp
        Backend-->>Frontend: 200 OK (Car List)
        Frontend-->>User: Hiển thị danh sách xe
    end

```
---

## 3. 📊 Yêu cầu dữ liệu

### Input

- Address (string, required)
- StartDate (date, required)
- EndDate (date, required)

---

### Processing

- Validate input
- EndDate >= StartDate
- Search car theo địa chỉ
- Loại bỏ xe đã booking
- Chỉ lấy xe available

---

### Output

- Danh sách xe phù hợp

---

## 4. 🔌 API Specification

### Endpoint

`GET /api/cars/search`

---

### Query Params

- address
- startDate
- endDate

---

### Response Body (Search Cars)

```json
[
{
"carId": "string",
"carName": "Toyota Vios",
"address": "Hà Nội",
"pricePerDay": 800000,
"seats": 5,
"status": "Available"
}
]

---

### Endpoint gợi ý địa chỉ

`GET /api/cars/address-suggestions`

---

### Response Body (Address Suggestions)

```json
[
"Hà Nội",
"Hồ Chí Minh",
"Đà Nẵng"
]


---

### Response Codes

- 200 OK  
- 400 Bad Request  
- 404 Not Found  
- 500 Internal Server Error  

---

## 5. 🔐 Ràng buộc

- Tìm kiếm theo địa chỉ + thời gian
- Gợi ý địa chỉ từ DB
- Không hiển thị xe đã bị booking
- Phải validate ngày

---

## 6. ⚠️ Edge Cases

- Không nhập địa chỉ → "Vui lòng nhập địa chỉ"
- Không chọn ngày → báo lỗi
- EndDate < StartDate → báo lỗi
- Không có kết quả → "Không tìm thấy xe"

---

## 7. 🎨 UI

- Input địa chỉ (autocomplete)
- Date picker (start/end)
- Button search
- Hiển thị list xe dạng card

---

## 8. ✅ Acceptance Criteria

- Có gợi ý địa chỉ khi nhập
- Tìm đúng xe theo điều kiện
- Không hiển thị xe trùng lịch
- Hiển thị lỗi đúng

---

## 9. 📌 Pre-condition

- Có dữ liệu xe
- DB hoạt động

---

## 10. 📌 Post-condition

- Trả danh sách xe
- Cho phép user tiếp tục booking

---

## 11. 📏 Business Rules

- Chỉ xe available được hiển thị
- Booking trùng thời gian bị loại
- Địa chỉ lấy từ DB
