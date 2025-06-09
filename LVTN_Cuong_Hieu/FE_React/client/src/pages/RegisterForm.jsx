import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";
import { registerUser } from '../services/authService'; // nhớ đúng đường dẫn

export default function RegisterForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
  try {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      address: data.address, // 👈 Thêm input field này
      birthdate: data.dob, // 👈 Đổi từ dob -> birthdate
      password: data.password,
      password_confirmation: data.confirmPassword, // 👈 Laravel cần tên này
    };

    console.log("Gửi lên:", payload);
    await registerUser(payload);
    alert('Đăng ký thành công!');
    navigate('/login');
  } catch (error) {
    console.error("Lỗi:", error);
    alert('Đăng ký thất bại. Vui lòng thử lại.');
  }
};


  return (
    <div className="max-w-md mx-auto bg-white p-6 mt-8 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Đăng Ký Tài Khoản</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="text"
          placeholder="Nhập Họ và tên"
          {...register('name', { required: 'Bắt buộc nhập họ tên' })}
          className="w-full border p-2 rounded"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

        <input
          type="email"
          placeholder="Nhập Email"
          {...register('email', { required: 'Bắt buộc nhập email' })}
          className="w-full border p-2 rounded"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

        <input
          type="text"
          placeholder="Nhập Số điện thoại"
          {...register('phone', { required: 'Bắt buộc nhập số điện thoại' })}
          className="w-full border p-2 rounded"
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}

        <div className="flex gap-4">
          <label className="flex items-center gap-1">
            <input type="radio" value="Nam" {...register('gender')} />
            Nam
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" value="Nữ" {...register('gender')} />
            Nữ
          </label>
        </div>

        <input
          type="date"
          {...register('dob', { required: 'Bắt buộc chọn ngày sinh' })}
          className="w-full border p-2 rounded"
        />
        {errors.dob && <p className="text-red-500 text-sm">{errors.dob.message}</p>}

        <input
          type="text"
          placeholder="Nhập địa chỉ"
          {...register('address', { required: 'Bắt buộc nhập địa chỉ' })}
          className="w-full border p-2 rounded"
        />
        {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}

        <input
          type="password"
          placeholder="Nhập Mật khẩu"
          {...register('password', { required: 'Bắt buộc nhập mật khẩu' })}
          className="w-full border p-2 rounded"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          {...register('confirmPassword', {
            validate: value => value === watch('password') || 'Mật khẩu không khớp',
          })}
          className="w-full border p-2 rounded"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
        )}

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" {...register('agree', { required: true })} />
          <span>
            Bằng việc đăng ký tài khoản, tôi đồng ý với <span className="text-blue-600">Điều khoản dịch vụ</span> và <span className="text-blue-600">Chính sách bảo mật</span>
          </span>
        </label>
        {errors.agree && <p className="text-red-500 text-sm">Bạn cần đồng ý điều khoản</p>}

        <button type="submit" className="w-full bg-[#D89372] text-white py-2 rounded">
          HOÀN THÀNH
        </button>
      </form>
    </div>
  );
}
