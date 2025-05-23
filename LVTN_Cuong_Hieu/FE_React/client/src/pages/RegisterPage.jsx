import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    // Giả lập đăng ký
    alert("Đăng ký thành công!");
    navigate("/login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow-md w-[300px]"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Đăng ký</h2>
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
        <button className="bg-green-600 text-white w-full py-2 rounded">
          Đăng ký
        </button>
        <p
          className="text-sm mt-3 text-blue-600 cursor-pointer text-center"
          onClick={() => navigate("/login")}
        >
          Đã có tài khoản? Đăng nhập
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
