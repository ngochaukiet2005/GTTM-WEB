// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './features/LandingPage';
import PassengerAuth from './features/passenger/PassengerAuth';
import DriverAuth from './features/driver/DriverAuth';
import AdminAuth from './features/admin/AdminAuth';

import PassengerLayout from './features/passenger/PassengerLayout';
import PassengerDashboard from './features/passenger/PassengerDashboard';
import PassengerBooking from './features/passenger/PassengerBooking'; 
import TripHistory from './features/passenger/TripHistory';
import DriverHome from './features/driver/DriverHome';

// 👇 IMPORT MỚI
import AdminReviews from './features/admin/AdminReviews';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* AUTH */}
        <Route path="/passenger/login" element={<PassengerAuth />} />
        <Route path="/passenger/register" element={<PassengerAuth />} />
        <Route path="/driver/login" element={<DriverAuth />} />
        <Route path="/admin/login" element={<AdminAuth />} />

        {/* PASSENGER */}
        <Route path="/passenger" element={<PassengerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PassengerDashboard />} />
            <Route path="booking" element={<PassengerBooking />} /> 
            <Route path="history" element={<TripHistory />} />
            <Route path="profile" element={<div className="p-8 text-center">Trang cá nhân (Đang phát triển)</div>} />
        </Route>

        {/* DRIVER */}
        <Route path="/driver/home" element={<DriverHome />} />
        
        {/* 👇 ROUTE MỚI CHO ADMIN */}
        <Route path="/admin/reviews" element={<AdminReviews />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;