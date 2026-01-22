// src/features/auth/AuthForm.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockService } from '../../core/services/mockApi'; 

const AuthForm = ({ role, type }) => {
  const isLogin = type === 'login';
  const navigate = useNavigate();
  
  // State quản lý UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State quản lý input
  const [formData, setFormData] = useState({
    username: '',        // Dùng cho Login (Email/Phone/Username)
    password: '',
    fullName: '',
    email: '',           // Mới: Cho đăng ký
    phone: '',           // Mới: Cho đăng ký
    gender: 'male',      // Mới: Mặc định nam
    confirmPassword: ''  // Mới: Xác nhận mật khẩu
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // --- 1. XỬ LÝ ĐĂNG NHẬP ---
        const response = await mockService.login(formData.username, formData.password, role);
        console.log("Login thành công:", response);

        localStorage.setItem('currentUser', JSON.stringify(response.user));

        if (role === 'admin') navigate('/admin/dashboard');
        if (role === 'driver') navigate('/driver/trips');
        if (role === 'passenger') navigate('/passenger/dashboard');
      } else {
        // --- 2. XỬ LÝ ĐĂNG KÝ (CHỈ PASSENGER) ---
        
        // Kiểm tra mật khẩu khớp
        if (formData.password !== formData.confirmPassword) {
            throw new Error("Mật khẩu xác nhận không khớp!");
        }
        // Kiểm tra độ dài sđt cơ bản
        if (role === 'passenger' && formData.phone.length < 9) {
            throw new Error("Số điện thoại không hợp lệ!");
        }

        // Gọi API
        await mockService.register({
            username: formData.email, // Dùng email làm định danh chính (hoặc có thể bỏ nếu backend tự sinh)
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            gender: formData.gender,
            role: role
        });
        
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate('/passenger/login');
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const btnColor = 
    role === 'driver' ? 'bg-green-600 hover:bg-green-700' : 
    role === 'admin' ? 'bg-purple-800 hover:bg-purple-900' : 
    'bg-blue-600 hover:bg-blue-700';

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center">
          ⚠️ {error}
        </div>
      )}

      {/* --- CÁC TRƯỜNG ĐĂNG KÝ (CHỈ HIỆN KHI !ISLOGIN & PASSENGER) --- */}
      {!isLogin && role === 'passenger' && (
        <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
              <input 
                name="fullName"
                type="text" 
                required
                className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" 
                placeholder="Nguyễn Văn A" 
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                        name="email"
                        type="email" 
                        required
                        className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" 
                        placeholder="email@vidu.com" 
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">SĐT</label>
                    <input 
                        name="phone"
                        type="tel" 
                        required
                        className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" 
                        placeholder="090..." 
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                 <div className="flex gap-4">
                    <label className={`flex-1 py-2 rounded-lg border cursor-pointer text-center text-sm font-bold ${formData.gender === 'male' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
                        <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} className="hidden" />
                        Nam 👨
                    </label>
                    <label className={`flex-1 py-2 rounded-lg border cursor-pointer text-center text-sm font-bold ${formData.gender === 'female' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 text-gray-500'}`}>
                        <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} className="hidden" />
                        Nữ 👩
                    </label>
                 </div>
            </div>
        </>
      )}
      
      {/* --- TRƯỜNG TÊN ĐĂNG NHẬP / EMAIL (CHUNG) --- */}
      {/* Nếu là Đăng Ký Passenger thì trường này ẩn đi vì đã có Email/Phone ở trên */}
      {(isLogin || role !== 'passenger') && (
        <div>
            <label className="block text-sm font-medium text-gray-700">
            {role === 'passenger' ? 'Email hoặc Số điện thoại' : 'Tên đăng nhập'}
            </label>
            <input 
            name="username"
            type="text" 
            required
            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" 
            placeholder={role === 'passenger' ? "VD: 0905... hoặc abc@gmail.com" : "Ví dụ: admin"} 
            onChange={handleChange}
            />
        </div>
      )}

      {/* --- MẬT KHẨU (CHUNG) --- */}
      <div className={!isLogin && role === 'passenger' ? "grid grid-cols-2 gap-4" : ""}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input 
                name="password"
                type="password" 
                required
                className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" 
                placeholder="••••••" 
                onChange={handleChange}
            />
          </div>
          
          {/* Nhập lại mật khẩu (Chỉ khi đăng ký Passenger) */}
          {!isLogin && role === 'passenger' && (
             <div>
                <label className="block text-sm font-medium text-gray-700">Xác nhận MK</label>
                <input 
                    name="confirmPassword"
                    type="password" 
                    required
                    className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" 
                    placeholder="••••••" 
                    onChange={handleChange}
                />
             </div>
          )}
      </div>

      <button 
        disabled={loading}
        className={`w-full py-3 mt-4 font-bold text-white rounded-lg shadow-md transition-all transform hover:scale-[1.02] ${btnColor} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Đăng Ký')}
      </button>

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
            *Demo: admin/123 hoặc taixe/123
          </span>
        )}
      </div>
    </form>
  );
};

export default AuthForm;