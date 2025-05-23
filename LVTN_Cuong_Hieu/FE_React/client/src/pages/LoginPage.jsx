import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Giả lập login thành công
    if (email === "admin@gmail.com" && password === "123456") {
      localStorage.setItem("user", JSON.stringify({ email }));
      navigate("/homepage"); // về trang chủ
    } else {
      alert("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-[300px]"
      >
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
        <button className="bg-blue-600 text-white w-full py-2 rounded">
          Đăng nhập
        </button>
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
