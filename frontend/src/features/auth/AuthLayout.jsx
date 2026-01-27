import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, bgColor = "bg-blue-600", imageMsg }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden bg-white min-h-[500px]">
        
        {/* Cột trái: Form nhập liệu */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          
          {/* Nút quay lại (Mới thêm) */}
          <button 
            onClick={() => navigate('/')} 
            className="absolute top-5 left-5 flex items-center text-gray-400 hover:text-gray-800 transition-colors group"
            title="Quay lại trang chủ"
            type="button"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2.5} 
              stroke="currentColor" 
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="ml-2 font-semibold text-sm">Quay lại</span>
          </button>

          <div className="mb-6 text-center mt-6">
            <h2 className="text-3xl font-extrabold text-gray-800">{title}</h2>
            <p className="text-gray-500 mt-2">{subtitle}</p>
          </div>
          {children}
        </div>

        {/* Cột phải: Banner (Ẩn trên mobile) */}
        <div className={`hidden md:flex md:w-1/2 ${bgColor} text-white flex-col justify-center items-center p-8 transition-colors duration-500`}>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight leading-tight">HỆ THỐNG ĐẶT XE TRUNG CHUYỂN</h1>
          <p className="text-lg text-center opacity-90">
            {imageMsg || "Hệ thống xe trung chuyển thông minh, kết nối mọi nẻo đường."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;