// src/features/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { mockApiAdmin } from '../../core/services/mockApiAdmin';

const StatCard = ({ title, value, subtext, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-all hover:-translate-y-1">
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      <p className="text-xs font-bold mt-2 text-slate-400">{subtext}</p>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    mockApiAdmin.getDashboardStats().then(setStats);
    mockApiAdmin.getRecentTrips().then(setTrips);
  }, []);

  if (!stats) return <div className="p-10 text-center text-slate-400">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Tổng quan hệ thống</h1>
        <p className="text-slate-500 mt-1">Giám sát hoạt động vận hành thời gian thực.</p>
      </div>

      {/* Stats Grid - Đã bỏ tiền, thay bằng số liệu vận hành */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tổng chuyến hôm nay" value={stats.totalTrips} subtext="Cập nhật 5p trước" icon="🚕" color="bg-blue-100 text-blue-600"/>
        <StatCard title="Tài xế Online" value={`${stats.onlineDrivers}/${stats.totalDrivers}`} subtext="Đang hoạt động" icon="📡" color="bg-green-100 text-green-600"/>
        <StatCard title="Đánh giá TB" value={stats.avgRating} subtext="Chất lượng dịch vụ" icon="⭐" color="bg-yellow-100 text-yellow-600"/>
        <StatCard title="Cảnh báo/Sự cố" value="0" subtext="Hệ thống ổn định" icon="shield" color="bg-purple-100 text-purple-600"/>
      </div>

      {/* Recent Trips Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-lg text-slate-800 mb-6">Chuyến xe đang chạy gần đây</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3 pl-2">Tài xế & Biển số</th>
                <th className="pb-3">Hành trình (Đón ➝ Trả)</th>
                <th className="pb-3">Trạng thái</th>
                <th className="pb-3 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-600">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                  <td className="py-4 pl-2">
                    <div className="font-bold text-slate-800">{trip.driver}</div>
                    <div className="text-xs text-blue-600 font-mono bg-blue-50 inline-block px-1 rounded mt-0.5">{trip.plate}</div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-slate-700">{trip.start}</span>
                    </div>
                    <div className="w-0.5 h-3 bg-slate-200 ml-[3px] my-0.5"></div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-slate-700">{trip.end}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        trip.status === 'running' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                        trip.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        'bg-red-100 text-red-700'
                    }`}>
                      {trip.status === 'running' ? 'Đang chạy' : trip.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="py-4 text-right text-slate-400 text-xs">{trip.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;