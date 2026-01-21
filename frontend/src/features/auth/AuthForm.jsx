import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AuthForm = ({ role, type }) => {
  const isLogin = type === 'login';
  const navigate = useNavigate();
  
  // State quản lý input
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Đang xử lý ${type} cho ${role}:`, formData);
    
    // Giả lập login thành công để chuyển hướng (Sau này sẽ gọi API ở đây)
    if (isLogin) {
      if (role === 'admin') navigate('/admin/dashboard');
      if (role === 'driver') navigate('/driver/trips');
      if (role === 'passenger') navigate('/passenger/home');
    }
  };

  // Cấu hình màu sắc nút bấm theo Role
  const btnColor = 
    role === 'driver' ? 'bg-green-600 hover:bg-green-700' : 
    role === 'admin' ? 'bg-purple-800 hover:bg-purple-900' : 
    'bg-blue-600 hover:bg-blue-700';

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
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
          placeholder={role === 'passenger' ? "0905xxxxxx" : "admin / driverID"} 
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
        <input 
          name="password"
          type="password" 
          required
          className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition" 
          placeholder="••••••••" 
          onChange={handleChange}
        />
      </div>

      <button className={`w-full py-3 mt-4 font-bold text-white rounded-lg shadow-md transition-all transform hover:scale-[1.02] ${btnColor}`}>
        {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
      </button>

      {/* Footer của form */}
      <div className="text-center mt-4 text-sm text-gray-600">
        {role === 'passenger' ? (
          // Logic cho Khách: Chuyển đổi Login <-> Register
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
          // Logic cho Admin/Driver: Chỉ thông báo
          <span className="italic opacity-70">
            *Tài khoản được cấp bởi Quản trị viên hệ thống.
          </span>
        )}
      </div>
    </form>
  );
};

export default AuthForm;