import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";
import toast from "react-hot-toast";

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

function getTypeLabel(type) {
  switch (type) {
    case 10:
      return "📄";
    case 11:
      return "✅";
    case 12:
      return "❌";
    case 13:
      return "🚫";
    case 20:
      return "❤️";
    case 21:
      return "💬";
    case 30:
      return "✉️";
    default:
      return "🔔";
  }
}

function NotificationBell() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const wrapRef = useRef(null);

  const loadUnreadCount = async () => {
    if (!token) return;
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error(error);
    }
  };

  const loadNotifications = async () => {
    if (!token) return;
    try {
      const data = await getNotifications(15);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được thông báo");
    }
  };

  useEffect(() => {
    loadUnreadCount();
  }, [token]);

  useEffect(() => {
    if (!open) return;
    loadNotifications();
    loadUnreadCount();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickNotification = async (item) => {
    try {
      if (!item.isRead) {
        await markNotificationAsRead(item.id);
      }

      setNotifications((prev) =>
        prev.map((x) =>
          x.id === item.id ? { ...x, isRead: true } : x
        )
      );

      if (!item.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setOpen(false);

      if (item.actionUrl) {
        navigate(item.actionUrl);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không xử lý được thông báo");
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((x) => ({ ...x, isRead: true }))
      );
      setUnreadCount(0);

      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      console.error(error);
      toast.error("Không thể đánh dấu tất cả");
    }
  };

  if (!token) return null;

  return (
    <>
      <style>{`
        .notification-bell-wrap {
          position: relative;
        }

        .notification-bell-btn {
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 12px;
          background: #f3f4f6;
          display: grid;
          place-items: center;
          cursor: pointer;
          position: relative;
        }

        .notification-bell-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #ef4444;
          color: #fff;
          font-size: 0.72rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
        }

        .notification-dropdown {
          position: absolute;
          top: 50px;
          right: 0;
          width: 360px;
          max-height: 460px;
          overflow: hidden;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
          z-index: 999;
        }

        .notification-dropdown-head {
          padding: 14px 16px;
          border-bottom: 1px solid #eef2f7;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .notification-dropdown-title {
          font-size: 1rem;
          font-weight: 900;
          color: #111827;
        }

        .notification-read-all {
          border: none;
          background: transparent;
          color: #16a34a;
          font-weight: 800;
          cursor: pointer;
        }

        .notification-list {
          max-height: 390px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 14px 16px;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          background: #fff;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .notification-item.unread {
          background: #f0fdf4;
        }

        .notification-item:hover {
          background: #f9fafb;
        }

        .notification-item-icon {
          font-size: 1.1rem;
          line-height: 1.2;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notification-item-main {
          min-width: 0;
          flex: 1;
        }

        .notification-item-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 4px;
        }

        .notification-item-body {
          font-size: 0.9rem;
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 6px;
        }

        .notification-item-time {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .notification-empty {
          padding: 28px 16px;
          text-align: center;
          color: #6b7280;
        }
      `}</style>

      <div className="notification-bell-wrap" ref={wrapRef}>
        <button
          className="notification-bell-btn"
          type="button"
          onClick={() => setOpen((prev) => !prev)}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="notification-bell-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="notification-dropdown">
            <div className="notification-dropdown-head">
              <div className="notification-dropdown-title">Thông báo</div>
              {notifications.length > 0 && (
                <button
                  className="notification-read-all"
                  type="button"
                  onClick={handleReadAll}
                >
                  Đọc tất cả
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  Chưa có thông báo nào
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`notification-item ${!item.isRead ? "unread" : ""}`}
                    onClick={() => handleClickNotification(item)}
                  >
                    <div className="notification-item-icon">
                      {getTypeLabel(item.type)}
                    </div>

                    <div className="notification-item-main">
                      <div className="notification-item-title">{item.title}</div>
                      <div className="notification-item-body">{item.body}</div>
                      <div className="notification-item-time">
                        {formatTime(item.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default NotificationBell;