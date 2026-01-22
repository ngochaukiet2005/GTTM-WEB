// src/features/admin/AdminReviews.jsx

import React, { useEffect, useState } from 'react';
import { mockService } from '../../core/services/mockApi';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    mockService.getAllReviews().then(setReviews);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Phản hồi khách hàng</h1>
        
        <div className="grid gap-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500">Chưa có đánh giá nào.</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                    {review.rating}
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-800">Chuyến đi của {review.driverName}</h3>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-yellow-500 text-sm">{'⭐'.repeat(review.rating)}</span>
                        <span className="text-gray-300 text-sm">{'⭐'.repeat(5 - review.rating)}</span>
                    </div>
                    {review.comment && (
                        <p className="text-gray-600 italic mb-2">"{review.comment}"</p>
                    )}
                    <p className="text-xs text-gray-400">{review.date}</p>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;