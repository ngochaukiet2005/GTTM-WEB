import React from 'react';

const AuthLayout = ({ children, title, subtitle, bgColor = "bg-blue-600", imageMsg }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden bg-white min-h-[500px]">
        
        {/* Cột trái: Form nhập liệu */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-extrabold text-gray-800">{title}</h2>
            <p className="text-gray-500 mt-2">{subtitle}</p>
          </div>
          {children}
        </div>

        {/* Cột phải: Banner (Ẩn trên mobile) */}
        <div className={`hidden md:flex md:w-1/2 ${bgColor} text-white flex-col justify-center items-center p-8 transition-colors duration-500`}>
          <h1 className="text-4xl font-bold mb-4">GTTM Auto Shuttle</h1>
          <p className="text-lg text-center opacity-90">
            {imageMsg || "Hệ thống xe trung chuyển thông minh, kết nối mọi nẻo đường."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;