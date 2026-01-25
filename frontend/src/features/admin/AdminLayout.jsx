// src/features/admin/AdminLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'Đăng xuất?',
      text: "Bạn sẽ thoát khỏi hệ thống quản trị.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/admin/login');
      }
    });
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Quản lý Chuyến xe', path: '/admin/trips', icon: '🚗' },
    { name: 'Quản lý Tài xế', path: '/admin/drivers', icon: '👮‍♂️' },
    { name: 'Đánh giá & Góp ý', path: '/admin/reviews', icon: '⭐' },
    { name: 'Cài đặt hệ thống', path: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="h-20 flex items-center justify-center border-b border-slate-700">
          <h1 className="text-2xl font-black text-blue-500 tracking-tighter">
            GTTM<span className="text-white">ADMIN</span>
          </h1>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu chính</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-slate-800 transition-colors font-bold"
          >
            <span>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header nhỏ phía trên */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
          <h2 className="font-bold text-slate-700 text-lg">Hệ thống quản lý xe trung chuyển</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Xin chào, Admin</span>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              AD
            </div>
          </div>
        </header>

        {/* Nội dung thay đổi (Dashboard, Reviews,...) */}
        <div className="flex-1 overflow-auto p-8 relative">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;