import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// 👇 Import service giả
import { mockService } from '../../core/services/mockApi'; 

const AuthForm = ({ role, type }) => {
  const isLogin = type === 'login';
  const navigate = useNavigate();
  
  // State quản lý UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State quản lý input
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Xóa lỗi khi người dùng nhập lại
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // 1. Xử lý Đăng Nhập
        const response = await mockService.login(formData.username, formData.password, role);
        console.log("Login thành công:", response);

        // Lưu thông tin user (Tạm thời dùng localStorage)
        localStorage.setItem('currentUser', JSON.stringify(response.user));

        // Chuyển hướng
        if (role === 'admin') navigate('/admin/dashboard');
        if (role === 'driver') navigate('/driver/trips');
        if (role === 'passenger') navigate('/passenger/dashboard');
      } else {
        // 2. Xử lý Đăng Ký (Chỉ cho Passenger)
        await mockService.register(formData);
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate('/passenger/login');
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình màu sắc nút bấm theo Role
  const btnColor = 
    role === 'driver' ? 'bg-green-600 hover:bg-green-700' : 
    role === 'admin' ? 'bg-purple-800 hover:bg-purple-900' : 
    'bg-blue-600 hover:bg-blue-700';

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      
      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center">
          ⚠️ {error}
        </div>
      )}

      {/* Chỉ hiện tên khi là Khách đang Đăng ký */}
      {!isLogin && role === 'passenger' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
          <input 
            name="fullName"
            type="text" 
            required
            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition" 
            placeholder="Nguyễn Văn A" 
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {role === 'passenger' ? 'Số điện thoại' : 'Tên đăng nhập'}
        </label>
        <input 
          name="username"
          type="text" 
          required
          className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition" 
          // Gợi ý placeholder tương ứng với Mock Data
          placeholder={role === 'passenger' ? "Ví dụ: khach" : "Ví dụ: taixe / admin"} 
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
        <input 
          name="password"
          type="password" 
          required
          className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition" 
          placeholder="Mật khẩu demo: 123" 
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <button 
        disabled={loading}
        className={`w-full py-3 mt-4 font-bold text-white rounded-lg shadow-md transition-all transform hover:scale-[1.02] ${btnColor} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Đang xử lý...
          </span>
        ) : (
          isLogin ? 'Đăng Nhập' : 'Đăng Ký'
        )}
      </button>

      {/* Footer của form */}
      <div className="text-center mt-4 text-sm text-gray-600">
        {role === 'passenger' ? (
          <>
            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <Link 
              to={isLogin ? '/passenger/register' : '/passenger/login'} 
              className="font-bold text-blue-600 hover:underline"
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
            </Link>
          </>
        ) : (
          <span className="italic opacity-70">
            *Tài khoản demo: admin/123 hoặc taixe/123
          </span>
        )}
      </div>
    </form>
  );
};

export default AuthForm;