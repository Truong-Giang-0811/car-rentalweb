import api from "./api";

// ==================== CARS ====================
// Tạo xe
export const createCar = async (payload) => {
  try {
    const response = await api.post("/cars", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Tạo xe thất bại");
  }
};

// Cập nhật xe
export const updateCar = async (id, payload) => {
  try {
    const response = await api.put(`/cars/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Cập nhật xe thất bại");
  }
};

// Xóa xe
export const deleteCar = async (id) => {
  try {
    const response = await api.delete(`/cars/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Xóa xe thất bại");
  }
};

// Danh sách xe của chủ
export const getMyCars = async () => {
  try {
    const response = await api.get("/cars/my");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy danh sách xe thất bại",
    );
  }
};

// Lấy chi tiết xe
export const getCarDetail = async (carId) => {
  try {
    const response = await api.get(`/cars/${carId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy chi tiết xe thất bại",
    );
  }
};

// ==================== IMAGES ====================
// Upload ảnh lên server
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.url;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Upload ảnh thất bại");
  }
};

// Thêm ảnh xe
export const addCarImage = async (carId, payload) => {
  try {
    const response = await api.post(`/cars/${carId}/images`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Thêm ảnh xe thất bại");
  }
};

// ==================== PUBLIC CARS ====================
// Tìm xe công khai theo địa điểm
export const searchPublicCars = async (params = {}) => {
  try {
    if (typeof params === "string") {
      const response = await api.get(
        `/public/cars?location=${encodeURIComponent(params)}`
      );
      return response.data;
    }

    const query = new URLSearchParams();

    if (params.location) query.append("location", params.location);
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);

    const response = await api.get(`/public/cars?${query.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Tìm xe thất bại");
  }
};

// Gợi ý địa điểm
export const suggestLocations = async (keyword) => {
  try {
    const response = await api.get(
      `/public/cars/locations?keyword=${encodeURIComponent(keyword)}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Gợi ý địa điểm thất bại");
  }
};

// Lấy chi tiết xe công khai
export const getPublicCarDetail = async (carId) => {
  try {
    const response = await api.get(`/public/cars/${carId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy chi tiết xe thất bại",
    );
  }
};

// ==================== FAVORITES ====================
// Lấy danh sách xe yêu thích
export const getFavoriteCars = async () => {
  try {
    const response = await api.get("/favorites");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy danh sách yêu thích thất bại",
    );
  }
};

// Kiểm tra xe có trong yêu thích
export const checkFavorite = async (carId) => {
  try {
    const response = await api.get(`/favorites/check/${carId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Kiểm tra yêu thích thất bại",
    );
  }
};

// Thêm/xóa xe khỏi yêu thích
export const toggleFavorite = async (carId) => {
  try {
    const response = await api.post(`/favorites/toggle/${carId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Cập nhật yêu thích thất bại",
    );
  }
};

// ==================== BOOKINGS ====================
// Tạo đặt chỗ
export const createBooking = async (payload) => {
  try {
    const response = await api.post("/bookings", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Tạo đặt chỗ thất bại");
  }
};

// Danh sách đặt chỗ của khách hàng
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

// Danh sách đặt chỗ của chủ xe
export const getOwnerBookings = async () => {
  try {
    const response = await api.get("/bookings/owner");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy danh sách đặt chỗ của chủ thất bại",
    );
  }
};

// Lấy chi tiết đặt chỗ
export const getBookingDetail = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy chi tiết đặt chỗ thất bại",
    );
  }
};

// Phê duyệt đặt chỗ
export const approveBooking = async (id) => {
  try {
    const response = await api.post(`/bookings/${id}/approve`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Phê duyệt đặt chỗ thất bại",
    );
  }
};

// Từ chối đặt chỗ
export const rejectBooking = async (id) => {
  try {
    const response = await api.post(`/bookings/${id}/reject`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Từ chối đặt chỗ thất bại",
    );
  }
};

// Danh sách hợp đồng của chủ xe
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

// Xác nhận lấy xe
export const confirmPickUp = async (id) => {
  try {
    const response = await api.post(`/bookings/${id}/pick-up`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Xác nhận lấy xe thất bại",
    );
  }
};

// Hoàn thành đặt chỗ
export const completeBooking = async (id) => {
  try {
    const response = await api.post(`/bookings/${id}/complete`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Hoàn thành đặt chỗ thất bại",
    );
  }
};
