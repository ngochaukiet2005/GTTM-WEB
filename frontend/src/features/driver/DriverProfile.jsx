// src/features/driver/DriverProfile.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { mockDriverService } from '../../core/services/mockApiDriver';

const DriverProfile = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    plate: '',
    stationStart: '',
    stationEnd: '',
    gender: 'male' // Mặc định
  });
  const [avatar, setAvatar] = useState('');
  const [rating, setRating] = useState(0);

  // Danh sách các trạm cố định để chọn
  const STATIONS = [
      "Bến xe Miền Tây",
      "Bến xe Miền Đông Mới",
      "Bến xe An Sương",
      "Sân bay Tân Sơn Nhất",
      "Ngã 4 Hàng Xanh"
  ];

  const DESTINATIONS = [
      "Đại học Quốc Gia TP.HCM",
      "KTX Khu B - ĐHQG",
      "Suối Tiên",
      "Đại học Bách Khoa (Cơ sở 2)",
      "Ngã 4 Thủ Đức"
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await mockDriverService.getDriverProfile();
      setFormData({
        name: data.name,
        phone: data.phone,
        email: data.email,
        plate: data.plate,
        stationStart: data.stationStart || STATIONS[0], 
        stationEnd: data.stationEnd || DESTINATIONS[0],
        gender: data.gender || 'male'
      });
      setAvatar(data.avatar);
      setRating(data.rating);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý riêng cho chọn giới tính
  const selectGender = (gender) => {
      setFormData({ ...formData, gender });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('save-btn');
    const originalText = btn.innerText;
    btn.innerText = 'Đang lưu...';
    btn.disabled = true;

    try {
      await mockDriverService.updateDriverProfile(formData);
      
      Swal.fire({
        icon: 'success',
        title: 'Cập nhật thành công!',
        text: 'Hệ thống sẽ phân bổ chuyến dựa trên lộ trình mới của bạn.',
        confirmButtonColor: '#10B981',
        timer: 2000
      });

    } catch (error) {
      Swal.fire('Lỗi', 'Không thể cập nhật hồ sơ', 'error');
    } finally {
      btn.innerText = originalText;
      btn.disabled = false;
    }
  };

  if (loading) return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* HEADER BACKGROUND */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 h-48 relative rounded-b-[30px] shadow-lg">
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="relative">
                <img 
                    src={avatar} 
                    alt="Avatar" 
                    className="w-28 h-28 rounded-full border-4 border-white shadow-md bg-white object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-1">
                    <span>★</span> {rating}
                </div>
              </div>
          </div>
      </div>

      {/* FORM CONTENT */}
      <div className="max-w-2xl mx-auto px-4 mt-16">
          <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-800">{formData.name}</h1>
              <p className="text-slate-500 text-sm">Đối tác tài xế • {formData.plate}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECTION 1: THÔNG TIN XE & LỘ TRÌNH */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <span className="text-xl">🚌</span> Lộ trình hoạt động
                  </h2>
                  
                  <div className="space-y-5">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Biển số xe</label>
                          <input 
                              type="text" 
                              name="plate"
                              value={formData.plate}
                              onChange={handleChange}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:ring-2 focus:ring-green-500 outline-none uppercase tracking-wider"
                              placeholder="VD: 59X1-123.45"
                          />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* BẾN XUẤT PHÁT - DROPDOWN */}
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Bến xuất phát</label>
                              <div className="relative">
                                  <span className="absolute left-3 top-3.5 text-green-600 text-xs">●</span>
                                  <select 
                                      name="stationStart"
                                      value={formData.stationStart}
                                      onChange={handleChange}
                                      className="w-full pl-8 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none appearance-none font-medium text-slate-700 shadow-sm cursor-pointer hover:border-green-400 transition-colors"
                                  >
                                      <option value="" disabled>-- Chọn bến --</option>
                                      {STATIONS.map(st => <option key={st} value={st}>{st}</option>)}
                                  </select>
                                  <div className="absolute right-3 top-4 pointer-events-none">
                                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                  </div>
                              </div>
                          </div>
                          
                          {/* KHU VỰC TRẢ KHÁCH - DROPDOWN */}
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Khu vực trả khách</label>
                              <div className="relative">
                                  <span className="absolute left-3 top-3.5 text-orange-500 text-xs">●</span>
                                  <select 
                                      name="stationEnd"
                                      value={formData.stationEnd}
                                      onChange={handleChange}
                                      className="w-full pl-8 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none appearance-none font-medium text-slate-700 shadow-sm cursor-pointer hover:border-orange-400 transition-colors"
                                  >
                                      <option value="" disabled>-- Chọn khu vực --</option>
                                      {DESTINATIONS.map(dest => <option key={dest} value={dest}>{dest}</option>)}
                                  </select>
                                  <div className="absolute right-3 top-4 pointer-events-none">
                                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <p className="text-xs text-slate-400 italic text-center mt-2">* Hệ thống sẽ ưu tiên ghép khách đi cùng tuyến này.</p>
                  </div>
              </div>

              {/* SECTION 2: THÔNG TIN CÁ NHÂN */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="text-xl">👤</span> Thông tin cá nhân
                  </h2>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                          <input 
                              type="text" 
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                          />
                      </div>
                      
                      {/* GIỚI TÍNH - BUTTON SELECT */}
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Giới tính</label>
                          <div className="flex gap-4">
                              <button 
                                  type="button"
                                  onClick={() => selectGender('male')}
                                  className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${formData.gender === 'male' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}
                              >
                                  Nam 👨
                              </button>
                              <button 
                                  type="button"
                                  onClick={() => selectGender('female')}
                                  className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${formData.gender === 'female' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}
                              >
                                  Nữ 👩
                              </button>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                              <input 
                                  type="text" 
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleChange}
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                              <input 
                                  type="email" 
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                              />
                          </div>
                      </div>
                  </div>
              </div>

              {/* ACTION BUTTON */}
              <button 
                  id="save-btn"
                  type="submit"
                  className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:bg-green-700 transition-all active:scale-[0.98]"
              >
                  Lưu thay đổi
              </button>
          </form>
      </div>
    </div>
  );
};

export default DriverProfile;