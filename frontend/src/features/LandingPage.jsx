import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden flex flex-col justify-center items-center font-sans selection:bg-blue-100">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100 blur-[100px] opacity-60 mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-100 blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-100 blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl px-4 md:px-6 flex flex-col items-center">
        
        {/* --- HEADER SECTION --- */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl">
          <div className="inline-flex items-center justify-center p-2 px-4 mb-6 rounded-full bg-white shadow-sm border border-slate-100">
            <span className="flex w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">HỆ THỐNG ĐẶT XE TRUNG CHUYỂN</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-6 leading-tight tracking-tight">
            Đặt Xe Trung Chuyển <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Thông Minh & Tốc Độ</span>
          </h1>
          
          <p className="text-slate-500 text-base md:text-xl leading-relaxed max-w-2xl mx-auto">
            Giải pháp di chuyển nội khu miễn phí, kết nối hành khách và tài xế trong thời gian thực với công nghệ định vị chính xác.
          </p>
        </div>

        {/* --- CARDS SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* CARD 1: HÀNH KHÁCH */}
          <RoleCard 
            to="/passenger/login"
            color="blue"
            icon={<UserIcon />}
            title="Hành Khách"
            desc="Đặt chuyến, xem lộ trình và theo dõi xe đến đón."
            delay="0"
          />

          {/* CARD 2: TÀI XẾ */}
          <RoleCard 
            to="/driver/login"
            color="emerald"
            icon={<CarIcon />} 
            title="Tài Xế"
            desc="Nhận cuốc xe, điều hướng bản đồ và quản lý chuyến đi."
            delay="100"
          />

          {/* CARD 3: QUẢN TRỊ */}
          <RoleCard 
            to="/admin/login"
            color="violet"
            icon={<ShieldCheckIcon />}
            title="Quản Trị Viên"
            desc="Giám sát hệ thống, xem báo cáo và quản lý người dùng."
            delay="200"
          />

        </div>

        {/* --- FOOTER SIMPLE --- */}
        <div className="mt-16 text-center border-t border-slate-200/60 pt-8 w-full max-w-md">
          <p className="text-sm text-slate-400 font-medium">
            © 2026 Hệ thống đặt xe trung chuyển. Developed by Group 3.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS & ICONS ---

const RoleCard = ({ to, color, icon, title, desc, delay }) => {
  const colors = {
    blue: "hover:border-blue-500/50 hover:shadow-blue-200 group-hover:bg-blue-600 text-blue-600 bg-blue-50",
    emerald: "hover:border-emerald-500/50 hover:shadow-emerald-200 group-hover:bg-emerald-600 text-emerald-600 bg-emerald-50",
    violet: "hover:border-violet-500/50 hover:shadow-violet-200 group-hover:bg-violet-600 text-violet-600 bg-violet-50",
  };

  const bgHover = {
    blue: "group-hover:text-blue-600",
    emerald: "group-hover:text-emerald-600",
    violet: "group-hover:text-violet-600",
  }

  return (
    <Link 
      to={to} 
      className={`group relative flex flex-col p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-colors duration-300 ${colors[color].split(' ').slice(2).join(' ')} group-hover:text-white group-hover:scale-110 group-hover:rotate-3`}>
        {icon}
      </div>
      
      <h2 className={`text-2xl font-bold text-slate-800 mb-3 transition-colors ${bgHover[color]}`}>
        {title}
      </h2>
      
      <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
        {desc}
      </p>

      <div className="flex items-center text-sm font-bold text-slate-300 group-hover:text-inherit transition-colors">
        <span>Truy cập ngay</span>
        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </Link>
  );
};

// ICON: HÀNH KHÁCH
const UserIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// ICON: TÀI XẾ (ĐÃ THÊM MỚI Ở ĐÂY)
const CarIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l2-5h10l2 5M5 10h14M5 10v9a1 1 0 001 1h2a1 1 0 001-1v-2h6v2a1 1 0 001 1h2a1 1 0 001-1v-9" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);

// ICON: QUẢN TRỊ
const ShieldCheckIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default LandingPage;