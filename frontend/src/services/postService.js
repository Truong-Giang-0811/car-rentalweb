import api from "./api";

export const getPosts = async ({ skip = 0, take = 20 } = {}) => {
  try {
    const response = await api.get(`/posts?skip=${skip}&take=${take}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không tải được bài viết");
  }
};

export const createPost = async (payload) => {
  try {
    const response = await api.post("/posts", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Đăng bài thất bại");
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Xóa bài viết thất bại");
  }
};

export const toggleLike = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Thả tim thất bại");
  }
};

export const getComments = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không tải được bình luận");
  }
};

export const addComment = async (postId, payload) => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Bình luận thất bại");
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/posts/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Xóa bình luận thất bại");
  }
};

export const uploadPostImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.url;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Upload ảnh thất bại");
  }
};