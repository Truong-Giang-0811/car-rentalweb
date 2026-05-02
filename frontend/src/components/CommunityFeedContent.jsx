import { useEffect, useState } from "react";
import { ImagePlus, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PostCard from "./PostCard";
import {
  addComment,
  deleteComment,
  getComments,
  deletePost,
  getPosts,
  toggleLike,
} from "../services/postService";
import toast from "react-hot-toast";

function CommunityFeedContent({ adminView = false }) {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [postComments, setPostComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const requireLogin = () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
      return false;
    }
    return true;
  };

  const createPostPath = adminView ? "/admin/community/create" : "/community/create";

  const loadPosts = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await getPosts({ skip: 0, take: 20 });
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Không tải được bài viết");
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCommentsByPost = async (postId) => {
    try {
      setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
      const data = await getComments(postId);

      setPostComments((prev) => ({
        ...prev,
        [postId]: Array.isArray(data) ? data : [],
      }));
    } catch (error) {
      toast.error(error.message || "Không tải được bình luận");
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleToggleLike = async (postId) => {
    if (!requireLogin()) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !p.isLiked;
        return {
          ...p,
          isLiked: nextLiked,
          likedCount: Math.max(0, (p.likedCount || 0) + (nextLiked ? 1 : -1)),
        };
      })
    );

    try {
      await toggleLike(postId);
    } catch (error) {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const rollbackLiked = !p.isLiked;
          return {
            ...p,
            isLiked: rollbackLiked,
            likedCount: Math.max(
              0,
              (p.likedCount || 0) + (rollbackLiked ? 1 : -1)
            ),
          };
        })
      );

      toast.error(error.message || "Không tym được bài viết");
    }
  };

  const handleChangeCommentInput = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleToggleComments = async (postId) => {
    const isOpen = !!openComments[postId];

    setOpenComments((prev) => ({
      ...prev,
      [postId]: !isOpen,
    }));

    if (!isOpen && !postComments[postId]) {
      await loadCommentsByPost(postId);
    }
  };

  const handleSubmitComment = async (postId) => {
    if (!requireLogin()) return;

    const value = commentInputs[postId] || "";
    if (!value.trim()) {
      toast.error("Nội dung bình luận không được trống");
      return;
    }

    try {
      setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));

      await addComment(postId, { content: value.trim() });

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));

      await loadCommentsByPost(postId);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, commentCount: (p.commentCount || 0) + 1 }
            : p
        )
      );
    } catch (error) {
      toast.error(error.message || "Bình luận thất bại");
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = (postId, commentId) => {
    toast((t) => (
      <div style={{ minWidth: "260px" }}>
        <div style={{ marginBottom: "10px", fontWeight: 600 }}>
          Bạn có chắc muốn xoá bình luận?
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Hủy
          </button>

          <button
            onClick={async () => {
              toast.dismiss(t.id);

              try {
                await deleteComment(commentId);

                setPostComments((prev) => ({
                  ...prev,
                  [postId]: (prev[postId] || []).filter(
                    (item) => item.id !== commentId
                  ),
                }));

                setPosts((prev) =>
                  prev.map((p) =>
                    p.id === postId
                      ? {
                          ...p,
                          commentCount: Math.max(
                            0,
                            (p.commentCount || 0) - 1
                          ),
                        }
                      : p
                  )
                );

                toast.success("Đã xoá bình luận");
              } catch (error) {
                toast.error(error.message || "Không xoá được bình luận");
              }
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "none",
              background: "#ef4444",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Xóa
          </button>
        </div>
      </div>
    ));
  };

  const handleOpenMenu = (postId) => {
    toast((t) => (
      <div style={{ minWidth: "260px" }}>
        <p style={{ marginBottom: "10px", fontWeight: 600 }}>
          Bạn có chắc muốn xoá bài viết?
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Hủy
          </button>

          <button
            onClick={async () => {
              toast.dismiss(t.id);

              try {
                await deletePost(postId);
                setPosts((prev) => prev.filter((p) => p.id !== postId));
                toast.success("Đã xoá bài viết");
              } catch (error) {
                toast.error(error.message || "Không xoá được bài viết");
              }
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "none",
              background: "#ef4444",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Xóa
          </button>
        </div>
      </div>
    ));
  };

  return (
    <>
      <style>{`
        .community-page {
          min-height: 100vh;
          background: #ffffff;
        }

        .page-container {
          width: min(1100px, calc(100% - 120px));
          margin: 0 auto;
        }

        .community-section {
          padding: 28px 0 70px;
        }

        .community-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .community-title {
          font-size: 2rem;
          font-weight: 900;
          color: #111827;
          margin: 0;
        }

        .community-topbar-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .community-refresh-btn,
        .community-create-btn {
          height: 44px;
          border: none;
          border-radius: 14px;
          padding: 0 16px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .community-refresh-btn {
          background: #f3f4f6;
          color: #111827;
        }

        .community-create-btn {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #fff;
        }

        .community-composer {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 14px;
          margin-bottom: 18px;
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
        }

        .community-composer-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          background: #eee;
          flex-shrink: 0;
        }

        .community-composer-fake-input {
          flex: 1;
          min-height: 46px;
          border: none;
          border-radius: 14px;
          background: #f3f4f6;
          color: #6b7280;
          padding: 0 14px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
        }

        .community-composer-icon-btn {
          width: 46px;
          height: 46px;
          border: none;
          border-radius: 14px;
          background: #f3f4f6;
          display: grid;
          place-items: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .community-feed-list {
          display: grid;
          gap: 16px;
        }

        .community-post-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 16px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
        }

        .community-post-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .community-post-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .community-post-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          background: #eee;
          flex-shrink: 0;
        }

        .community-post-name {
          font-size: 1rem;
          font-weight: 900;
          color: #111827;
        }

        .community-post-date {
          margin-top: 2px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #6b7280;
        }

        .community-post-more-btn {
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 12px;
          background: #f3f4f6;
          display: grid;
          place-items: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .community-post-text {
          margin-top: 12px;
          color: #111827;
          font-size: 0.96rem;
          line-height: 1.7;
          white-space: pre-wrap;
        }

        .community-post-image-wrap {
          margin-top: 14px;
          border-radius: 18px;
          overflow: hidden;
          background: #e5e7eb;
        }

        .community-post-image {
          width: 100%;
          max-height: 420px;
          object-fit: cover;
          display: block;
        }

        .community-post-meta-row {
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .community-post-meta-left {
          font-size: 0.83rem;
          font-weight: 600;
          color: #6b7280;
        }

        .community-post-meta-bubble {
          border: none;
          padding: 7px 12px;
          border-radius: 999px;
          background: #f3f4f6;
          font-size: 0.82rem;
          font-weight: 800;
          color: #111827;
          cursor: pointer;
        }

        .community-post-actions {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .community-post-action-btn {
          width: 44px;
          height: 36px;
          border: none;
          border-radius: 12px;
          background: #fff;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .community-loading,
        .community-empty {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 50px 20px;
          text-align: center;
          color: #6b7280;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
        }

        .community-comments-wrap {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #eef2f7;
          position: relative;
        }

        .community-comments-wrap::after {
          content: "";
          position: absolute;
          bottom: 60px;
          left: 0;
          right: 0;
          height: 30px;
          background: linear-gradient(to bottom, transparent, #fff);
          pointer-events: none;
        }

        .community-post-delete-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: #fef2f2;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #dc2626;
          transition: 0.2s;
        }

        .community-post-delete-btn:hover {
          background: #fee2e2;
          transform: scale(1.05);
        }

        .community-comments-list {
          display: grid;
          gap: 12px;
          margin-bottom: 14px;
          max-height: 220px;
          overflow-y: auto;
          padding-right: 6px;
        }

        .community-comments-list::-webkit-scrollbar {
          width: 6px;
        }

        .community-comments-list::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 999px;
        }

        .community-comments-list::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .community-comments-loading,
        .community-comments-empty {
          color: #6b7280;
          font-size: 0.92rem;
        }

        .community-comment-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .community-comment-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          background: #eee;
          flex-shrink: 0;
        }

        .community-comment-main {
          min-width: 0;
          flex: 1;
        }

        .community-comment-bubble {
          background: #f3f4f6;
          border-radius: 18px;
          padding: 10px 12px;
        }

        .community-comment-name {
          font-size: 0.9rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 4px;
        }

        .community-comment-content {
          color: #374151;
          font-size: 0.92rem;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .community-comment-meta {
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding-left: 8px;
          font-size: 0.8rem;
          color: #6b7280;
        }

        .community-comment-delete {
          border: none;
          background: transparent;
          color: #6b7280;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          padding: 0;
        }

        .community-comment-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .community-comment-input-box {
          flex: 1;
          min-height: 44px;
          background: #f3f4f6;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 8px 0 14px;
        }

        .community-comment-input-box input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          height: 44px;
          font-size: 0.94rem;
        }

        .community-comment-input-box button {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 50%;
          background: transparent;
          display: grid;
          place-items: center;
          cursor: pointer;
          color: #6b7280;
        }

        .community-comment-input-box button:hover {
          background: #e5e7eb;
        }

        @media (max-width: 767.98px) {
          .page-container {
            width: calc(100% - 24px);
          }

          .community-topbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .community-topbar-actions {
            width: 100%;
          }

          .community-refresh-btn,
          .community-create-btn {
            flex: 1;
            justify-content: center;
          }

          .community-composer {
            align-items: stretch;
          }

          .community-composer-icon-btn {
            width: 44px;
            height: 44px;
          }
        }
      `}</style>

      <section className="community-section">
        <div className="page-container">
          <div className="community-topbar">
            <h1 className="community-title">Cộng đồng</h1>

            <div className="community-topbar-actions">
              <button
                className="community-refresh-btn"
                type="button"
                onClick={() => loadPosts(true)}
                disabled={refreshing}
              >
                <RefreshCw size={18} />
                <span>{refreshing ? "Đang tải..." : "Làm mới"}</span>
              </button>

              <button
                className="community-create-btn"
                type="button"
                onClick={() => {
                  if (!requireLogin()) return;
                  navigate(createPostPath);
                }}
              >
                <Plus size={18} />
                <span>Tạo bài viết</span>
              </button>
            </div>
          </div>

          <div className="community-composer">
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="avatar"
              className="community-composer-avatar"
            />

            <button
              className="community-composer-fake-input"
              type="button"
              onClick={() => {
                if (!requireLogin()) return;
                navigate(createPostPath);
              }}
            >
              Bạn đang nghĩ gì?
            </button>

            <button
              className="community-composer-icon-btn"
              type="button"
              onClick={() => {
                if (!requireLogin()) return;
                navigate(createPostPath);
              }}
            >
              <ImagePlus size={20} />
            </button>
          </div>

          {loading ? (
            <div className="community-loading">Đang tải bài viết...</div>
          ) : posts.length === 0 ? (
            <div className="community-empty">
              Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ điều gì đó.
            </div>
          ) : (
            <div className="community-feed-list">
              {posts.map((item) => (
                <PostCard
                  key={item.id}
                  item={item}
                  isLoggedIn={isLoggedIn}
                  comments={postComments[item.id] || []}
                  commentsOpen={!!openComments[item.id]}
                  commentsLoading={!!commentsLoading[item.id]}
                  commentValue={commentInputs[item.id] || ""}
                  commentSubmitting={!!commentSubmitting[item.id]}
                  onToggleLike={handleToggleLike}
                  onToggleComments={handleToggleComments}
                  onChangeCommentInput={handleChangeCommentInput}
                  onSubmitComment={handleSubmitComment}
                  onDeleteComment={handleDeleteComment}
                  onOpenMenu={handleOpenMenu}
                  onRequireLogin={requireLogin}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default CommunityFeedContent;