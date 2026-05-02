import { Heart, MessageCircle, MoreVertical, Send, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

function formatNumber(n) {
  if (n >= 1000) return `${Math.round(n / 100) / 10}k`;
  return `${n}`;
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
}

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function PostCard({
  item,
  isLoggedIn,
  comments,
  commentsOpen,
  commentsLoading,
  commentValue,
  commentSubmitting,
  onToggleLike,
  onToggleComments,
  onChangeCommentInput,
  onSubmitComment,
  onDeleteComment,
  onOpenMenu,
  onRequireLogin,
}) {
  const commentsRef = useRef(null);

  useEffect(() => {
    if (commentsRef.current) {
        commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  }, [comments]);
  return (
    <div className="community-post-card">
      <div className="community-post-header">
        <div className="community-post-header-left">
          <img
            src={item.userAvatar || "https://i.pravatar.cc/100?u=fallback"}
            alt={item.userName}
            className="community-post-avatar"
          />

          <div>
            <div className="community-post-name">{item.userName}</div>
            <div className="community-post-date">{formatDate(item.createdAt)}</div>
          </div>
        </div>

        {item.canDelete && (
          <button
            className="community-post-more-btn"
            type="button"
            onClick={() => onOpenMenu(item.id)}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {!!item.content && (
        <div className="community-post-text">{item.content}</div>
      )}

      {!!item.imageUrl && (
        <div className="community-post-image-wrap">
          <img
            src={item.imageUrl}
            alt="post"
            className="community-post-image"
          />
        </div>
      )}

      <div className="community-post-meta-row">
        <div className="community-post-meta-left">
          Liked by {formatNumber(item.likedCount || 0)} people
        </div>

        <button
          className="community-post-meta-bubble"
          type="button"
          onClick={() => onToggleComments(item.id)}
        >
          {item.commentCount || 0} responses
        </button>
      </div>

      <div className="community-post-actions">
        <button
          className="community-post-action-btn"
          type="button"
          onClick={() => onToggleLike(item.id)}
        >
          <Heart
            size={21}
            color={item.isLiked ? "#ef4444" : "#111827"}
            fill={item.isLiked ? "#ef4444" : "transparent"}
          />
        </button>

        <button
          className="community-post-action-btn"
          type="button"
          onClick={() => onToggleComments(item.id)}
        >
          <MessageCircle size={21} />
        </button>
      </div>

      {commentsOpen && (
        <div className="community-comments-wrap">
          <div className="community-comments-list" ref={commentsRef}>
            {commentsLoading ? (
              <div className="community-comments-loading">
                Đang tải bình luận...
              </div>
            ) : comments.length === 0 ? (
              <div className="community-comments-empty">
                Chưa có bình luận nào.
              </div>
            ) : (
              comments.map((comment) => (
                <div className="community-comment-item" key={comment.id}>
                  <img
                    src={comment.userAvatar || "https://i.pravatar.cc/100?u=fallback"}
                    alt={comment.userName}
                    className="community-comment-avatar"
                  />

                  <div className="community-comment-main">
                    <div className="community-comment-bubble">
                      <div className="community-comment-name">{comment.userName}</div>
                      <div className="community-comment-content">{comment.content}</div>
                    </div>

                    <div className="community-comment-meta">
                      <span>{formatDateTime(comment.createdAt)}</span>

                      {comment.canDelete && (
                        <button
                          type="button"
                          className="community-comment-delete"
                          onClick={() => onDeleteComment(item.id, comment.id)}
                        >
                          <Trash2 size={14} />
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="community-comment-input-row">
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="me"
              className="community-comment-avatar"
            />

            <div className="community-comment-input-box">
              <input
                type="text"
                placeholder={
                  isLoggedIn ? "Viết bình luận..." : "Đăng nhập để bình luận..."
                }
                value={commentValue}
                onChange={(e) => onChangeCommentInput(item.id, e.target.value)}
                onFocus={() => {
                  if (!isLoggedIn) onRequireLogin();
                }}
              />

              <button
                type="button"
                onClick={() => onSubmitComment(item.id)}
                disabled={commentSubmitting}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;