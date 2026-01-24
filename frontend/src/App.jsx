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
import PassengerProfile from './features/passenger/PassengerProfile';
import TripHistory from './features/passenger/TripHistory';
import DriverHome from './features/driver/DriverHome';
import DriverTrip from './features/driver/DriverTrip';
import DriverLayout from './features/driver/DriverLayout';

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
            <Route path="profile" element={<PassengerProfile />} />
        </Route>

        {/* DRIVER */}
        <Route path="/driver" element={<DriverLayout />}>
             {/* Trang chủ mặc định khi vào /driver là về home */}
             <Route index element={<Navigate to="home" replace />} />
             
             {/* Các trang con, chúng sẽ hiện vào chỗ <Outlet /> */}
             <Route path="home" element={<DriverHome />} />
             <Route path="trip" element={<DriverTrip />} />
             
             {/* Nếu có profile thì thêm vào đây */}
             {/* <Route path="profile" element={<DriverProfile />} /> */}
        </Route>
        
        {/* 👇 ROUTE MỚI CHO ADMIN */}
        <Route path="/admin/reviews" element={<AdminReviews />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;