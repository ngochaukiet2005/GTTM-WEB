import React from 'react';
import AuthLayout from '../auth/AuthLayout';
import AuthForm from '../auth/AuthForm';

const AdminAuth = () => {
  return (
    <AuthLayout 
      title="Quản Trị Viên"
      subtitle="Đăng nhập vào hệ thống quản lý trung tâm."
      bgColor="bg-purple-900"
      imageMsg="Quản lý toàn diện, giám sát thời gian thực."
    >
      {/* Admin chỉ có login */}
      <AuthForm role="admin" type="login" />
    </AuthLayout>
  );
};

export default AdminAuth;