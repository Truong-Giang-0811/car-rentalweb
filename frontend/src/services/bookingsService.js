import api from "./api";

// ==================== BOOKINGS API ====================

// 1. Tạo đơn đặt xe mới
// Tương ứng: POST /api/bookings
export const createBooking = async (payload) => {
  try {
    const response = await api.post("/bookings", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Tạo đặt chỗ thất bại");
  }
};

// 2. Lấy danh sách đặt xe của khách hàng (người thuê)
// Tương ứng: GET /api/bookings/my
export const getMyBookings = async () => {
  try {
    const response = await api.get("/bookings/my");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy danh sách đặt chỗ thất bại",
    );
  }
};

// 3. Lấy danh sách đặt xe của chủ xe (người cho thuê)
// Tương ứng: GET /api/bookings/owner
export const getOwnerBookings = async () => {
  try {
    const response = await api.get("/bookings/owner");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy danh sách yêu cầu thuê xe thất bại",
    );
  }
};

// 4. Lấy chi tiết một đơn đặt xe (Dùng cho cả khách và chủ)
// Tương ứng: GET /api/bookings/{id}
export const getBookingDetail = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy chi tiết đơn thuê thất bại",
    );
  }
};

// 5. Chủ xe phê duyệt đơn đặt xe (Chuyển sang trạng thái chờ thanh toán)
// Tương ứng: POST /api/bookings/{id}/approve
export const approveBooking = async (id) => {
  try {
    const response = await api.post(`/bookings/${id}/approve`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Phê duyệt đơn thuê thất bại",
    );
  }
};

// 6. Chủ xe từ chối đơn đặt xe
// Tương ứng: POST /api/bookings/{id}/reject
export const rejectBooking = async (id) => {
  try {
    const response = await api.post(`/bookings/${id}/reject`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Từ chối đơn thuê thất bại",
    );
  }
};

// 7. Lấy mã QR thanh toán cho một đơn đặt xe
// Tương ứng: GET /api/bookings/{id}/payment-qr
export const getPaymentQr = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}/payment-qr`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể tạo mã QR thanh toán",
    );
  }
};

// 8. Xác nhận bàn giao xe thực tế (Chuyển sang trạng thái PickedUp)
// Tương ứng: POST /api/bookings/{id}/pick-up
export const confirmPickUp = async (id) => {
  try {
    const response = await api.post(`/bookings/${id}/pick-up`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Xác nhận bàn giao xe thất bại",
    );
  }
};

// 9. Hoàn thành đơn thuê (Xác nhận trả xe thành công)
// Tương ứng: POST /api/bookings/{id}/complete
export const completeBooking = async (id) => {
  try {
    const response = await api.post(`/bookings/${id}/complete`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Hoàn thành đơn thuê thất bại",
    );
  }
};

// 10. Xem danh sách tất cả hợp đồng PDF của chủ xe
// Tương ứng: GET /api/bookings/owner/contracts
export const getOwnerContracts = async () => {
  try {
    const response = await api.get("/bookings/owner/contracts");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy danh sách hợp đồng thất bại",
    );
  }
};
// 11. Tạo link thanh toán PayOS cho đơn đặt xe đã được phê duyệt
export const createPayOSLink = async (id) => {
  try {
    const response = await api.post(`/bookings/${id}/payos-link`);
    return response.data; // Trả về object có { checkoutUrl, ... }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối PayOS");
  }
};

// 12. Lấy danh sách đơn hàng gần đây của chủ xe (mặc định 3 đơn)
export const getRecentOwnerBookings = async (limit = 3) => {
  try {
    const data = await getOwnerBookings();
    return data.slice(0, limit);
  } catch (error) {
    throw new Error(
      error.message || "Không thể tải danh sách đơn hàng gần đây",
    );
  }
};
