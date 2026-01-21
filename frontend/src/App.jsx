import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Bỏ Navigate vì không dùng nữa

// Import trang Landing Page mới
import LandingPage from './features/LandingPage';

import PassengerAuth from './features/passenger/PassengerAuth';
import DriverAuth from './features/driver/DriverAuth';
import AdminAuth from './features/admin/AdminAuth';
import PassengerHome from './features/passenger/PassengerHome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- TRANG CHỦ: Hiển thị các lựa chọn --- */}
        <Route path="/" element={<LandingPage />} />

        {/* --- CÁC ROUTE CŨ --- */}
        <Route path="/passenger/login" element={<PassengerAuth />} />
        <Route path="/passenger/register" element={<PassengerAuth />} />
        <Route path="/passenger/home" element={<PassengerHome />} />

        <Route path="/driver/login" element={<DriverAuth />} />

        <Route path="/admin/login" element={<AdminAuth />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;