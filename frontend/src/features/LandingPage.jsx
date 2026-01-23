import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col justify-center p-6 md:items-center">
      
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in-down">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-blue-200 rotate-3">
             <span className="text-4xl">🚌</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
          HỆ THỐNG ĐẶT XE <span className="text-blue-600">TRUNG CHUYỂN</span>
        </h1>
        <p className="text-gray-500 text-sm md:text-lg max-w-md mx-auto">
          Hệ thống đặt xe trung chuyển thông minh miễn phí.
        </p>
      </div>

      {/* Mobile Stack Layout: Các nút xếp dọc trên mobile, ngang trên tablet */}
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 w-full max-w-4xl">
        
        {/* 1. KHÁCH HÀNG */}
        <Link to="/passenger/login" className="group flex items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all active:scale-[0.98]">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">🙋‍♂️</div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">Hành Khách</h2>
            <p className="text-xs text-gray-400">Đặt xe, xem lịch trình</p>
          </div>
          <div className="text-gray-300 group-hover:text-blue-600">➔</div>
        </Link>

        {/* 2. TÀI XẾ */}
        <Link to="/driver/login" className="group flex items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-green-500 hover:shadow-md transition-all active:scale-[0.98]">
          <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-2xl mr-4 group-hover:bg-green-600 group-hover:text-white transition-colors">🚖</div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">Tài Xế</h2>
            <p className="text-xs text-gray-400">Nhận chuyến, dẫn đường</p>
          </div>
          <div className="text-gray-300 group-hover:text-green-600">➔</div>
        </Link>

        {/* 3. ADMIN */}
        <Link to="/admin/login" className="group flex items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-purple-600 hover:shadow-md transition-all active:scale-[0.98]">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mr-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">👮‍♂️</div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">Quản Trị</h2>
            <p className="text-xs text-gray-400">Thống kê, quản lý</p>
          </div>
          <div className="text-gray-300 group-hover:text-purple-600">➔</div>
        </Link>

      </div>
      
      <div className="mt-12 text-center text-xs text-gray-400">
        © Nhóm 3 - Hệ thống đặt xe trung chuyển thông minh 
      </div>
    </div>
  );
};

export default LandingPage;