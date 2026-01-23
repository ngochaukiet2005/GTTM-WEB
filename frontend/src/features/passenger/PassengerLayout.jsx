import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const PassengerLayout = () => {
  const location = useLocation();

  // Hàm kiểm tra active menu để tô màu
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* 1. SIDEBAR (Desktop) / TOPBAR (Mobile) */}
      <aside className="bg-white md:w-64 border-b md:border-r border-gray-200 shadow-sm z-20 flex-shrink-0">
        <div className="p-4 md:p-6 flex md:block justify-between items-center">
          {/* Logo */}
          <div className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tighter">
            HỆ THỐNG ĐẶT XE TRUNG CHUYỂN <span className="text-blue-600">KHÁCH HÀNG</span>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:block mt-8 space-y-2">
            <NavItem to="/passenger/dashboard" icon="🏠" label="Tổng quan" active={isActive('/passenger/dashboard')} />
            <NavItem to="/passenger/booking" icon="🚖" label="Đặt xe mới" active={isActive('/passenger/booking')} />
            <NavItem to="/passenger/history" icon="📜" label="Lịch sử chuyến" active={isActive('/passenger/history')} />
            <NavItem to="/passenger/profile" icon="👤" label="Tài khoản" active={isActive('/passenger/profile')} />
          </nav>

          {/* Nút Menu Mobile (Icon Hamburger - Ta làm đơn giản trước) */}
          <div className="md:hidden text-gray-500">
            Menu
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 relative">
        {/* Nơi nội dung các trang con sẽ hiển thị */}
        <Outlet />
      </main>

      {/* 3. BOTTOM NAVIGATION (Chỉ hiện trên Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-30 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <MobileNavItem to="/passenger/dashboard" icon="🏠" label="Trang chủ" active={isActive('/passenger/dashboard')} />
        <MobileNavItem to="/passenger/booking" icon="🚖" label="Đặt xe" active={isActive('/passenger/booking')} />
        <MobileNavItem to="/passenger/history" icon="📜" label="Lịch sử" active={isActive('/passenger/history')} />
        <MobileNavItem to="/passenger/profile" icon="👤" label="Tôi" active={isActive('/passenger/profile')} />
      </div>
    </div>
  );
};

// Component phụ cho Menu Item (Desktop)
const NavItem = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
      active 
        ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <span className="text-xl">{icon}</span>
    {label}
  </Link>
);

// Component phụ cho Menu Item (Mobile)
const MobileNavItem = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-gray-400'}`}>
    <span className="text-2xl">{icon}</span>
    <span className="text-[10px] font-bold">{label}</span>
  </Link>
);

export default PassengerLayout;