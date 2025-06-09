import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);
      console.log('Login success:', data);
      // Lưu token vào localStorage hoặc cookie
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      alert(`Đăng nhập thành công! Chào mừng ${data.user.name}`);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Đăng nhập thất bại: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-[300px]">
        <h2 className="text-xl font-semibold mb-4 text-center">Đăng nhập</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
          required
        />
        <button className="bg-blue-600 text-white w-full py-2 rounded">Đăng nhập</button>
        <p
          className="text-sm mt-3 text-blue-600 cursor-pointer text-center"
          onClick={() => navigate("/register")}
        >
          Chưa có tài khoản? Đăng ký
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
