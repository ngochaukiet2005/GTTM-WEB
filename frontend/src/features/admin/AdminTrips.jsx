// src/features/admin/AdminTrips.jsx
import React, { useEffect, useState } from 'react';
import { mockApiAdmin } from '../../core/services/mockApiAdmin';

const AdminTrips = () => {
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        // Lấy dữ liệu từ mock API
        mockApiAdmin.getRecentTrips().then((data) => {
            // Sắp xếp dữ liệu theo ngày giảm dần trước khi lưu vào state
            const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTrips(sortedData);
        });
    }, []);

    // Logic tính toán trạng thái hiển thị
    const getDisplayStatus = (trip) => {
        const tripDate = new Date(trip.date);
        const today = new Date();
        // Reset giờ về 00:00:00 để so sánh chính xác theo ngày
        today.setHours(0, 0, 0, 0);
        tripDate.setHours(0, 0, 0, 0);

        // Nếu ngày chuyến < ngày hiện tại => Tự động coi là "Hoàn thành"
        if (tripDate < today) {
            return 'Hoàn thành';
        }
        // Ngược lại hiển thị trạng thái gốc (Hoạt động / Dừng hoạt động)
        return trip.status;
    };

    // Hàm gom nhóm chuyến xe theo ngày (Group by Date)
    const groupTripsByDate = () => {
        const groups = {};
        trips.forEach(trip => {
            const dateKey = trip.date; 
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(trip);
        });

        // Trả về mảng các nhóm, key là ngày
        return Object.keys(groups)
            // Sắp xếp ngày mới nhất lên đầu
            .sort((a, b) => new Date(b) - new Date(a))
            .map(date => ({
                date,
                items: groups[date]
            }));
    };

    const groupedTrips = groupTripsByDate();

    // Helper chọn màu badge trạng thái
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Hoạt động':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Dừng hoạt động':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'Hoàn thành':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header chung */}
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-slate-800">Quản lý Chuyến xe</h2>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Tìm theo biển số..." 
                        className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                        Lọc
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors">
                        + Thêm chuyến
                    </button>
                </div>
            </div>

            {/* Loop qua từng nhóm ngày */}
            {groupedTrips.map((group) => (
                <div key={group.date} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header Ngày tháng */}
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                        <span className="text-xl">📅</span>
                        <h3 className="font-bold text-slate-700 capitalize">
                            {/* Format ngày cho đẹp (VD: Thứ Hai, 26/01/2026) */}
                            {new Date(group.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </h3>
                    </div>

                    {/* Bảng danh sách chuyến trong ngày */}
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3">Mã chuyến</th>
                                <th className="px-6 py-3">Tài xế & Xe</th>
                                <th className="px-6 py-3">Lộ trình</th>
                                <th className="px-6 py-3 text-center">Xuất phát</th>
                                <th className="px-6 py-3 text-center">Về bến</th>
                                <th className="px-6 py-3 text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {group.items.map(trip => {
                                const displayStatus = getDisplayStatus(trip);
                                return (
                                    <tr key={trip.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-400 text-sm">#{trip.id.toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700">{trip.driver}</div>
                                            <div className="text-xs text-slate-500 mt-0.5 bg-slate-100 inline-block px-1.5 py-0.5 rounded border border-slate-200">
                                                {trip.plate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {trip.route}
                                        </td>
                                        {/* Giờ xuất phát */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                                {trip.startTime}
                                            </span>
                                        </td>
                                        {/* Giờ về bến */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                                {trip.endTime}
                                            </span>
                                        </td>
                                        {/* Trạng thái */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(displayStatus)}`}>
                                                {displayStatus}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ))}

            {groupedTrips.length === 0 && (
                <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
                    Chưa có dữ liệu chuyến xe nào.
                </div>
            )}
        </div>
    );
};

export default AdminTrips;