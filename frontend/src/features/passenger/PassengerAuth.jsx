import React from 'react';
import { useLocation } from 'react-router-dom';
import AuthLayout from '../auth/AuthLayout';
import AuthForm from '../auth/AuthForm';

const PassengerAuth = () => {
  const location = useLocation();
  const isRegister = location.pathname.includes('register');

  return (
    <AuthLayout 
      title={isRegister ? "Tạo tài khoản mới" : "Chào mừng trở lại!"}
      subtitle={isRegister ? "Trải nghiệm đặt xe dễ dàng, nhanh chóng." : "Đăng nhập để đặt chuyến xe tiếp theo."}
      bgColor="bg-blue-600"
      imageMsg="Đưa bạn đến nơi, về đến chốn an toàn."
    >
      <AuthForm role="passenger" type={isRegister ? 'register' : 'login'} />
    </AuthLayout>
  );
};

export default PassengerAuth;