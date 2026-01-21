import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          GTTM <span className="text-blue-600">Auto Shuttle</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Hệ thống xe trung chuyển thông minh. Vui lòng chọn vai trò của bạn để tiếp tục.
        </p>
      </div>

      {/* Grid lựa chọn */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        
        {/* 1. KHÁCH HÀNG (Passenger) */}
        <Link 
          to="/passenger/login"
          className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-blue-500"
        >
          <div className="absolute top-4 right-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">
            🙋‍♂️
          </div>
          <div className="text-4xl mb-4 bg-blue-100 w-16 h-16 flex items-center justify-center rounded-full text-blue-600">
            🙋‍♂️
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
            Hành Khách
          </h2>
          <p className="text-gray-500">
            Đặt xe trung chuyển, theo dõi lộ trình và di chuyển dễ dàng.
          </p>
          <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
            Đăng nhập ngay &rarr;
          </div>
        </Link>

        {/* 2. TÀI XẾ (Driver) */}
        <Link 
          to="/driver/login"
          className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-green-600"
        >
          <div className="absolute top-4 right-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">
            🚖
          </div>
          <div className="text-4xl mb-4 bg-green-100 w-16 h-16 flex items-center justify-center rounded-full text-green-600">
            🚖
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
            Tài Xế
          </h2>
          <p className="text-gray-500">
            Nhận chuyến xe, xem lộ trình đón trả khách và quản lý công việc.
          </p>
          <div className="mt-6 flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
            Vào cổng tài xế &rarr;
          </div>
        </Link>

        {/* 3. QUẢN TRỊ VIÊN (Admin) */}
        <Link 
          to="/admin/login"
          className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-purple-800"
        >
          <div className="absolute top-4 right-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">
            👮‍♂️
          </div>
          <div className="text-4xl mb-4 bg-purple-100 w-16 h-16 flex items-center justify-center rounded-full text-purple-800">
            👮‍♂️
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-purple-800 transition-colors">
            Quản Trị Viên
          </h2>
          <p className="text-gray-500">
            Quản lý hệ thống, xem báo cáo thống kê và cấp quyền truy cập.
          </p>
          <div className="mt-6 flex items-center text-purple-800 font-semibold group-hover:translate-x-2 transition-transform">
            Truy cập quản lý &rarr;
          </div>
        </Link>

      </div>

      {/* Footer */}
      <div className="mt-12 text-gray-400 text-sm">
        © 2024 GTTM Auto Shuttle System. All rights reserved.
      </div>
    </div>
  );
};

export default LandingPage;