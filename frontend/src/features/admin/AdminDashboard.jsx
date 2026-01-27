import React, { useState, useEffect } from 'react';

// Component con: Card thống kê (KPIs)
const StatCard = ({ title, value, change, changeType, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      <div className={`flex items-center mt-2 text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-500'}`}>
        <span className="font-medium">{change}</span>
        <span className="text-gray-400 ml-1">so với hôm qua</span>
      </div>
    </div>
    <div className={`p-3 rounded-xl ${color} text-white`}>
      {icon}
    </div>
  </div>
);

// Component con: Biểu đồ thanh đơn giản (Dùng CSS thuần để không phải cài thư viện chart)
const BarChart = () => {
  const data = [40, 65, 34, 85, 55, 70, 90]; // Mock data cho 7 ngày
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 text-lg">Thống kê chuyến đi tuần này</h3>
        <button className="text-sm text-blue-600 font-medium hover:underline">Chi tiết</button>
      </div>
      <div className="flex items-end justify-between h-48 gap-2">
        {data.map((height, index) => (
          <div key={index} className="flex flex-col items-center w-full group cursor-pointer">
            <div className="relative w-full flex items-end justify-center h-40 bg-gray-50 rounded-lg overflow-hidden">
               {/* Tooltip on hover */}
               <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded mb-1">
                 {height} chuyến
               </div>
               {/* Bar */}
              <div 
                style={{ height: `${height}%` }} 
                className={`w-2/3 rounded-t-md transition-all duration-500 ${index === 6 ? 'bg-blue-600' : 'bg-blue-200 group-hover:bg-blue-400'}`}
              ></div>
            </div>
            <span className="text-xs text-gray-500 mt-3 font-medium">{days[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Component con: Hoạt động gần đây (Timeline đơn giản)
const RecentActivity = () => {
  const activities = [
    { text: "Tài xế Nguyễn Văn A vừa hoàn thành chuyến đi #Trip209", time: "5 phút trước", type: "success" },
    { text: "Có phản hồi mới từ hành khách Trần Thị B", time: "15 phút trước", type: "info" },
    { text: "Tài xế Lê Văn C đăng ký mới chờ duyệt", time: "1 giờ trước", type: "warning" },
    { text: "Hệ thống tự động sao lưu dữ liệu", time: "3 giờ trước", type: "system" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <h3 className="font-bold text-gray-800 text-lg mb-4">Hoạt động gần đây</h3>
      <div className="space-y-6">
        {activities.map((act, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${
                act.type === 'success' ? 'bg-green-500' : 
                act.type === 'info' ? 'bg-blue-500' : 
                act.type === 'warning' ? 'bg-yellow-500' : 'bg-gray-400'
              }`}></div>
              {idx !== activities.length - 1 && <div className="w-0.5 h-full bg-gray-100 my-1"></div>}
            </div>
            <div>
              <p className="text-gray-800 text-sm font-medium">{act.text}</p>
              <p className="text-gray-400 text-xs mt-1">{act.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  // SVG Icons
  const icons = {
    trip: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    user: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    star: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    car: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> // Dùng tạm icon switch cho "Active Trip"
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Tổng quan</h1>
          <p className="text-gray-500 mt-1">Xin chào Admin, đây là tình hình hoạt động hôm nay.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2">
          <span>Tải báo cáo</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>
      </div>

      {/* Stats Grid - 4 Cột */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng chuyến đi" 
          value="1,245" 
          change="+12.5%" 
          changeType="increase" 
          icon={icons.trip} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Tài xế Online" 
          value="42" 
          change="-2" 
          changeType="decrease" 
          icon={icons.user} 
          color="bg-purple-500"
        />
        <StatCard 
          title="Điểm đánh giá TB" 
          value="4.8" 
          change="+0.2" 
          changeType="increase" 
          icon={icons.star} 
          color="bg-yellow-500"
        />
        <StatCard 
          title="Chuyến đang chạy" 
          value="8" 
          change="+3" 
          changeType="increase" 
          icon={icons.car} 
          color="bg-green-500"
        />
      </div>

      {/* Chart & Activity Grid - Chia tỉ lệ 2:1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-96">
        <div className="lg:col-span-2 h-full">
          <BarChart />
        </div>
        <div className="lg:col-span-1 h-full">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;