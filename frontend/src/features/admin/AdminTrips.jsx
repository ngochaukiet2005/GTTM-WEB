// src/features/admin/AdminTrips.jsx
import React, { useEffect, useState } from 'react';
import { mockApiAdmin } from '../../core/services/mockApiAdmin';

const AdminTrips = () => {
    const [trips, setTrips] = useState([]);
    
    useEffect(() => {
        // Trong thực tế có thể dùng hàm getAllTrips, ở đây ta tái sử dụng getRecentTrips để demo
        mockApiAdmin.getRecentTrips().then(setTrips); 
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Danh sách Chuyến xe</h2>
                <div className="flex gap-2">
                    <input type="text" placeholder="Tìm theo biển số..." className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <button className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200">Lọc</button>
                </div>
            </div>
            
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th className="px-6 py-4">Mã chuyến</th>
                        <th className="px-6 py-4">Tài xế & Xe</th>
                        <th className="px-6 py-4">Lộ trình</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4 text-right">Thời gian</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {trips.map(trip => (
                        <tr key={trip.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-slate-400 text-sm">#{trip.id.toUpperCase()}</td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-700">{trip.driver}</div>
                                <div className="text-xs bg-slate-100 text-slate-500 inline-block px-1.5 py-0.5 rounded mt-1 border border-slate-200">{trip.plate}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-green-500 text-xs">●</span> 
                                        <span>{trip.start}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-500 text-xs">●</span> 
                                        <span className="font-medium">{trip.end}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                    trip.status === 'running' ? 'bg-blue-100 text-blue-700' :
                                    trip.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                    {trip.status === 'running' ? 'Đang chạy' : trip.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-slate-500">
                                {trip.time}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminTrips;