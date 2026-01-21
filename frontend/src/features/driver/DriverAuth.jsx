import React from 'react';
import AuthLayout from '../auth/AuthLayout';
import AuthForm from '../auth/AuthForm';

const DriverAuth = () => {
  return (
    <AuthLayout 
      title="Cổng Tài Xế"
      subtitle="Đăng nhập hệ thống điều phối xe."
      bgColor="bg-green-700"
      imageMsg="Đối tác tin cậy, hành trình vững vàng."
    >
      {/* Tài xế chỉ có login */}
      <AuthForm role="driver" type="login" />
    </AuthLayout>
  );
};

export default DriverAuth;