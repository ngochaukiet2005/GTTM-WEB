// src/features/passenger/PassengerProfile.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { apiClient, getStoredTokens } from "../../core/apiClient";

const PassengerProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    gender: "male",
    avatar: "",
  });

  // 1. Load data khi vào trang
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!storedUser) {
      navigate("/passenger/login");
      return;
    }

    const tokens = getStoredTokens();
    if (!tokens?.accessToken) {
      navigate("/passenger/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await apiClient.getProfile(tokens.accessToken);
        const passenger = res.data?.passenger || {};
        setFormData({
          id: passenger._id || storedUser.id || "",
          fullName: passenger.name || storedUser.fullName || "",
          email: storedUser.email || "",
          phone: passenger.phone || storedUser.numberPhone || "",
          gender: storedUser.gender || "male",
          avatar: storedUser.avatar || "",
        });
        setPreviewImage(storedUser.avatar || null);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Không tải được hồ sơ",
          text: error.message,
          heightAuto: false,
        });
      }
    };

    loadProfile();
  }, [navigate]);

  // 2. Xử lý thay đổi input text
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Xử lý chọn ảnh từ máy
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo URL ảo để preview ảnh ngay lập tức
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      // Trong thực tế, bạn sẽ upload file lên server ở đây.
      // Với Mock, ta lưu tạm URL ảo này làm avatar.
      setFormData({ ...formData, avatar: imageUrl });
    }
  };

  // 4. Lưu thay đổi
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tokens = getStoredTokens();
      if (!tokens?.accessToken) {
        Swal.fire({
          icon: "warning",
          title: "Vui lòng đăng nhập",
          text: "Phiên đăng nhập đã hết hạn.",
          heightAuto: false,
        });
        navigate("/passenger/login");
        return;
      }

      const res = await apiClient.updateProfile({
        name: formData.fullName,
        phone: formData.phone,
        token: tokens.accessToken,
      });

      const storedUser = JSON.parse(localStorage.getItem("currentUser")) || {};
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...storedUser,
          fullName: res.data?.passenger?.name || formData.fullName,
          numberPhone: res.data?.passenger?.phone || formData.phone,
          avatar: formData.avatar,
        }),
      );

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Thông tin đã được cập nhật.",
        timer: 1500,
        showConfirmButton: false,
        heightAuto: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.message,
        heightAuto: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto md:max-w-2xl min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header Mobile */}
      <div className="bg-white p-4 sticky top-0 z-30 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h1>
      </div>

      <div className="p-4">
        {/* AVATAR UPLOAD SECTION */}
        <div className="flex flex-col items-center mb-8 mt-4">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200">
              <img
                src={
                  previewImage ||
                  "https://ui-avatars.com/api/?background=random"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Overlay Icon Camera */}
            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-2xl">📷</span>
            </div>
            {/* Badge edit mobile */}
            <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white border-2 border-white shadow-md md:hidden">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Chạm vào ảnh để thay đổi</p>
          {/* Input file ẩn */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {/* FORM */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Tên hiển thị (Editable) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              name="fullName"
              className="w-full text-lg font-semibold text-gray-800 outline-none border-b border-gray-200 focus:border-blue-500 py-1 transition-colors"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          {/* Giới tính (Editable) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Giới tính
            </label>
            <div className="flex gap-4">
              <label
                className={`flex-1 py-3 rounded-xl border cursor-pointer text-center text-sm font-bold transition-all ${formData.gender === "male" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  className="hidden"
                />
                Nam 👨
              </label>
              <label
                className={`flex-1 py-3 rounded-xl border cursor-pointer text-center text-sm font-bold transition-all ${formData.gender === "female" ? "border-pink-500 bg-pink-50 text-pink-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                  className="hidden"
                />
                Nữ 👩
              </label>
            </div>
          </div>

          {/* Email & Phone (READ ONLY) */}
          <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200 opacity-80">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔒</span>
              <p className="text-xs text-gray-500 font-medium">
                Thông tin định danh (Không thể sửa)
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Email
              </label>
              <input
                type="text"
                value={formData.email}
                disabled
                className="w-full bg-transparent font-medium text-gray-600 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                value={formData.phone}
                disabled
                className="w-full bg-transparent font-medium text-gray-600 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PassengerProfile;
