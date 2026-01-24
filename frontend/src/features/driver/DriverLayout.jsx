// src/features/driver/DriverLayout.jsx

import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const DriverLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'Đăng xuất?',
      text: "Bạn muốn kết thúc ca làm việc?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('currentUser');
        navigate('/');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* =========================================
          1. SIDEBAR (DESKTOP ONLY) - TRÁI
         ========================================= */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* LOGO AREA */}
        <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-gradient-to-tr from-green-600 to-teal-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-200">
                    D
                </div>
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Tài Xế</h1>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Driver Portal</p>
                </div>
            </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 space-y-2 py-6">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Menu chính</p>
            
            <SidebarItem 
                to="/driver/home" 
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />} 
                label="Bảng điều khiển" 
                active={location.pathname === '/driver/home'} 
            />
            
            <SidebarItem 
                to="/driver/trip" 
                icon={<><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></>} 
                label="Hành trình chạy" 
                active={location.pathname === '/driver/trip'} 
            />
            
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">Cá nhân</p>

            <SidebarItem 
                to="/driver/profile" 
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />} 
                label="Tài khoản" 
                active={location.pathname === '/driver/profile'} 
            />
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="p-4 border-t border-slate-100">
            <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-medium group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:-translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span>Đăng xuất</span>
            </button>
        </div>
      </aside>

      {/* =========================================
          2. MAIN CONTENT AREA
         ========================================= */}
      <main className="flex-1 md:ml-72 relative min-h-screen">
          {/* Outlet: Nơi nội dung trang con (Home, Trip...) hiển thị */}
          <Outlet />
      </main>

      {/* =========================================
          3. MOBILE NAVIGATION (BOTTOM BAR)
         ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 flex justify-around p-2 pb-5 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-area-bottom">
          <MobileNavItem to="/driver/home" icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />} label="Home" active={location.pathname === '/driver/home'} />
          
          <div className="relative -top-6">
              <Link to="/driver/trip" className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-slate-50 transition-transform active:scale-95 ${location.pathname === '/driver/trip' ? 'bg-green-600 text-white shadow-green-400/40' : 'bg-slate-800 text-white'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
              </Link>
          </div>
          
          <MobileNavItem to="/driver/profile" icon={<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />} label="Tài khoản" active={location.pathname === '/driver/profile'} />
      </div>

    </div>
  );
};

// --- COMPONENT CON (DESKTOP) ---
const SidebarItem = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold text-sm relative overflow-hidden group ${
      active 
        ? 'bg-green-50 text-green-700 shadow-sm' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-green-500 rounded-r-full"></div>}
    <svg xmlns="http://www.w3.org/2000/svg" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 shrink-0 transition-colors">
        {icon}
    </svg>
    <span className="truncate">{label}</span>
  </Link>
);

// --- COMPONENT CON (MOBILE) ---
const MobileNavItem = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${active ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'}`}>
    <svg xmlns="http://www.w3.org/2000/svg" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6 transition-transform ${active ? '-translate-y-1' : ''}`}>
        {icon}
    </svg>
    <span className="text-[10px] font-bold">{label}</span>
  </Link>
);

export default DriverLayout;