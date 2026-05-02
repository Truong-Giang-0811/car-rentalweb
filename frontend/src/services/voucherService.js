import api from "./api";

export const getAdminVouchers = async () => {
  try {
    const response = await api.get("/admin/vouchers");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lấy danh sách voucher thất bại");
  }
};

export const getAdminVoucherDetail = async (id) => {
  try {
    const response = await api.get(`/admin/vouchers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lấy chi tiết voucher thất bại");
  }
};

export const createVoucher = async (payload) => {
  try {
    const response = await api.post("/admin/vouchers", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Tạo voucher thất bại");
  }
};

export const updateVoucher = async (id, payload) => {
  try {
    const response = await api.put(`/admin/vouchers/${id}`, payload);
    return response.data;
  } catch (error) {
    console.log("UPDATE VOUCHER ERROR =", error.response?.data);
    throw new Error(error.response?.data?.message || "Cập nhật voucher thất bại");
  }
};

export const deleteVoucher = async (id) => {
  try {
    const response = await api.delete(`/admin/vouchers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Xóa voucher thất bại");
  }
};

export const getPublicVouchers = async () => {
  try {
    const response = await api.get("/public/vouchers");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy danh sách voucher thất bại"
    );
  }
};

export const validateVoucherCode = async (payload) => {
  try {
    const response = await api.post("/public/vouchers/validate-code", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Kiểm tra mã khuyến mãi thất bại"
    );
  }
};

export const getMyRewardVouchers = async () => {
  try {
    const response = await api.get("/rewards/my-vouchers");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy danh sách voucher của tôi thất bại"
    );
  }
};

export const getSpinStatus = async () => {
  try {
    const response = await api.get("/rewards/spin-status");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy trạng thái vòng quay thất bại"
    );
  }
};

export const spinReward = async () => {
  try {
    const response = await api.post("/rewards/spin");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Quay thưởng thất bại"
    );
  }
};

export const getRewardHistory = async () => {
  try {
    const response = await api.get("/rewards/history");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lấy lịch sử quà tặng thất bại"
    );
  }
};