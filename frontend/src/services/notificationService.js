import api from "./api";

export const getNotifications = async (take = 20) => {
  try {
    const response = await api.get(`/notifications?take=${take}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không tải được thông báo");
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await api.get("/notifications/unread-count");
    return response.data?.count || 0;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không tải được số chưa đọc");
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không đánh dấu đã đọc được");
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.put("/notifications/read-all");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể đánh dấu tất cả");
  }
};