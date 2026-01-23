import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AuthLayout from '../auth/AuthLayout';
import AuthForm from '../auth/AuthForm';
import { mockService } from '../../core/services/mockApi';

const PassengerAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname.includes('register');

  const handleRegisterWithOtp = async (formData) => {
    try {
      // 1. Gửi OTP Lần đầu
      Swal.fire({
        html: `
          <div class="flex items-center justify-center space-x-3">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span class="text-gray-700 font-medium">Đang gửi mã...</span>
          </div>
        `,
        width: '280px',
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: { popup: 'rounded-xl py-4' }
      });

      await mockService.sendOtpEmail(formData.email);

      // 2. NHẬP OTP (Big Input + Timer)
      let timerInterval;
      
      const { value: otpCode } = await Swal.fire({
        title: '', 
        html: `
          <div class="text-center pt-1">
            <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Mã xác thực gửi đến</div>
            <div class="font-bold text-gray-800 text-base truncate px-4 bg-gray-100 py-1 rounded-full inline-block mb-1">${formData.email}</div>
          </div>
        `,
        input: 'text',
        width: '380px',
        padding: '1rem',
        
        inputAttributes: {
          maxlength: '6',
          autocapitalize: 'off',
          autocorrect: 'off',
          placeholder: '••••••',
          style: `
            text-align: center; 
            font-size: 36px;            
            letter-spacing: 16px;       
            font-weight: 700; 
            color: #2563EB;             
            width: 300px;               
            height: 65px;               
            margin: 15px auto 5px auto; 
            background-color: #ffffff; 
            border-radius: 12px;        
            border: 2px solid #E5E7EB;  
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          `
        },
        
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy bỏ',
        showLoaderOnConfirm: true,
        backdrop: `rgba(0, 0, 0, 0.4)`,
        
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          input: 'focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-base shadow-md w-full sm:w-auto mt-3',
          cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 px-4 rounded-lg text-base mt-3',
          actions: 'flex gap-3 justify-center w-full'
        },

        // 👇 LOGIC ĐỒNG HỒ & GỬI LẠI MÃ (Đã sửa)
        didOpen: () => {
          const input = Swal.getInput();
          
          // Chèn nút Gửi lại
          const resendContainer = document.createElement('div');
          resendContainer.className = 'text-center mt-3 mb-1 text-sm';
          resendContainer.innerHTML = `
            <span class="text-gray-400">Chưa nhận được mã?</span>
            <button id="resend-btn" class="ml-1 font-bold text-gray-300 cursor-not-allowed transition-colors" disabled>
              Gửi lại sau <span id="timer-count">120</span>s
            </button>
          `;
          input.parentNode.insertBefore(resendContainer, input.nextSibling);

          const btn = document.getElementById('resend-btn');
          let timeLeft = 120; 

          const startTimer = () => {
            // Reset UI nút về trạng thái đếm ngược
            btn.disabled = true;
            btn.classList.add('text-gray-300', 'cursor-not-allowed');
            btn.classList.remove('text-blue-600', 'hover:text-blue-700', 'cursor-pointer', 'underline', 'text-green-600');
            
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
              timeLeft--;
              
              if (timeLeft <= 0) {
                // Hết giờ -> Mở khóa nút
                clearInterval(timerInterval);
                btn.innerHTML = 'Gửi lại mã ngay';
                btn.disabled = false;
                btn.classList.remove('text-gray-300', 'cursor-not-allowed');
                btn.classList.add('text-blue-600', 'hover:text-blue-700', 'cursor-pointer', 'underline');
              } else {
                // Đang đếm
                btn.innerHTML = `Gửi lại sau <span id="timer-count">${timeLeft}</span>s`;
              }
            }, 1000);
          };

          // Sự kiện click Gửi lại
          btn.addEventListener('click', async () => {
            if (timeLeft > 0) return;

            // 1. UI báo đang gửi
            btn.innerHTML = 'Đang gửi...';
            btn.classList.add('text-gray-400');
            btn.classList.remove('text-blue-600', 'underline');
            
            try {
              // 2. Gọi API gửi lại
              await mockService.sendOtpEmail(formData.email);
              
              // 3. UI báo thành công (Màu xanh lá)
              btn.innerHTML = '✓ Đã gửi lại!';
              btn.classList.remove('text-gray-400');
              btn.classList.add('text-green-600'); // Chữ xanh lá

              // 4. Đợi 1 giây rồi bắt đầu đếm ngược lại ngay lập tức
              setTimeout(() => {
                  timeLeft = 120;
                  startTimer(); 
                  input.focus(); // Focus lại vào ô nhập để tiện gõ
              }, 1000);

            } catch (err) {
              btn.innerHTML = 'Lỗi gửi lại';
              btn.classList.add('text-red-500');
              setTimeout(() => {
                  timeLeft = 0; // Cho phép bấm lại ngay nếu lỗi
                  btn.innerHTML = 'Gửi lại mã ngay';
                  btn.classList.remove('text-red-500');
                  btn.classList.add('text-blue-600');
              }, 2000);
            }
          });

          // Bắt đầu đếm
          startTimer();
          input.focus();
        },

        willClose: () => {
          clearInterval(timerInterval);
        },
        
        preConfirm: async (otp) => {
          try {
            await mockService.verifyOtp(formData.email, otp);
            return true;
          } catch (error) {
            Swal.showValidationMessage(error.message || 'Mã sai');
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      });

      // 3. Thành công
      if (otpCode) {
        Swal.fire({
          html: '<div class="text-gray-600 font-medium mt-2">Đang kích hoạt tài khoản...</div>',
          didOpen: () => Swal.showLoading(),
          timer: 800,
          width: '280px',
          showConfirmButton: false,
          customClass: { popup: 'rounded-xl py-3' }
        });

        await mockService.register(formData);

        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đăng ký hoàn tất.',
          timer: 1500,
          width: '300px',
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-xl shadow-lg',
            title: 'text-xl font-bold text-green-600'
          }
        });

        navigate('/passenger/login');
      }

    } catch (error) {
      Swal.fire({
        icon: 'error',
        text: error.message,
        width: '320px',
        customClass: { popup: 'rounded-xl' },
        confirmButtonColor: '#EF4444'
      });
    }
  };

  return (
    <AuthLayout 
      title={isRegister ? "Tạo tài khoản mới" : "Chào mừng trở lại!"}
      subtitle={isRegister ? "Trải nghiệm đặt xe dễ dàng, nhanh chóng." : "Đăng nhập để đặt chuyến xe tiếp theo."}
      bgColor="bg-blue-600"
      imageMsg="Đưa bạn đến nơi, về đến chốn an toàn."
    >
      <AuthForm 
        role="passenger" 
        type={isRegister ? 'register' : 'login'} 
        onSubmit={isRegister ? handleRegisterWithOtp : undefined}
      />
    </AuthLayout>
  );
};

export default PassengerAuth;