import api from "./api";

export const loginApi = async (data) => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data; // { token, user }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
  }
};

export const registerApi = async (data) => {
  try {
    const response = await api.post("/auth/register", data);
    return response.data; // { token, user }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Đăng ký thất bại");
  }
};

/**
 * Lấy thông tin cá nhân của người dùng đã đăng nhập
 * Backend: [GET] api/user/profile
 */
export const getMyProfileApi = async () => {
  try {
    const response = await api.get("/user/profile");
    return response.data; // Trả về { id, fullName, email, phoneNumber, role, createdAt }
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy thông tin người dùng",
    );
  }
};

/**
 * Cập nhật thông tin cá nhân
 * Backend: [PUT] api/user/profile
 */
export const updateProfileApi = async (data) => {
  try {
    const response = await api.put("/user/profile", data);
    return response.data; // Trả về { message, fullName, email }
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Cập nhật thông tin thất bại",
    );
  }
};

/**
 * Đổi mật khẩu
 * Backend: [PUT] api/user/change-password
 */
export const changePasswordApi = async (data) => {
  try {
    const response = await api.put("/user/change-password", data);
    return response.data; // Trả về { message: "Đổi mật khẩu thành công" }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Đổi mật khẩu thất bại");
  }
};

// --- ADMIN ONLY ---

/**
 * Lấy danh sách tất cả người dùng (Chỉ dành cho Admin)
 * Backend: [GET] api/user/all
 */
export const getAllUsersApi = async () => {
  try {
    const response = await api.get("/user/all");
    return response.data; // Trả về danh sách users
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Không có quyền truy cập danh sách người dùng",
    );
  }
};
