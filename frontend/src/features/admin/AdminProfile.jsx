// src/features/admin/AdminProfile.jsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getStoredTokens } from '../../core/apiClient';

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    avatar: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load dữ liệu khi vào trang
  useEffect(() => {
    const user = getStoredTokens()?.user;
    if (user) {
      setProfile({
        name: user.fullName || '',
        email: user.email || '',
        phone: user.numberPhone || '',
        role: user.role || 'ADMIN',
        avatar: user.avatar || 'https://via.placeholder.com/150'
      });
    }
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await mockApiAdmin.updateProfile(profile);
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Thông tin tài khoản đã được cập nhật!',
        timer: 1500,
        showConfirmButton: false
      });
      setIsEditing(false);
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể cập nhật thông tin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Hồ sơ tài khoản</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột trái: Avatar & Role */}
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
          <div className="relative group cursor-pointer">
            <img 
              src={profile.avatar || 'https://via.placeholder.com/150'} 
              alt="Avatar" 
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-50"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Đổi ảnh
              </div>
            )}
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-800">{profile.name}</h3>
          <p className="text-slate-500 text-sm">{profile.email}</p>
          <span className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
            {profile.role}
          </span>
        </div>

        {/* Cột phải: Form thông tin */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-700">Thông tin chi tiết</h3>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
              >
                ✏️ Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                 <button 
                  onClick={() => setIsEditing(false)}
                  className="text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            )}
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Họ và tên</label>
                <input 
                  type="text" 
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Số điện thoại</label>
                <input 
                  type="text" 
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
              <input 
                type="email" 
                name="email"
                value={profile.email}
                disabled={true} // Email thường không cho sửa
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Phần đổi mật khẩu (chỉ hiện khi edit) */}
            {isEditing && (
              <div className="pt-4 border-t border-slate-100 mt-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3">Đổi mật khẩu</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <input type="password" placeholder="Mật khẩu mới" className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                   <input type="password" placeholder="Xác nhận mật khẩu" className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;