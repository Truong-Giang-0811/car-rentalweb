import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ImagePlus, Send } from "lucide-react";
import toast from "react-hot-toast";
import CustomerHeader from "../components/CustomerHeader";
import Footer from "../components/Footer";
import api from "../services/api";

function CreatePost() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 detect admin hay user
  const isAdmin = location.pathname.startsWith("/admin");

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) {
      toast.error("Bài viết không được trống");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = null;

      // ✅ upload ảnh nếu có
      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const uploadRes = await api.post("/uploads/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = uploadRes.data?.url;
      }

      // ✅ tạo bài viết
      await api.post("/posts", {
        content,
        imageUrl,
      });

      toast.success("Đăng bài thành công");

      // 🔥 quay lại đúng chỗ
      if (isAdmin) {
        navigate("/admin/community");
      } else {
        navigate("/community");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Đăng bài thất bại");
    } finally {
      setLoading(false);
    }
  };

  const PageContent = (
    <div className="create-post-container">
      <style>{`
        .create-post-container {
          width: min(700px, 100%);
          margin: 0 auto;
          padding: 24px 0;
        }

        .create-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          padding: 20px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
        }

        .create-title {
          font-size: 1.4rem;
          font-weight: 900;
          margin-bottom: 16px;
        }

        .create-textarea {
          width: 100%;
          min-height: 120px;
          border: none;
          outline: none;
          resize: none;
          font-size: 1rem;
          background: #f9fafb;
          border-radius: 14px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .preview-img {
          width: 100%;
          border-radius: 14px;
          margin-top: 10px;
          max-height: 300px;
          object-fit: cover;
        }

        .create-actions {
          margin-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-upload {
          border: none;
          background: #f3f4f6;
          border-radius: 12px;
          padding: 10px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-submit {
          border: none;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #fff;
          border-radius: 12px;
          padding: 10px 18px;
          font-weight: 800;
          cursor: pointer;
        }

        .create-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }

        .btn-back {
            border: none;
            background: #f3f4f6;
            border-radius: 10px;
            padding: 8px 12px;
            font-weight: 700;
            cursor: pointer;
            transition: 0.2s;
        }

        .btn-back:hover {
            background: #e5e7eb;
        }

        .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
      `}</style>

      <div className="create-card">
        <div className="create-header">
            <button
            className="btn-back"
            onClick={() => navigate(-1)}
            >
            ← Quay lại
            </button>

            <div className="create-title">Tạo bài viết</div>
        </div>

        <textarea
          className="create-textarea"
          placeholder="Bạn đang nghĩ gì?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {preview && <img src={preview} alt="preview" className="preview-img" />}

        <div className="create-actions">
          <label className="btn-upload">
            <ImagePlus size={18} />
            <span>Ảnh</span>
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handlePickImage}
            />
          </label>

          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            <Send size={16} />
            {loading ? "Đang đăng..." : "Đăng bài"}
          </button>
        </div>
      </div>
    </div>
  );

  // 🔥 render theo role
  if (isAdmin) {
    return PageContent; // admin không cần header/footer
  }

  return (
    <>
      <CustomerHeader />
      {PageContent}
      <Footer />
    </>
  );
}

export default CreatePost;