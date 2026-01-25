// src/features/admin/AdminReviews.jsx
import React, { useEffect, useState } from 'react';
import { mockApiAdmin } from '../../core/services/mockApiAdmin';

const AdminReviews = () => {
  const [reviewGroups, setReviewGroups] = useState([]);

  useEffect(() => {
    mockApiAdmin.getAllReviews().then(setReviewGroups);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Phản hồi từ Hành khách</h1>
        <p className="text-slate-500">Lịch sử đánh giá chất lượng dịch vụ theo thời gian.</p>
      </div>
      
      <div className="space-y-12">
        {reviewGroups.map((group) => (
          <div key={group.id} className="relative">
             {/* Date Divider */}
             <div className="sticky top-0 z-10 flex justify-center mb-6">
                <span className="bg-slate-800 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-slate-300/50">
                    {group.date}
                </span>
             </div>

             {/* Timeline Items */}
             <div className="border-l-2 border-slate-200 ml-4 md:ml-6 space-y-8 pb-4">
                {group.items.map((review) => (
                    <div key={review.id} className="relative pl-8 md:pl-10">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-6 w-5 h-5 bg-white border-4 border-blue-500 rounded-full"></div>
                        
                        {/* Review Card */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-400 font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded">{review.time}</span>
                                        <h4 className="font-bold text-slate-800 text-lg">Chuyến xe của {review.driver}</h4>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                        <span>🚗 {review.plate}</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-600 font-medium">{review.route}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100 self-start">
                                    <span className="font-black text-yellow-600 text-lg">{review.rating}</span>
                                    <span className="text-yellow-500">★</span>
                                </div>
                            </div>
                            
                            {/* Comment Box */}
                            <div className="bg-slate-50 p-4 rounded-xl relative">
                                <span className="absolute -top-2 left-6 w-4 h-4 bg-slate-50 rotate-45 transform"></span>
                                <p className="text-slate-700 italic">"{review.comment}"</p>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReviews;