import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import SeatPage from './pages/SeatPage';
import FoodPage from './pages/FoodPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LoginPage from './pages/LoginPage';
import RegisterForm from './pages/RegisterForm';

import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
// import AdminMovies from './pages/admin/AdminMovies';
// import AdminShowtimes from './pages/admin/AdminShowtimes';
// import AdminOrders from './pages/admin/AdminOrders';

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    const token = localStorage.getItem('adminToken');
    return !!token;
  });

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    return "/admin";
  };

  return (
    <Router>
      <ScrollToTop />
      {/* User UI: Navbar + Footer */}
      {!window.location.pathname.startsWith("/admin") && <Navbar />}

      <Routes>
        {/* USER ROUTES */}
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/booking/:movieId" element={<SeatPage />} />
        <Route path="/food" element={<FoodPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/order-success" element={<ConfirmationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* ADMIN ROUTES */}
        
        <Route
          path="/admin/login"
          element={<AdminLogin onLogin={handleAdminLogin} />}
        />
        {isAdminLoggedIn ? (
          <Route path="/admin/dashboard" element={<AdminLayout />}>
            {/* <Route path="movies" element={<AdminMovies />} />
            <Route path="showtimes" element={<AdminShowtimes />} />
            <Route path="orders" element={<AdminOrders />} /> */}
            {/* thêm route khác nếu cần */}
          </Route>
        ) : (
          <Route
            path="/admin/*"
            element={<Navigate to="/admin/login" />}
          />
        )}
        {/* Trang 404 */}
        <Route path="*" element={<div>404 - Trang không tồn tại</div>} />
      </Routes>

      {/* Footer cho user */}
      {!window.location.pathname.startsWith("/admin") && <Footer />}
    </Router>
  );
}

export default App;
