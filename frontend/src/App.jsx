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

import DriverLayout from './features/driver/DriverLayout';
import DriverHome from './features/driver/DriverHome';
import DriverTrip from './features/driver/DriverTrip';
import DriverHistory from './features/driver/DriverHistory'; // 👈 Import mới
import DriverProfile from './features/driver/DriverProfile';
import AdminReviews from './features/admin/AdminReviews';
import AdminLayout from './features/admin/AdminLayout';
import AdminDashboard from './features/admin/AdminDashboard';
import AdminTrips from './features/admin/AdminTrips';
import AdminDrivers from './features/admin/AdminDrivers';
import AdminProfile from './features/admin/AdminProfile'; 

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
             <Route index element={<Navigate to="home" replace />} />
             <Route path="home" element={<DriverHome />} />
             <Route path="trip" element={<DriverTrip />} />
             <Route path="history" element={<DriverHistory />} /> {/* 👈 Route mới */}
              <Route path="profile" element={<DriverProfile />} />
        </Route>
        
        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="trips" element={<AdminTrips />} />
            <Route path="drivers" element={<AdminDrivers />} />
            <Route path="accounts" element={<AdminProfile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;