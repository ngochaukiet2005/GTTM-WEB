// src/features/admin/AdminDrivers.jsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { mockApiAdmin } from '../../core/services/mockApiAdmin';

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = () => {
    mockApiAdmin.getAllDrivers().then(setDrivers);
  };

  const handleAddDriver = async () => {
    // Dùng SweetAlert2 để làm Form nhập nhanh
    const { value: formValues } = await Swal.fire({
      title: 'Thêm tài xế mới',
      html:
        '<input id="swal-name" class="swal2-input" placeholder="Họ và tên">' +
        '<input id="swal-phone" class="swal2-input" placeholder="Số điện thoại">' +
        '<input id="swal-email" class="swal2-input" placeholder="Email">' +
        '<input id="swal-password" class="swal2-input" placeholder="Mật khẩu">' +
        '<input id="swal-plate" class="swal2-input" placeholder="Biển số xe (VD: 59X1-123.45)">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Tạo tài khoản',
      preConfirm: () => {
        return {
          name: document.getElementById('swal-name').value,
          phone: document.getElementById('swal-phone').value,
          email: document.getElementById('swal-email').value,
          password: document.getElementById('swal-password').value,
          plate: document.getElementById('swal-plate').value
        }
      }
    });

    if (formValues) {
        if(!formValues.name || !formValues.phone) return Swal.fire('Lỗi', 'Vui lòng điền đủ thông tin', 'error');
        await mockApiAdmin.createDriver(formValues);
        Swal.fire('Thành công', 'Đã tạo tài khoản tài xế mới.', 'success');
        loadDrivers();
    }
  };

  const handleToggleLock = async (driver) => {
    const action = driver.status === 'active' ? 'KHÓA' : 'MỞ KHÓA';
    const result = await Swal.fire({
        title: `Xác nhận ${action}?`,
        text: `Bạn muốn ${action.toLowerCase()} tài khoản ${driver.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: driver.status === 'active' ? '#d33' : '#3085d6',
    });

    if (result.isConfirmed) {
        await mockApiAdmin.toggleLockDriver(driver.id);
        loadDrivers();
        Swal.fire('Đã cập nhật', `Tài khoản đã được ${action.toLowerCase()}.`, 'success');
    }
  };

  const handleDelete = async (driver) => {
    const result = await Swal.fire({
        title: 'Xóa vĩnh viễn?',
        text: "Hành động này không thể hoàn tác!",
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa ngay'
    });
    if(result.isConfirmed){
        await mockApiAdmin.deleteDriver(driver.id);
        loadDrivers();
        Swal.fire('Đã xóa', 'Tài khoản đã bị xóa khỏi hệ thống.', 'success');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Quản lý Tài xế</h1>
            <p className="text-slate-500">Kiểm soát danh sách và trạng thái tài khoản.</p>
        </div>
        <button onClick={handleAddDriver} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all">
            <span>+</span> Thêm tài xế
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {drivers.map(driver => (
            <div key={driver.id} className={`relative bg-white p-6 rounded-2xl border transition-all hover:shadow-lg ${driver.status === 'locked' ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    driver.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {driver.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <img src={`https://ui-avatars.com/api/?name=${driver.name}&background=random&size=128`} className="w-16 h-16 rounded-full border-4 border-white shadow-sm" alt="" />
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">{driver.name}</h3>
                        <p className="text-slate-500 text-sm font-mono">{driver.plate}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-xs text-slate-400 uppercase font-bold">Chuyến đi</p>
                        <p className="font-black text-slate-800 text-lg">{driver.trips}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-xs text-slate-400 uppercase font-bold">Đánh giá</p>
                        <div className="flex items-center gap-1 font-black text-slate-800 text-lg">
                            <span>{driver.rating}</span>
                            <span className="text-yellow-400 text-sm">★</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={() => handleToggleLock(driver)}
                        className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors ${
                            driver.status === 'active' 
                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                    >
                        {driver.status === 'active' ? '🔒 Khóa TK' : '🔓 Mở khóa'}
                    </button>
                    <button 
                        onClick={() => handleDelete(driver)}
                        className="w-12 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDrivers;